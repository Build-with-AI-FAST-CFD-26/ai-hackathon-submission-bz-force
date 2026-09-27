const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

dotenv.config();

const VALID_MODES = new Set(['demo', 'live', 'degraded']);

function parseOperatingMode(value, fallback = 'demo') {
  return VALID_MODES.has(value) ? value : fallback;
}

function meta(mode) {
  return { mode, generatedAt: new Date().toISOString() };
}

function sendSuccess(res, data, mode) {
  return res.json({ data, meta: meta(mode) });
}

function sendError(res, status, code, message, retryable, mode = 'degraded') {
  return res.status(status).json({
    error: { code, message, retryable },
    meta: meta(mode),
  });
}

function parseJsonSafely(text) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

function validateScan(body) {
  const { stack, monthlySpend } = body || {};
  if (!Array.isArray(stack) || stack.length === 0 || stack.some(item => typeof item !== 'string' || !item.trim())) {
    return "'stack' must be a non-empty array of non-empty strings.";
  }
  if (typeof monthlySpend !== 'number' || !Number.isFinite(monthlySpend) || monthlySpend < 0) {
    return "'monthlySpend' must be a non-negative number.";
  }
  return null;
}

function demoScan(stack, monthlySpend) {
  const component = stack[0] || 'Example API';
  return {
    alerts: [
      {
        id: 'demo-pricing-change',
        title: `Example pricing change affecting ${component}`,
        impactLevel: 'Medium',
        estimatedSavings: Math.min(128, Math.round(monthlySpend * 0.1)),
        actionDescription: 'Review the cited example assumptions before making a product decision.',
        category: 'FinOps',
        evidenceState: 'demo',
      },
      {
        id: 'demo-deprecation',
        title: `Example deprecation review for ${component}`,
        impactLevel: 'Low',
        estimatedSavings: 0,
        actionDescription: 'Assign an owner to confirm whether the example deprecation applies to this component.',
        category: 'DevOps',
        evidenceState: 'demo',
      },
    ],
    mermaidGraph: '',
  };
}

function demoInsights(alerts, monthlyCost, implementedSavings) {
  return { markdown: `## Demo founder summary\n\nThis preview contains ${alerts.length} demo findings against $${Number(monthlyCost).toLocaleString()} in stated monthly spend. No savings are verified.\n\nRecorded implemented savings: $${Number(implementedSavings).toLocaleString()}. Review evidence and assumptions before acting.` };
}

function demoDigest(alerts) {
  return { markdown: `## Demo weekly digest\n\n${alerts.length} example findings are ready for review. This digest is seeded demo content and does not represent a live source scan.` };
}

function demoDiligence(alerts, stack) {
  return { markdown: `# Demo technical brief\n\n## Current architecture\n${stack.length} stack components are configured.\n\n## Findings\n${alerts.length} demo findings require human review.\n\n## Evidence boundary\nThis preview is not based on a live source capture.` };
}

function demoSync() {
  return {
    paulActions: ['DEMO: Review the highest-priority finding and assign an owner.'],
    coordinationAlerts: ['DEMO: Confirm evidence and timing before making an external commitment.'],
  };
}

function createGemini(apiKey) {
  return apiKey ? new GoogleGenerativeAI(apiKey) : null;
}

