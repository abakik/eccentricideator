import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, name, error, wrapperClassName = '', className = '', ...props }) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        className={`block w-full rounded-lg border border-line-strong bg-panel px-3.5 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:border-accent-text focus:outline-none disabled:opacity-60 ${className} ${error ? 'border-danger' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};