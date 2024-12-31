/**
 * Props for Modal component
 * - title        : Header text of the modal
 * - description  : Optional subtext below the header
 * - children     : Content to display in the modal body
 * - isOpen       : Controls modal visibility
 * - onClose      : Callback when modal is closed
 * - variant      : Visual style variant (default or form)
 */
export interface ModalProps {
  title        : string;
  description? : string;
  children     : React.ReactNode;
  isOpen       : boolean;
  onClose      : () => void;
  variant?     : 'default' | 'form';
}
