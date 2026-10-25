import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { CvDocument } from '../components/CvDocument';
import { Button, EmptyState } from '../components/ui';
import { t } from '../i18n/pt-BR';
import { fileBase, printPdf } from '../lib/export';
import { getAnalysis } from '../state/store';

export function PrintCv() {
  const { id } = useParams<{ id: string }>();
  const record = useMemo(() => (id ? getAnalysis(id) : null), [id]);

  useEffect(() => {
    if (record) document.title = fileBase(record.rewrite, record.analysis.job.title);
    return () => {
      document.title = t.appName;
    };
  }, [record]);

  if (!record) {
    return (
      <EmptyState
        title={t.errors.notFound}
        text="Abra a análise novamente para gerar a versão para impressão."
        action={
          <Link to="/app/nova" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {t.result.newAnalysis}
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-semibold">{t.result.print}</h1>
          <p className="text-xs text-muted-foreground">
            Na caixa de impressão, escolha “Salvar como PDF”. O arquivo sai em coluna única, sem nenhum elemento de interface.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/app/analise/${record.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {t.wizard.back}
          </Link>
          <Button size="sm" onClick={printPdf}>
            <Printer size={14} aria-hidden />
            Imprimir / Salvar
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-border bg-white p-8 text-black">
        <CvDocument result={record.rewrite} />
      </div>
    </div>
  );
}
