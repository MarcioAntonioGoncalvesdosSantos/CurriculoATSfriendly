// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('./lib/export', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/export')>();
  return {
    ...actual,
    embeddedFontStatus: vi.fn().mockResolvedValue(false),
  };
});

import { App } from './App';
import { CV_SAMPLE, JOB_SAMPLE } from './lib/fixtures';
import { analyze } from './lib/score';
import { rewriteCv } from './lib/rewrite';
import { saveAnalysis } from './state/store';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe('aviso de fonte', () => {
  it('aparece na tela de resultado quando a Roboto não carrega', async () => {
    const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
    const rewrite = rewriteCv(CV_SAMPLE, analysis);
    const stored = saveAnalysis({
      cvText: CV_SAMPLE,
      jobText: JOB_SAMPLE,
      analysis,
      rewrite,
      scoreAfter: analyze(rewrite.text, JOB_SAMPLE).score,
    });

    window.location.hash = `#/app/analise/${stored.id}`;
    render(<App />);

    expect(await screen.findByText(/Fonte Roboto não carregada/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tentar novamente/ })).toBeTruthy();
  });
});
