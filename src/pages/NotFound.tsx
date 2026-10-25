import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export function NotFound() {
  return (
    <EmptyState
      title="Página não encontrada"
      text="O endereço não existe ou a análise foi apagada desta sessão."
      action={
        <Link to="/app/nova" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Fazer uma nova análise
        </Link>
      }
    />
  );
}
