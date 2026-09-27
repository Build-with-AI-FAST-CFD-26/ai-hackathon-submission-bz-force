export type ScanAlert = {
  id: string;
  title: string;
  impactLevel: "High" | "Medium" | "Low";
  estimatedSavings: number;
  actionDescription: string;
  category: "FinOps" | "DevOps" | "Security";
};

export type ScanResponse = {
  alerts: ScanAlert[];
  mermaidGraph: string;
  meta: ApiMeta;
};

export type ApiMeta = { mode: OperatingMode; generatedAt: string };
type ApiSuccess<T> = { data: T; meta: ApiMeta };

export class ApiRequestError extends Error {
  constructor(public status: number, public code: string, message: string, public retryable: boolean) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export type BusinessStateItem = {
  type: 'Lead' | 'Deadline' | 'Task' | 'Promise';
  item: string;
};

export type FounderSyncResponse = {
  paulActions: string[];
  coordinationAlerts: string[];
};

type AskGeminiChunk = (chunk: string) => void;
type AskGeminiDone = () => void;
type AskGeminiError = (error: unknown) => void;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

async function requestJson<T>(path: string, body: unknown): Promise<ApiSuccess<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      payload?.error?.code || 'REQUEST_FAILED',
      payload?.error?.message || 'StackSense could not complete that request.',
      Boolean(payload?.error?.retryable),
    );
  }
  return payload as ApiSuccess<T>;
}

export async function scanStack(stack: string[], monthlySpend: number): Promise<ScanResponse> {
  const response = await requestJson<Omit<ScanResponse, 'meta'>>('/api/scan', { stack, monthlySpend });
  const data = response.data;
  return {
    alerts: Array.isArray(data?.alerts) ? data.alerts : [],
    mermaidGraph: typeof data?.mermaidGraph === 'string' ? data.mermaidGraph : '',
    meta: response.meta,
  };
}

export async function generateInsights(
  alerts: unknown[],
  monthlyCost: number,
  implementedSavings: number
): Promise<string> {
  const response = await requestJson<{ markdown: string }>('/api/insights', { alerts, monthlyCost, implementedSavings });
  const data = response.data;
  return typeof data?.markdown === 'string' ? data.markdown : '';
}

export async function generateDigest(alerts: unknown[]): Promise<string> {
  const response = await requestJson<{ markdown: string }>('/api/digest', { alerts });
  const data = response.data;
  return typeof data?.markdown === 'string' ? data.markdown : '';
}

export async function generateDiligence(alerts: unknown[], stack: unknown[]): Promise<string> {
  const response = await requestJson<{ markdown: string }>('/api/diligence', { alerts, stack });
  const data = response.data;
  return typeof data?.markdown === 'string' ? data.markdown : '';
}

export async function syncFounders(
  businessState: BusinessStateItem[],
  alerts: unknown[]
): Promise<FounderSyncResponse> {
  const response = await requestJson<FounderSyncResponse>('/api/sync', { businessState, alerts });
  const data = response.data;
  return {
    paulActions: Array.isArray(data?.paulActions) ? data.paulActions : [],
    coordinationAlerts: Array.isArray(data?.coordinationAlerts) ? data.coordinationAlerts : [],
  };
}

export async function askGemini(
  alertContext: unknown,
  question: string,
  onChunk: AskGeminiChunk,
  onComplete?: AskGeminiDone,
  onError?: AskGeminiError
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ alertContext, question }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Ask request failed (${response.status}): ${errorBody}`);
    }

    if (!response.body) {
      throw new Error("Streaming response body is not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const eventBlock of events) {
        let eventType = "message";
        const dataLines: string[] = [];

        for (const line of eventBlock.split("\n")) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
          }
        }

        const data = dataLines.join("\n");
        if (!data) {
          continue;
        }

        if (eventType === "done") {
          onComplete?.();
          return;
        }

        if (eventType === "error") {
          const payload = safeJsonParse<{ error?: string }>(data);
          throw new Error(payload?.error || "Gemini streaming request failed.");
        }

        const payload = safeJsonParse<{ text?: string }>(data);
        const chunk = payload?.text ?? data;
        if (chunk) {
          onChunk(chunk);
        }
      }
    }

    onComplete?.();
  } catch (error) {
    onError?.(error);
    throw error;
  }
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
import type { OperatingMode } from '../config/operatingMode';
