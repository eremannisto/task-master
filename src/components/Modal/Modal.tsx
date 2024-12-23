import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ title, isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      modalRef.current?.close();
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <dialog 
      ref={modalRef}
      className={styles.modal}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === modalRef.current) onClose();
      }}
    >
      <header className={styles.header}>
        <h2>{title}</h2>
        <button 
          onClick={onClose}
          className={styles.close}
          aria-label="Close modal"
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </dialog>
  );
};