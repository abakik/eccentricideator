import React from 'react';
import { ToastMessage } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

const markColor = {
  success: 'bg-accent',
  error: 'bg-danger',
  info: 'bg-line-strong',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[2000] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className="flex items-start gap-3 rounded-xl border border-line-strong bg-raised px-4 py-3 text-sm text-ink shadow-xl"
        >
          <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${markColor[toast.type]}`} />
          <p className="flex-1 leading-snug">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => onClose(toast.id)}
            className="-my-2 -mr-2 flex h-9 w-9 flex-none items-center justify-center rounded-full text-muted hover:text-ink"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
