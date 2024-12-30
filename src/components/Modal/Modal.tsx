import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'default' | 'form';
}

export function Modal({ 
  title, 
  description, 
  children, 
  isOpen, 
  onClose,
  variant = 'default'
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialog.showModal();
      // Find the first focusable element and focus it
      const focusable = dialog.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus();
      }
    } else {
      dialog.close();
      // Return focus to the element that was focused before the modal opened
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <dialog 
      ref={dialogRef}
      className={styles.modal}
      onKeyDown={handleKeyDown}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      aria-modal="true"
      role="dialog"
    >
      <header className={`${styles.header} ${styles[variant]}`}>
        <div>
          <h2 id="modal-title">{title}</h2>
          {description && (
            <p id="modal-description" className={styles.description}>
              {description}
            </p>
          )}
        </div>
        <button 
          onClick={onClose}
          className={styles.close}
          aria-label="Close modal"
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className={styles.content} role="document">
        {children}
      </div>
    </dialog>
  );
}