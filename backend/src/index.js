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

function buildMockScanResponse(stack, monthlySpend) {
  const fallbackGraph =
    "graph TD; Vercel[\"Vercel (Pro)\"] --> Firebase[\"Firebase\"]; Firebase --> OpenAI[\"OpenAI API\"]; OpenAI --> Pinecone[\"Pinecone Vector DB\"]; Pinecone --> Mailchimp[\"Mailchimp\"];";

  return {
    alerts: [
      {
        id: "mock-alert-1",
        title: "Drop Vercel Pro for the presentation stack",
        impactLevel: "High",
        estimatedSavings: 150,
        actionDescription:
          "Move the landing flow and demo surfaces to Firebase Hosting or Cloud Run to remove the Vercel Pro subscription.",
        category: "FinOps",
      },
      {
        id: "mock-alert-2",
        title: "Consolidate OpenAI traffic through Vertex AI",
        impactLevel: "High",
        estimatedSavings: 500,
        actionDescription:
          "Route model calls through Vertex AI so you can standardize billing, reduce vendor sprawl, and simplify policy management.",
        category: "DevOps",
      },
      {
        id: "mock-alert-3",
        title: "Migrate Pinecone workloads to pgvector",
        impactLevel: "Medium",
        estimatedSavings: 250,
        actionDescription:
          "Use Postgres + pgvector for the current demo corpus to reduce infrastructure overhead and make diligence easier.",
        category: "Security",
      },
    ],
    mermaidGraph: fallbackGraph,
    meta: {
      stack,
      monthlySpend,
      offlineMode: true,
    },
  };
}

function buildMockInsightsMarkdown(alerts, monthlyCost, implementedSavings) {
  return [
    "## Weekly Executive Summary for Paul",
    "The current stack is pointing to a clear runway win: the biggest immediate savings come from removing the Vercel Pro layer, consolidating model spend, and simplifying the vector search path. Even a partial implementation of these changes turns the burn profile from a scattered set of vendor payments into a much tighter operating plan.",
    "The main diligence risk is unnecessary tech sprawl. Multiple external services handling core workflow logic creates avoidable questions during fundraising and due diligence, especially when there is a simpler platform path available for hosting, model access, and data retrieval. Cleaning this up reduces the number of things investors can worry about.",
    "Engineering velocity should improve once the team stops maintaining duplicate infrastructure. A smaller surface area means fewer deployment hops, less cross-service debugging, and faster iteration on product work. In practical terms, the team will spend more time shipping and less time stitching systems together.",
    "",
    `*Alerts reviewed:* ${alerts.length}  `,
    `*Monthly cost:* $${Number(monthlyCost || 0).toLocaleString()}  `,
    `*Implemented savings:* $${Number(implementedSavings || 0).toLocaleString()}`,
  ].join("\n\n");
}

function buildMockDigestMarkdown(alerts) {
  return [
    "## Weekly Digest for Paul",
    "Runway improved this week because the stack now has a clear path to remove expensive overlap in hosting, model usage, and retrieval tooling. The practical takeaway is that the burn curve becomes more predictable once the team standardizes on fewer vendors.",
    "We also reduced diligence risk by identifying places where third-party tooling can be simplified or eliminated. That matters because investors and YC reviewers tend to read unnecessary infrastructure as future maintenance debt.",
    "Finally, the team should move faster after the stack is tightened. Fewer vendors means fewer moving parts, which means quicker deployments, less debugging, and more product time.",
    "",
    `*Alerts summarized:* ${alerts.length}`,
  ].join("\n\n");
}

