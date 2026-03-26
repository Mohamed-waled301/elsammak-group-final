import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
 size?: 'sm' | 'md' | 'lg';
 children: ReactNode;
 icon?: ReactNode;
 to?: string;
}

const Button = ({
 variant = 'primary',
 size = 'md',
 children,
 icon,
 className,
 to,
 ...props
}: ButtonProps) => {
 const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] shadow-sm';
 
 const variants = {
 primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] focus:ring-[var(--color-primary)] hover:shadow-lg ',
 secondary: 'bg-[var(--color-gold)] text-[var(--color-primary)] hover:bg-[var(--color-gold-light)] focus:ring-[var(--color-gold)] hover:shadow-[var(--color-gold)]/30 hover:shadow-lg font-bold',
 outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus:ring-[var(--color-primary)]',
 ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 shadow-none',
 };

 const sizes = {
 sm: 'px-3 py-1.5 text-sm',
 md: 'px-5 py-2.5 text-base',
 lg: 'px-8 py-3.5 text-lg',
 };

 const combinedClassName = clsx(baseStyles, variants[variant], sizes[size], className);

 if (to) {
 return (
 <Link to={to} className={combinedClassName}>
 {icon && <span className="mr-2 rtl:mr-0 rtl:ml-2">{icon}</span>}
 {children}
 </Link>
 );
 }

 return (
 <button
 className={combinedClassName}
 {...props}
 >
 {icon && <span className="mr-2 rtl:mr-0 rtl:ml-2">{icon}</span>}
 {children}
 </button>
 );
};

export default Button;
