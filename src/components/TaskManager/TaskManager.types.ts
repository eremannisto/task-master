/**
 * Props for TaskManager component
 * - initialModalOpen: Whether to show create/edit modal on mount
 * - onModalClose: Callback when modal is closed
 */
export interface TaskManagerProps {
  initialModalOpen?: boolean;
  onModalClose?: () => void;
}