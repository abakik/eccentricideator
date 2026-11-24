import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from './icons/XMarkIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`flex w-full flex-col rounded-2xl border border-line bg-panel shadow-2xl ${sizeClasses[size]} ${size === 'full' ? 'h-full' : 'max-h-[90vh]'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id="modal-title" className="font-display text-2xl text-ink">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-raised hover:text-ink"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className={`overflow-y-auto p-6 text-ink ${size === 'full' ? 'flex-grow' : ''}`}>
          {children}
        </div>
        {footer && (
          <div className="border-t border-line p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body 
  );
};