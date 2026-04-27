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
};

type AskGeminiChunk = (chunk: string) => void;
type AskGeminiDone = () => void;
type AskGeminiError = (error: unknown) => void;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function scanStack(stack: string[], monthlySpend: number): Promise<ScanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stack, monthlySpend }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Scan request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return {
    alerts: Array.isArray(data?.alerts) ? data.alerts : [],
    mermaidGraph: typeof data?.mermaidGraph === 'string' ? data.mermaidGraph : '',
  };
}

export async function generateInsights(
  alerts: unknown[],
  monthlyCost: number,
  implementedSavings: number
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alerts, monthlyCost, implementedSavings }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Insights request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return typeof data?.markdown === 'string' ? data.markdown : '';
}

export async function generateDigest(alerts: unknown[]): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/digest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alerts }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Digest request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return typeof data?.markdown === 'string' ? data.markdown : '';
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
