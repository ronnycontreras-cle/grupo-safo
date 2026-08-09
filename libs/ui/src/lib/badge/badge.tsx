import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

// Mapeo de estados (sección 6 del doc): draft -> accent, review -> warning,
// active/approved -> success. `incoterm` es la pill negra sólida (sin dot).
export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        draft: 'bg-accent/10 text-accent',
        review: 'bg-warning/10 text-warning',
        approved: 'bg-success/10 text-success',
        incoterm: 'bg-ink px-2.5 py-1 uppercase tracking-wide text-white',
      },
    },
    defaultVariants: {
      variant: 'draft',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant !== 'incoterm' && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-accent': variant === 'draft' || !variant,
            'bg-warning': variant === 'review',
            'bg-success': variant === 'approved',
          })}
        />
      )}
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';
