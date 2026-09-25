import { describe, expect, it } from 'vitest';
import { parseOperatingMode } from './operatingMode';

describe('parseOperatingMode', () => {
  it('accepts supported modes', () => {
    expect(parseOperatingMode('demo')).toBe('demo');
    expect(parseOperatingMode('live')).toBe('live');
    expect(parseOperatingMode('degraded')).toBe('degraded');
  });

  it('falls back safely for invalid values', () => {
    expect(parseOperatingMode('production')).toBe('demo');
    expect(parseOperatingMode(undefined)).toBe('demo');
  });
});