function createApp(options = {}) {
  const app = express();
  const mode = parseOperatingMode(options.mode ?? process.env.STACKSENSE_MODE, 'demo');
  const frontendOrigin = options.frontendOrigin ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
  const genAI = options.genAI === undefined ? createGemini(process.env.GEMINI_API_KEY) : options.genAI;

  app.use(cors({ origin: frontendOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => sendSuccess(res, { status: mode === 'live' && !genAI ? 'degraded' : 'ok', service: 'stacksense-backend' }, mode === 'live' && !genAI ? 'degraded' : mode));

  app.post('/api/scan', async (req, res) => {
    const validationError = validateScan(req.body);
    if (validationError) return sendError(res, 400, 'INVALID_SCAN_REQUEST', validationError, false, mode);
    const { stack, monthlySpend } = req.body;

    if (mode === 'demo') return sendSuccess(res, demoScan(stack, monthlySpend), 'demo');
    if (mode === 'degraded' || !genAI) return sendError(res, 503, 'PROVIDER_UNAVAILABLE', 'Live scanning is temporarily unavailable. Your existing workspace data is unchanged.', true);

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              alerts: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: {
                id: { type: SchemaType.STRING }, title: { type: SchemaType.STRING },
                impactLevel: { type: SchemaType.STRING, enum: ['High', 'Medium', 'Low'] },
                estimatedSavings: { type: SchemaType.NUMBER }, actionDescription: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING, enum: ['FinOps', 'DevOps', 'Security'] },
              }, required: ['id', 'title', 'impactLevel', 'estimatedSavings', 'actionDescription', 'category'] } },
              mermaidGraph: { type: SchemaType.STRING },
            },
            required: ['alerts', 'mermaidGraph'],
          },
          temperature: 0.2,
        },
        systemInstruction: [{ text: 'Analyze only the supplied stack. Return structured findings without claiming a source was verified or scanned unless source evidence is supplied. Return valid JSON matching the schema.' }],
      });
      const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: `Stack: ${JSON.stringify(stack)}\nMonthly spend: ${monthlySpend}` }] }] });
      const parsed = parseJsonSafely(result.response.text());
      return sendSuccess(res, { alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [], mermaidGraph: typeof parsed.mermaidGraph === 'string' ? parsed.mermaidGraph : '' }, 'live');
    } catch (error) {
      console.error('[scan] provider failure:', error?.message || error);
      return sendError(res, 503, 'SCAN_PROVIDER_FAILURE', 'The live scan could not be completed. Try again shortly.', true);
    }
  });

  const simpleEndpoint = (path, validate, demoBuilder, instruction, promptBuilder) => {
    app.post(path, async (req, res) => {
      const validationError = validate(req.body || {});
      if (validationError) return sendError(res, 400, 'INVALID_REQUEST', validationError, false, mode);
      if (mode === 'demo') return sendSuccess(res, demoBuilder(req.body), 'demo');
      if (mode === 'degraded' || !genAI) return sendError(res, 503, 'PROVIDER_UNAVAILABLE', 'This live analysis is temporarily unavailable. Existing data is unchanged.', true);
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 0.3 }, systemInstruction: [{ text: instruction }] });
        const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: promptBuilder(req.body) }] }] });
        return sendSuccess(res, { markdown: result.response.text() }, 'live');
      } catch (error) {
        console.error(`[${path}] provider failure:`, error?.message || error);
        return sendError(res, 503, 'PROVIDER_FAILURE', 'The live analysis could not be completed. Try again shortly.', true);
      }
    });
  };

  simpleEndpoint('/api/insights', body => Array.isArray(body.alerts) && Number.isFinite(body.monthlyCost) && Number.isFinite(body.implementedSavings) ? null : "'alerts' must be an array and cost values must be numbers.", body => demoInsights(body.alerts, body.monthlyCost, body.implementedSavings), 'Write a concise founder update grounded only in the supplied data. Mark uncertainty clearly.', body => JSON.stringify(body));
  simpleEndpoint('/api/digest', body => Array.isArray(body.alerts) ? null : "'alerts' must be an array.", body => demoDigest(body.alerts), 'Write a concise weekly digest grounded only in the supplied findings.', body => JSON.stringify(body.alerts));
  simpleEndpoint('/api/diligence', body => Array.isArray(body.alerts) && Array.isArray(body.stack) ? null : "'alerts' and 'stack' must be arrays.", body => demoDiligence(body.alerts, body.stack), 'Write a concise technical brief grounded only in the supplied data.', body => JSON.stringify(body));

  app.post('/api/sync', async (req, res) => {
    const { businessState, alerts } = req.body || {};
    if (!Array.isArray(businessState) || !Array.isArray(alerts)) return sendError(res, 400, 'INVALID_REQUEST', "'businessState' and 'alerts' must be arrays.", false, mode);
    if (mode === 'demo') return sendSuccess(res, demoSync(), 'demo');
    if (mode === 'degraded' || !genAI) return sendError(res, 503, 'PROVIDER_UNAVAILABLE', 'Founder sync is temporarily unavailable.', true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } });
      const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: `Return JSON with paulActions and coordinationAlerts. Data: ${JSON.stringify({ businessState, alerts })}` }] }] });
      const parsed = parseJsonSafely(result.response.text());
      return sendSuccess(res, { paulActions: Array.isArray(parsed.paulActions) ? parsed.paulActions : [], coordinationAlerts: Array.isArray(parsed.coordinationAlerts) ? parsed.coordinationAlerts : [] }, 'live');
    } catch (error) {
      console.error('[sync] provider failure:', error?.message || error);
      return sendError(res, 503, 'PROVIDER_FAILURE', 'Founder sync could not be completed.', true);
    }
  });

  app.post('/api/ask', async (req, res) => {
    const { alertContext, question } = req.body || {};
    if (!alertContext || typeof alertContext !== 'object' || Array.isArray(alertContext) || typeof question !== 'string' || !question.trim()) return sendError(res, 400, 'INVALID_REQUEST', "'alertContext' must be an object and 'question' must be a non-empty string.", false, mode);
    if (mode === 'degraded' || (mode === 'live' && !genAI)) return sendError(res, 503, 'PROVIDER_UNAVAILABLE', 'Live guidance is temporarily unavailable.', true);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    if (mode === 'demo') {
      res.write(`data: ${JSON.stringify({ text: 'Demo guidance: review the cited evidence and assumptions before assigning this action.', meta: meta('demo') })}\n\n`);
      res.write('event: done\ndata: [DONE]\n\n');
      return res.end();
    }
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 0.3 } });
      const result = await model.generateContentStream({ contents: [{ role: 'user', parts: [{ text: `Context: ${JSON.stringify(alertContext)}\nQuestion: ${question}` }] }] });
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) res.write(`data: ${JSON.stringify({ text, meta: meta('live') })}\n\n`);
      }
      res.write('event: done\ndata: [DONE]\n\n');
      return res.end();
    } catch (error) {
      console.error('[ask] provider failure:', error?.message || error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Live guidance failed. Try again shortly.' })}\n\n`);
      return res.end();
    }
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return sendError(res, 400, 'INVALID_JSON', 'The request body must contain valid JSON.', false, mode);
    }
    console.error('[http] unexpected failure:', error?.message || error);
    return sendError(res, 500, 'INTERNAL_ERROR', 'StackSense could not complete the request.', true, 'degraded');
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8787;
  const mode = parseOperatingMode(process.env.STACKSENSE_MODE, 'demo');
  if (mode === 'live' && !process.env.GEMINI_API_KEY) console.warn('[WARN] Live mode is configured without GEMINI_API_KEY; requests will return a degraded response.');
  createApp().listen(port, () => console.log(`StackSense backend listening on http://localhost:${port} (${mode} mode)`));
}

module.exports = { createApp, parseOperatingMode, validateScan };
