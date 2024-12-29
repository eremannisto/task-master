import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Modal({ title, children, isOpen, onClose }: ModalProps) {
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
      aria-modal="true"
      role="dialog"
    >
      <header className={styles.header}>
        <h2 id="modal-title">{title}</h2>
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