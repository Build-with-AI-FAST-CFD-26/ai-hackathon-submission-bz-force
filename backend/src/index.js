const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "[WARN] GEMINI_API_KEY is missing. Gemini endpoints will return an error until it is set.",
  );
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

function getGeminiOrRespond(res) {
  if (!genAI) {
    res.status(500).json({
      error: "Gemini client is not configured. Missing GEMINI_API_KEY.",
    });
    return null;
  }
  return genAI;
}

function parseJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "stacksense-backend" });
});

app.post("/api/scan", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      return;
    }

    const { stack, monthlySpend } = req.body || {};

    if (
      !Array.isArray(stack) ||
      stack.some((item) => typeof item !== "string")
    ) {
      return res.status(400).json({
        error: "Invalid request body. 'stack' must be an array of strings.",
      });
    }

    if (
      typeof monthlySpend !== "number" ||
      Number.isNaN(monthlySpend) ||
      monthlySpend < 0
    ) {
      return res.status(400).json({
        error:
          "Invalid request body. 'monthlySpend' must be a non-negative number.",
      });
    }

    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            alerts: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  title: { type: SchemaType.STRING },
                  impactLevel: {
                    type: SchemaType.STRING,
                    enum: ["High", "Medium", "Low"],
                  },
                  estimatedSavings: { type: SchemaType.NUMBER },
                  actionDescription: { type: SchemaType.STRING },
                  category: {
                    type: SchemaType.STRING,
                    enum: ["FinOps", "DevOps", "Security"],
                  },
                },
                required: [
                  "id",
                  "title",
                  "impactLevel",
                  "estimatedSavings",
                  "actionDescription",
                  "category",
                ],
              },
            },
            mermaidGraph: { type: SchemaType.STRING },
          },
          required: ["alerts", "mermaidGraph"],
        },
        temperature: 0.3,
      },
      systemInstruction: [
        {
          text:
            "You are an expert technical AI architect reviewing a startup's technology stack. " +
            "Identify specific optimization opportunities, deprecated tools, architecture risks, and concrete cost-saving measures. " +
            "Categorize every alert into exactly one of three buckets: FinOps (cost), DevOps (velocity), or Security (risk). " +
            "Also generate a valid Mermaid flowchart string using graph TD syntax that maps the conceptual connections between the provided stack tools. " +
            "Be practical and specific. Base analysis on the provided stack and monthly spend. " +
            "Return only valid JSON matching the required schema.",
        },
      ],
    });

    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Analyze this startup stack and spending profile. Return 4-8 alerts ordered by estimatedSavings descending.\\n" +
                `Stack: ${JSON.stringify(stack)}\\n` +
                `Monthly spend: ${monthlySpend}`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = parseJsonSafely(raw);

    const alerts = Array.isArray(parsed?.alerts) ? parsed.alerts : [];
    res.json({ alerts, mermaidGraph: typeof parsed?.mermaidGraph === 'string' ? parsed.mermaidGraph : '' });
  } catch (error) {
    console.error("/api/scan failed:", error?.message || error);
    res.status(500).json({
      error: "Failed to scan stack with Gemini.",
      detail: error?.message,
    });
  }
});

app.post("/api/insights", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      return;
    }

    const { alerts, monthlyCost, implementedSavings } = req.body || {};

    if (!Array.isArray(alerts)) {
      return res.status(400).json({ error: "Invalid request body. 'alerts' must be an array." });
    }

    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
      },
      systemInstruction: [
        {
          text:
            "You are a fractional CTO writing a weekly update to Paul, the business co-founder handling YC applications and investor updates. " +
            "Synthesize the technical alerts and burn-rate numbers into a 3-paragraph executive summary focused strictly on: 1) runway impact, 2) unresolved security or tech debt risks that could hurt due diligence, and 3) engineering velocity. " +
            "Write in polished markdown, keep it accessible for a non-technical founder, and avoid jargon unless it directly supports the business takeaway.",
        },
      ],
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Current alerts:\n" +
                JSON.stringify(alerts, null, 2) +
                "\n\nMonthly cost: " +
                monthlyCost +
                "\nImplemented savings: " +
                implementedSavings,
            },
          ],
        },
      ],
    });

    res.json({ markdown: result.response.text() });
  } catch (error) {
    console.error("/api/insights failed:", error?.message || error);
    res.status(500).json({ error: "Failed to generate insights markdown.", detail: error?.message });
  }
});

app.post("/api/digest", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      return;
    }

    const { alerts } = req.body || {};

    if (!Array.isArray(alerts)) {
      return res.status(400).json({ error: "Invalid request body. 'alerts' must be an array." });
    }

    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
      },
      systemInstruction: [
        {
          text:
            "You are a fractional CTO writing an update to Paul, the non-technical business co-founder. " +
            "Synthesize the technical alerts into a short 3-paragraph executive summary focused strictly on business impact: runway saved, critical risks mitigated, and engineering velocity. " +
            "Return the output as polished markdown.",
        },
      ],
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Weekly digest alerts:\n" + JSON.stringify(alerts, null, 2),
            },
          ],
        },
      ],
    });

    res.json({ markdown: result.response.text() });
  } catch (error) {
    console.error("/api/digest failed:", error?.message || error);
    res.status(500).json({ error: "Failed to generate weekly digest.", detail: error?.message });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      return;
    }

    const { alertContext, question } = req.body || {};

    if (!alertContext || typeof alertContext !== "object") {
      return res.status(400).json({
        error: "Invalid request body. 'alertContext' must be an object.",
      });
    }

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Invalid request body. 'question' must be a non-empty string.",
      });
    }

    const model = client.getGenerativeModel({
      model: "gemini-2.5-pro-preview-03-25",
      generationConfig: {
        temperature: 0.4,
      },
      systemInstruction: [
        {
          text:
            "You are a senior technical AI architect. Provide deep, practical reasoning for startup engineering decisions. " +
            "Use the provided alert context to ground your answer and suggest concrete steps, tradeoffs, and risks.",
        },
      ],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    let closed = false;
    req.on("close", () => {
      closed = true;
    });

    const streamResult = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Alert context:\\n" +
                JSON.stringify(alertContext, null, 2) +
                "\\n\\nUser question:\\n" +
                question,
            },
          ],
        },
      ],
    });

    for await (const chunk of streamResult.stream) {
      if (closed) {
        break;
      }

      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\\n\\n`);
      }
    }

    if (!closed) {
      res.write("event: done\\ndata: [DONE]\\n\\n");
      res.end();
    }
  } catch (error) {
    console.error("/api/ask failed:", error);

    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Failed to process ask request with Gemini." });
    }

    res.write(
      `event: error\\ndata: ${JSON.stringify({ error: "Gemini streaming request failed." })}\\n\\n`,
    );
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`StackSense backend listening on http://localhost:${PORT}`);
});
