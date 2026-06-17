import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'lg';
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', block, className = '', ...rest },
    ref,
  ) => {
    const classes = [
      'btn',
      `btn--${variant}`,
      size === 'lg' ? 'btn--lg' : '',
      block ? 'btn--block' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return <button ref={ref} className={classes} {...rest} />;
  },
);

Button.displayName = 'Button';
