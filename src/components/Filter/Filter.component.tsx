import { useRef, useEffect }                    from 'react';
import { CircleDashed, CircleDot, CircleCheck } from 'lucide-react';
import type { TaskStatus }                      from '@/components/Project/Project.types';
import type { FilterProps, FilterValue, FilterIcons } from './Filter.types';
import styles                                   from './Filter.module.css';

/**
 * Filter descriptions for screen readers
 * - Provides clear context for each filter option
 * - Used in aria-label attributes
 */
const filterDescriptions: Record<FilterValue, string> = {
  all:   'Show all tasks regardless of status',
  todo:  'Show only tasks that need to be started',
  doing: 'Show only tasks in progress',
  done:  'Show only completed tasks'
};

/**
 * Icon mapping for task statuses
 * - todo: Empty circle
 * - doing: Circle with dot
 * - done: Circle with check
 */
const icons: FilterIcons = {
  todo : <CircleDashed className={styles.icon} aria-hidden="true" />,
  doing: <CircleDot    className={styles.icon} aria-hidden="true" />,
  done : <CircleCheck  className={styles.icon} aria-hidden="true" />,
};

/**
 * Filter component for task status
 * - Displays radio buttons for filtering tasks
 * - Supports keyboard navigation
 * - Provides visual and screen reader feedback
 */
export const Filter = ({ value, onChange }: FilterProps) => {
  const filters: FilterValue[] = ['all', 'todo', 'doing', 'done'];
  const buttonsRef           = useRef<(HTMLButtonElement | null)[]>([]);
  const isKeyboardNavigation = useRef(false);
  
  /**
   * Focus management for keyboard navigation
   * - Only focuses buttons during keyboard navigation
   * - Prevents focus on mouse interaction
   */
  useEffect(() => {
    if (isKeyboardNavigation.current) {
      const selectedIndex = filters.indexOf(value);
      buttonsRef.current[selectedIndex]?.focus();
      isKeyboardNavigation.current = false;
    }
  }, [value, filters]);

  /**
   * Keyboard interaction handler
   * - Left/Up: Previous filter
   * - Right/Down: Next filter
   * - Home: First filter
   * - End: Last filter
   * - Enter/Space: Select filter
   */
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number;
    isKeyboardNavigation.current = true;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = index === 0 ? filters.length - 1 : index - 1;
        buttonsRef.current[nextIndex]?.focus();
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = index === filters.length - 1 ? 0 : index + 1;
        buttonsRef.current[nextIndex]?.focus();
        break;

      case 'Home':
        e.preventDefault();
        buttonsRef.current[0]?.focus();
        break;

      case 'End':
        e.preventDefault();
        buttonsRef.current[filters.length - 1]?.focus();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(filters[index]);
        break;
    }
  };

  return (
    <div 
      className={styles.filters}
      role="group"
      aria-label="Filter tasks by status"
    >
      {filters.map((filterValue, index) => (
        <label key={filterValue} className={styles.label}>
          <input
            type="radio"
            name="task-filter"
            className={styles.radio}
            ref={el => buttonsRef.current[index] = el as HTMLButtonElement}
            value={filterValue}
            checked={value === filterValue}
            onChange={() => onChange(filterValue)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-label={filterDescriptions[filterValue]}
          />
          <span className={styles.content} data-status={filterValue}>
            {filterValue === 'all' ? null : (
              <span aria-hidden="true">
                {icons[filterValue as TaskStatus]}
              </span>
            )}
            <span>
              {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}