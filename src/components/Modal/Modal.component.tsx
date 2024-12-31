import { useEffect, useRef } from 'react';
import { X }                 from 'lucide-react';
import type { ModalProps }   from './Modal.types';
import styles                from './Modal.module.css';

/**
 * Modal dialog component
 * - Accessible modal implementation using HTML dialog
 * - Manages focus trap and restoration
 * - Supports keyboard navigation and escape to close
 * - Provides ARIA labeling for screen readers
 */
export function Modal({ 
  title, 
  description, 
  children, 
  isOpen, 
  onClose,
  variant = 'default'
}: ModalProps) {

  /**
   * Ref for the modal dialog element
   * - Used to open and close the modal
   * - Manages focus restoration
   */
  const dialogRef             = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /**
   * Modal lifecycle management
   * - Opens/closes modal based on isOpen prop
   * - Manages focus when modal opens/closes
   * - Restores focus to previous element on close
   */
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

  /**
   * Keyboard event handler
   * - Closes modal on Escape key press
   * - Supplements native dialog Escape handling
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <dialog 
      ref              = {dialogRef}
      className        = {styles.modal}
      onKeyDown        = {handleKeyDown}
      aria-labelledby  = {"modal-title"}
      aria-describedby = {description ? "modal-description" : undefined}
      aria-modal       = "true"
      role             = "dialog"
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