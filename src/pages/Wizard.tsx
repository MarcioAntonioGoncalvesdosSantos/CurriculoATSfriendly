import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { Stepper } from '../components/Stepper';
import { Button, Card, CardTitle, Textarea } from '../components/ui';
import { t } from '../i18n/pt-BR';
import { countBroken, repairBrokenText } from '../lib/repair';
import { analyze } from '../lib/score';
import { rewriteCv } from '../lib/rewrite';
import { readDraft, saveAnalysis, writeDraft } from '../state/store';

const MAX_CV = 15000;
const MAX_JOB = 20000;

export function Wizard() {
  const navigate = useNavigate();
  const draft = useMemo(readDraft, []);
  const [step, setStep] = useState(1);
  const [cvText, setCvText] = useState(draft.cvText);
  const [jobText, setJobText] = useState(draft.jobText);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    writeDraft({ cvText, jobText });
  }, [cvText, jobText]);

  const cvReady = cvText.trim().length >= 200 && cvText.length <= MAX_CV;
  const jobReady = jobText.trim().length >= 100 && jobText.length <= MAX_JOB;
  const brokenCount = countBroken(cvText);

  function run() {
    setBusy(true);
    setStep(3);
    window.setTimeout(() => {
      try {
        // Letras perdidas na camada de texto do arquivo ("?", "ÿý") são
        // restauradas antes da análise, senão o defeito viaja para os arquivos.
        const cvFixed = repairBrokenText(cvText);
        const jobFixed = repairBrokenText(jobText);
        const analysis = analyze(cvFixed.text, jobFixed.text);
        const rewrite = rewriteCv(cvFixed.text, analysis);
        if (cvFixed.fixes.length > 0) {
          rewrite.pendencies.unshift(
            `${cvFixed.fixes.length} trecho(s) chegaram ilegíveis do arquivo e foram restaurados com “fi”. Confira as palavras afetadas: a letra tinha se perdido na origem.`,
          );
        }
        const after = analyze(rewrite.text, jobFixed.text);
        const stored = saveAnalysis({
          cvText: cvFixed.text,
          jobText: jobFixed.text,
          analysis,
          rewrite,
          scoreAfter: after.score,
        });
        navigate(`/app/analise/${stored.id}`);
      } catch {
        setBusy(false);
        setStep(2);
      }
    }, 900);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Stepper current={step} labels={[t.wizard.step1, t.wizard.step2, t.wizard.step3]} />

      {step === 1 ? (
        <Card className="mt-5">
          <CardTitle>{t.wizard.cvTitle}</CardTitle>
          <Dropzone
            onText={(text, name) => {
              setCvText(text.slice(0, MAX_CV));
              setFileName(name);
            }}
          />
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.wizard.or}</p>
          <Textarea
            value={cvText}
            onChange={(event) => setCvText(event.target.value.slice(0, MAX_CV))}
            placeholder="Cole aqui o conteúdo do seu currículo…"
            className="mt-2 h-48"
            aria-label="Texto do currículo"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{cvText.length.toLocaleString('pt-BR')} / {MAX_CV.toLocaleString('pt-BR')} caracteres</span>
            {!cvReady ? <span>{t.wizard.emptyCv}</span> : <span>{fileName ?? 'Texto colado'}</span>}
          </div>

          {brokenCount > 0 ? (
            <p className="mt-3 flex items-start gap-2 rounded-md border border-warning-500/30 bg-warning-100 p-2 text-xs text-warning-700" role="status">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                {brokenCount} trecho(s) vieram com caractere ilegível — a letra se perdeu no arquivo original.
                Vamos restaurar como “fi” na análise. Se puder, cole o texto ou envie o DOCX para não depender da leitura do PDF.
              </span>
            </p>
          ) : null}
          <div className="mt-5 flex justify-end">
            <Button disabled={!cvReady} onClick={() => setStep(2)}>
              {t.wizard.next}
              <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="mt-5">
          <CardTitle>{t.wizard.jobTitle}</CardTitle>
          <p className="mb-3 text-sm text-muted-foreground">{t.wizard.jobHelp}</p>
          <Textarea
            value={jobText}
            onChange={(event) => setJobText(event.target.value.slice(0, MAX_JOB))}
            placeholder="Cole aqui a descrição completa da vaga…"
            className="h-64"
            aria-label="Descrição da vaga"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{jobText.length.toLocaleString('pt-BR')} / {MAX_JOB.toLocaleString('pt-BR')} caracteres</span>
            {!jobReady ? <span>{t.wizard.emptyJob}</span> : null}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={16} aria-hidden />
              {t.wizard.back}
            </Button>
            <Button disabled={!jobReady || busy} onClick={run}>
              {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
              {t.wizard.analyze}
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="mt-5">
          <CardTitle>{t.wizard.step3}</CardTitle>
          <ul className="space-y-3">
            {t.wizard.steps.map((label, index) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border">
                  <Loader2 size={12} className="animate-spin text-primary" aria-hidden />
                </span>
                <span className="flex-1">{label}</span>
                <span className="h-2 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-primary/40"
                    style={{ width: `${Math.min(100, 30 + index * 22)}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={12} aria-hidden />
            {t.landing.rule}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
