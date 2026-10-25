import { describe, expect, it } from 'vitest';
import { countBroken, repairBrokenText } from './repair';

describe('reparo de caracteres perdidos', () => {
  it('restaura a ligadura que virou mojibake', () => {
    const { text } = repairBrokenText('Prospectar clientes in ÿý nitos para a Empresa');
    expect(text).toContain('infinitos');
  });

  it('restaura a interrogação no meio da palavra', () => {
    const { text } = repairBrokenText('Emitir as notas ?scais e veri?car os dados');
    expect(text).toContain('fiscais');
    expect(text).toContain('verificar');
    expect(text).not.toContain('?');
  });

  it('restaura o caractere de substituição', () => {
    const { text } = repairBrokenText('Certi\uFFFDcar a exatidão');
    expect(text).toContain('Certificar');
  });

  it('não mexe em interrogação legítima no fim da frase', () => {
    const { text } = repairBrokenText('Você tem experiência com SQL? Ótimo.');
    expect(text).toContain('SQL?');
  });

  it('conta os trechos quebrados sem alterar o texto', () => {
    expect(countBroken('notas ?scais e in ÿý nitos')).toBe(2);
    expect(countBroken('texto normal sem defeito')).toBe(0);
  });

  it('registra o que foi trocado, para o usuário conferir', () => {
    const { fixes } = repairBrokenText('notas ?scais');
    expect(fixes.length).toBe(1);
    expect(fixes[0].after).toContain('fi');
  });
});
