import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-accent text-on-accent font-semibold hover:brightness-95',
  secondary: 'border border-line-strong text-ink hover:bg-raised',
  danger: 'border border-danger text-danger hover:bg-raised',
  ghost: 'text-ink hover:bg-raised',
};

const sizeStyles = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-14 px-7 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
      disabled={isLoading || props.disabled}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && leftIcon}
      {children}
      {rightIcon && !isLoading && rightIcon}
    </button>
  );
};
