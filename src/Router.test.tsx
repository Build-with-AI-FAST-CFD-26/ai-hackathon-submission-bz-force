import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppRouter from './Router';

function renderRoute(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter>);
}

const demoContext = {
  onboarded: true,
  stack: [{ id: 'demo-api', name: 'Example API', category: 'API', monthlyCost: 100 }],
  monthlyBudget: 1000,
  mainFocus: 'Cost Efficiency',
  riskTolerance: 'medium',
};

describe('application routes', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders the public landing page at /', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { name: /know what changed/i })).toBeInTheDocument();
  });

  it('renders the product application at /app', async () => {
    renderRoute('/app');
    expect(await screen.findByRole('heading', { name: /stacksense config/i })).toBeInTheDocument();
  });

  it('navigates from the landing CTA to /app', async () => {
    renderRoute('/');
    fireEvent.click(screen.getByRole('link', { name: 'Explore the demo' }));
    expect(await screen.findByRole('heading', { name: /stacksense config/i })).toBeInTheDocument();
  });

  it('renders a friendly not-found state', () => {
    renderRoute('/missing');
    expect(screen.getByRole('heading', { name: /this source.*doesn't exist/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to landing page/i })).toHaveAttribute('href', '/');
  });

  it('visibly labels demo mode', async () => {
    localStorage.setItem('stacksense_user_context', JSON.stringify(demoContext));
    renderRoute('/app');
    expect(await screen.findAllByText(/demo workspace/i)).not.toHaveLength(0);
  });

  it('shows a degraded error without substituting demo findings after a live failure', async () => {
    localStorage.setItem('stacksense_user_context', JSON.stringify(demoContext));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { code: 'PROVIDER_UNAVAILABLE', message: 'Live scanning is unavailable.', retryable: true } }),
    }));
    renderRoute('/app');
    fireEvent.click(await screen.findByRole('button', { name: /scan now/i }));
    expect(await screen.findByRole('heading', { name: /scan unavailable/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/example pricing change affecting/i)).not.toBeInTheDocument());
  });
});
