import React, { useRef, useEffect } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  autoExpand?: boolean;
  maxRows?: number; // For autoExpand: max number of rows to expand to
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  error,
  wrapperClassName = '',
  className = '',
  autoExpand = false,
  maxRows = 10,
  rows = 3, // Default initial rows
  value,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoExpand && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height to correctly calculate scrollHeight

      const computedStyle = window.getComputedStyle(textarea);
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
      const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
      const boxSizing = computedStyle.boxSizing;
      
      // Estimate line height if not explicitly set or 'normal'
      let lineHeight = parseFloat(computedStyle.lineHeight);
      if (isNaN(lineHeight)) {
        lineHeight = (parseFloat(computedStyle.fontSize) || 16) * 1.5; // Default to 1.5x font-size or 16px as base
      }

      // Calculate minHeight based on the 'rows' prop
      // This height includes padding and border if box-sizing is border-box
      let minHeightBasedOnRows = (lineHeight * rows);
      if (boxSizing === 'border-box') {
        minHeightBasedOnRows += paddingTop + paddingBottom + borderTop + borderBottom;
      }


      let newHeight = textarea.scrollHeight;
      // If box-sizing is content-box, scrollHeight doesn't include padding/border, so add them for comparison with minHeightBasedOnRows if it was calculated for border-box.
      // However, scrollHeight usually reflects the content height correctly.
      // We just need to ensure the final style.height isn't less than what rows imply.

      // Ensure newHeight is at least the minHeightBasedOnRows
      // This is tricky because scrollHeight might already account for padding if content is less than rows height.
      // The most direct way is to compare content scrollHeight vs height needed for N rows.
      // If scrollHeight is smaller than what `rows` visually provides, we should use height for `rows`.
      // The `rows` attribute on textarea itself should give a baseline. `scrollHeight` of an empty textarea with `rows` set should be its height.
      // So, if scrollHeight < minHeightBasedOnRows (calculated purely on lines), it implies scrollHeight is too small.
      // But if textarea is empty, scrollHeight IS the height for `rows`.
      // Let's ensure that style.height respects the initial `rows` if scrollHeight is less than that.
      // A simpler approach: if textarea is empty or content is small, scrollHeight should be the height of `rows` lines.
      // If scrollHeight itself is less than a meticulously calculated `minHeightBasedOnRows`, it means `scrollHeight` is the one to use.
      // The main problem arises if scrollHeight calculation becomes *too small*.
      // `rows` attribute itself should make the textarea `rows` lines high. `scrollHeight` will reflect that.

      // Let's ensure the calculated newHeight is not less than what a few rows would visually occupy as a safety net.
      // If rows = 8, minHeightBasedOnRows will be calculated. scrollHeight should already be this value if empty.
      // The issue is when scrollHeight would be *less* than this.
      
      // Corrected logic: scrollHeight should inherently be at least the height of `rows` if content is less.
      // The `style.height = 'auto'` should allow `rows` attribute to dictate initial empty height.
      // Then `scrollHeight` should measure that.
      // The issue is only if scrollHeight of an empty textarea is SMALLER than the visual space of `rows`.
      // To guarantee, we can set min-height css property. Or simpler:
      const currentScrollHeight = textarea.scrollHeight;
      let targetHeight = currentScrollHeight;

      // If content is small, `scrollHeight` might be height of `rows`.
      // But if `rows` is large, e.g. 8, and `scrollHeight` for empty text is somehow smaller than 8 lines of text.
      // We'll calculate the height of `rows` lines as a minimum visual baseline.
      let heightOfNRows = (lineHeight * rows);
      if (boxSizing === 'border-box') { // if border-box, padding & border are inside
          heightOfNRows += paddingTop + paddingBottom + borderTop + borderBottom;
      } else { // if content-box, padding & border are outside
          // scrollHeight is content, style.height is content.
      }
      
      if (targetHeight < heightOfNRows) {
          targetHeight = heightOfNRows;
      }


      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom + borderTop + borderBottom;

      if (targetHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${targetHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [value, autoExpand, maxRows, rows]);


  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        rows={rows} // HTML rows attribute sets initial visual height
        value={value}
        className={`block w-full rounded-lg border border-line-strong bg-panel px-3.5 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:border-accent-text focus:outline-none disabled:opacity-60 ${autoExpand ? 'resize-none overflow-hidden' : ''} ${className} ${error ? 'border-danger' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};
