import {
  useFormContext,
  type FieldValues,
  type FieldPath,
} from 'react-hook-form';
import { cloneElement, type ReactElement } from 'react';
import { cn } from '../utils/cn';

export interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean }>;
}

// Wrapper agnóstico del dominio: lee el estado del campo del formulario
// (react-hook-form) más cercano vía contexto. La validación (p.ej. con Zod)
// se resuelve en el formulario consumidor con zodResolver, no aquí.
export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  className,
  children,
}: FormFieldProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
      )}
      {cloneElement(children, {
        id: name,
        ...register(name),
        'aria-invalid': !!error,
      })}
      {description && !error && (
        <p className="text-xs text-foreground/60">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{String(error.message ?? '')}</p>
      )}
    </div>
  );
}
