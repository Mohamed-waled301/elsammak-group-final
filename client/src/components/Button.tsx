import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  to?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconRight,
  className,
  to,
  loading,
  fullWidth,
  disabled,
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] focus-visible:ring-[var(--color-primary)] shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary:
      'bg-[var(--color-gold)] text-[var(--color-primary)] hover:bg-[var(--color-gold-light)] focus-visible:ring-[var(--color-gold)] shadow-sm hover:shadow-[var(--shadow-gold)] hover:-translate-y-0.5 font-bold',
    outline:
      'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary)] hover:text-white focus-visible:ring-[var(--color-primary)] hover:-translate-y-0.5',
    ghost:
      'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400 shadow-none',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow-md hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const combined = clsx(
    base,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combined}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combined} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
};

export default Button;
