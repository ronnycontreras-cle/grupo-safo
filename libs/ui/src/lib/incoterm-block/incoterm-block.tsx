import { type HTMLAttributes } from 'react';
import { Badge } from '../badge/badge';
import { cn } from '../utils/cn';

export interface IncotermBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Código Incoterm, p.ej. "FOB", "CIF", "EXW". */
  code: string;
  /** Puerto o lugar de entrega asociado al Incoterm. */
  location?: string;
}

// Composición mínima sobre la pill de Badge. El shape final (más campos,
// tooltip con la definición del término, etc.) se ajusta cuando el dominio
// Quote/RFQ quede modelado en `contracts` (Paso 7).
export function IncotermBlock({
  code,
  location,
  className,
  ...props
}: IncotermBlockProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2',
        className
      )}
      {...props}
    >
      <Badge variant="incoterm">{code}</Badge>
      {location && <span className="text-sm text-foreground/70">{location}</span>}
    </div>
  );
}