function buildMockDiligenceMarkdown(alerts, stack) {
  const stackList = Array.isArray(stack) && stack.length > 0 ? stack.join(', ') : 'the current demo stack';

  return [
    "# Technical Due Diligence",
    "## 1. Current Architecture Choices",
    `Our current architecture centers on ${stackList}. For the product and the live demo, this keeps the system intentionally lean while still allowing us to move quickly on feature validation, customer conversations, and integration work. We are using a small set of managed services so we can spend our time shipping product rather than operating infrastructure.`,
    "## 2. Cost Management & FinOps",
    `The present alert set contains ${alerts.length} active optimization signals. The main focus is to reduce duplicated spend, keep hosting and inference costs visible, and prioritize changes that directly improve runway. The operating goal is to maintain a simple cost structure that can scale without introducing billing surprises or hidden vendor sprawl.`,
    "## 3. Scalability & Technical Debt Mitigation",
    "We are actively reducing technical debt by removing unnecessary platform dependencies, consolidating core workloads, and favoring managed primitives where they improve reliability. This lowers diligence risk because the architecture becomes easier to explain, easier to maintain, and easier to scale as customer demand grows.",
  ].join("\n\n");
}

async function writeMockSseResponse(res, text) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const chunks = text.match(/.{1,120}/g) || [text];
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  res.write("event: done\ndata: [DONE]\n\n");
  res.end();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "stacksense-backend" });
});

app.post("/api/scan", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      const mockResponse = buildMockScanResponse(req.body?.stack || [], Number(req.body?.monthlySpend) || 0);
      return res.json(mockResponse);
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
    console.error("/api/scan failed, switching to offline demo mode:", error?.message || error);
    const mockResponse = buildMockScanResponse(req.body?.stack || [], Number(req.body?.monthlySpend) || 0);
    res.json(mockResponse);
  }
});

app.post("/api/insights", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      const mockMarkdown = buildMockInsightsMarkdown(req.body?.alerts || [], req.body?.monthlyCost || 0, req.body?.implementedSavings || 0);
      return res.json({ markdown: mockMarkdown });
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
    console.error("/api/insights failed, switching to offline demo mode:", error?.message || error);
    const mockMarkdown = buildMockInsightsMarkdown(req.body?.alerts || [], req.body?.monthlyCost || 0, req.body?.implementedSavings || 0);
    res.json({ markdown: mockMarkdown });
  }
});

app.post("/api/digest", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    if (!client) {
      return res.json({ markdown: buildMockDigestMarkdown(req.body?.alerts || []) });
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
    console.error("/api/digest failed, switching to offline demo mode:", error?.message || error);
    return res.json({ markdown: buildMockDigestMarkdown(req.body?.alerts || []) });
  }
});

app.post("/api/diligence", async (req, res) => {
  try {
    const client = getGeminiOrRespond(res);
    const { alerts, stack } = req.body || {};

    if (!client) {
      return res.json({ markdown: buildMockDiligenceMarkdown(alerts || [], stack || []) });
    }

    if (!Array.isArray(alerts) || !Array.isArray(stack)) {
      return res.status(400).json({ error: "Invalid request body. 'alerts' and 'stack' must both be arrays." });
    }

    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.35,
      },
      systemInstruction: [
        {
          text:
            "You are a fractional CTO filling out the technical section of a Y Combinator application or an investor due diligence questionnaire. " +
            "Take the current alerts and stack array and generate a highly confident 3-section markdown document with exactly these sections: 1. Current Architecture Choices, 2. Cost Management & FinOps, and 3. Scalability & Technical Debt Mitigation. " +
            "Write in crisp, investor-ready markdown and emphasize practical decisions, cost discipline, and risk reduction.",
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
                "\n\nCurrent stack:\n" +
                JSON.stringify(stack, null, 2),
            },
          ],
        },
      ],
    });

    res.json({ markdown: result.response.text() });
  } catch (error) {
    console.error("/api/diligence failed, switching to offline demo mode:", error?.message || error);
    return res.json({ markdown: buildMockDiligenceMarkdown(req.body?.alerts || [], req.body?.stack || []) });
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
      res.write("event: done\ndata: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    console.error("/api/ask failed, switching to offline demo mode:", error?.message || error);

    return writeMockSseResponse(
      res,
      "(Offline Mode) Here is the mock migration script and rollout plan. First, move the public demo surfaces from Vercel Pro to Firebase Hosting. Next, redirect model requests through a single managed path and replace the Pinecone demo path with pgvector on Postgres. Finally, verify the new flow against the live presentation stack so the demo stays stable even without Gemini access."
    );
  }
});

app.listen(PORT, () => {
  console.log(`StackSense backend listening on http://localhost:${PORT}`);
});
