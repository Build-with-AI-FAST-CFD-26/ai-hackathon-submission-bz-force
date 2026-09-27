// @vitest-environment node
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import request from 'supertest';

const require = createRequire(import.meta.url);
const { createApp, parseOperatingMode } = require('../backend/src/index.js');

describe('backend operating contract', () => {
  it('returns 400 for invalid scan input in demo mode', async () => {
    const response = await request(createApp({ mode: 'demo', genAI: null })).post('/api/scan').send({ stack: [], monthlySpend: -1 });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_SCAN_REQUEST');
  });

  it('accepts the documented local frontend origin', async () => {
    const response = await request(createApp({ mode: 'demo', genAI: null, frontendOrigin: 'http://localhost:3000' }))
      .options('/api/scan')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('returns deterministic fixtures only in demo mode', async () => {
    const response = await request(createApp({ mode: 'demo', genAI: null })).post('/api/scan').send({ stack: ['Example API'], monthlySpend: 100 });
    expect(response.status).toBe(200);
    expect(response.body.meta.mode).toBe('demo');
    expect(response.body.data.alerts[0].id).toBe('demo-pricing-change');
  });

  it('does not substitute demo findings when live provider is unavailable', async () => {
    const response = await request(createApp({ mode: 'live', genAI: null })).post('/api/scan').send({ stack: ['Example API'], monthlySpend: 100 });
    expect(response.status).toBe(503);
    expect(response.body.meta.mode).toBe('degraded');
    expect(response.body.data).toBeUndefined();
  });

  it('falls back safely for invalid backend modes', () => {
    expect(parseOperatingMode('invalid')).toBe('demo');
  });
});
