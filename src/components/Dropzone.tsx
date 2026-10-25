import { useRef, useState } from 'react';
import { AlertTriangle, UploadCloud } from 'lucide-react';
import { t } from '../i18n/pt-BR';
import { extractTextFromFile, ParseError } from '../lib/parsers';

interface Props {
  onText: (text: string, fileName: string) => void;
}

export function Dropzone({ onText }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const text = await extractTextFromFile(file);
      setFileName(file.name);
      onText(text, file.name);
    } catch (caught) {
      setFileName(null);
      setError(caught instanceof ParseError ? caught.message : t.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`flex w-full flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-10 text-center transition-colors ${
          error
            ? 'border-danger-500 bg-danger-100/40'
            : dragging
              ? 'border-primary bg-accent'
              : 'border-border bg-card hover:bg-accent/40'
        }`}
      >
        {error ? <AlertTriangle size={24} className="text-danger-500" aria-hidden /> : <UploadCloud size={24} className="text-muted-foreground" aria-hidden />}
        <span className="text-[15px] font-semibold">{loading ? 'Lendo arquivo…' : fileName ?? t.wizard.drop}</span>
        <span className="text-xs text-muted-foreground">{fileName ? 'Clique para trocar o arquivo' : t.wizard.dropSub}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {error ? (
        <p className="mt-2 text-sm text-danger-700" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">{t.wizard.cvHelp}</p>
    </div>
  );
}
