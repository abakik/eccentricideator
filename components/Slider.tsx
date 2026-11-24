import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  valueLabel?: (value: number) => string; // Optional function to format the displayed value
  className?: string;
  wrapperClassName?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueLabel,
  className = '',
  wrapperClassName = ''
}) => {
  const id = React.useId();
  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
          <span>{label}</span>
          <span className="font-display text-base italic text-accent-text">{valueLabel ? valueLabel(value) : value}</span>
        </label>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-11 w-full cursor-pointer accent-[var(--accent-text)] ${className}`}
      />
    </div>
  );
};
