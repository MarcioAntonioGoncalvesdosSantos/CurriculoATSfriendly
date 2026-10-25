// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from './App';
import { CV_SAMPLE, JOB_SAMPLE } from './lib/fixtures';
import { analyze } from './lib/score';
import { rewriteCv } from './lib/rewrite';
import { saveAnalysis } from './state/store';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

function goTo(hash: string) {
  window.location.hash = hash;
}

describe('telas', () => {
  it('mostra a proposta e as três provas na landing', () => {
    goTo('#/');
    render(<App />);
    expect(screen.getByText(/Descubra em 60 segundos/)).toBeTruthy();
    expect(screen.getByText('Nota explicada')).toBeTruthy();
    expect(screen.getByText('Diff lado a lado')).toBeTruthy();
    expect(screen.getByText('Export pronto')).toBeTruthy();
    expect(screen.getByText('A regra que vale para todo o app')).toBeTruthy();
  });

  it('abre o wizard no primeiro passo', () => {
    goTo('#/app/nova');
    render(<App />);
    expect(screen.getByText('Envie seu currículo')).toBeTruthy();
    expect(screen.getByText('Solte seu currículo aqui')).toBeTruthy();
    expect(screen.getByText('Continuar')).toBeTruthy();
  });

  it('mostra a nota e as abas no resultado', () => {
    const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
    const rewrite = rewriteCv(CV_SAMPLE, analysis);
    const stored = saveAnalysis({
      cvText: CV_SAMPLE,
      jobText: JOB_SAMPLE,
      analysis,
      rewrite,
      scoreAfter: analyze(rewrite.text, JOB_SAMPLE).score,
    });

    goTo(`#/app/analise/${stored.id}`);
    render(<App />);

    expect(screen.getByText(String(analysis.score))).toBeTruthy();
    expect(screen.getByText('Palavras-chave')).toBeTruthy();
    expect(screen.getByText('Formato')).toBeTruthy();
    expect(screen.getByText('Reescrita')).toBeTruthy();
  });

  it('renderiza a rota de impressão com o currículo ajustado', () => {
    const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
    const rewrite = rewriteCv(CV_SAMPLE, analysis);
    const stored = saveAnalysis({
      cvText: CV_SAMPLE,
      jobText: JOB_SAMPLE,
      analysis,
      rewrite,
      scoreAfter: analyze(rewrite.text, JOB_SAMPLE).score,
    });

    goTo(`#/print/${stored.id}`);
    render(<App />);

    expect(screen.getByText('RESUMO PROFISSIONAL')).toBeTruthy();
    expect(screen.getByText('EXPERIÊNCIA PROFISSIONAL')).toBeTruthy();
    expect(screen.getByText(/Imprimir \/ Salvar/)).toBeTruthy();
  });

  it('avisa quando a análise não existe na sessão', () => {
    goTo('#/app/analise/inexistente');
    render(<App />);
    expect(screen.getByText(/Análise não encontrada/)).toBeTruthy();
  });
});
