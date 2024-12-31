import type { TaskStatus } from '@/components/Project/Project.types';

/**
 * Filter value options
 * - all: Show all tasks
 * - todo: Show only todo tasks
 * - doing: Show only in-progress tasks
 * - done: Show only completed tasks
 */
export type FilterValue = 'all' | TaskStatus;

/**
 * Props for Filter component
 * - value: Current filter value
 * - onChange: Callback when filter value changes
 */
export interface FilterProps {
  value    : FilterValue;
  onChange : (value: FilterValue) => void;
}

/**
 * Icon mapping for task statuses
 * - todo: Empty circle
 * - doing: Circle with dot
 * - done: Circle with check
 */
export type FilterIcons = Record<TaskStatus, React.ReactNode>;
