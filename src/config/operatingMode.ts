export type OperatingMode = 'demo' | 'live' | 'degraded';

export function parseOperatingMode(value: unknown, fallback: OperatingMode = 'demo'): OperatingMode {
  return value === 'demo' || value === 'live' || value === 'degraded' ? value : fallback;
}

export const configuredOperatingMode = parseOperatingMode(import.meta.env.VITE_OPERATING_MODE, 'demo');
