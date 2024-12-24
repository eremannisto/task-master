// src/components/Filter/Filter.tsx
import { useRef, useEffect }                    from 'react';
import { type TaskStatus, FilterValue }         from '@types';
import { CircleDashed, CircleDot, CircleCheck } from 'lucide-react';
import './Filter.css';

const icons: Record<TaskStatus, React.ReactNode> = {
  todo:  <CircleDashed className="task-icon" aria-hidden="true" />,
  doing: <CircleDot    className="task-icon" aria-hidden="true" />,
  done:  <CircleCheck  className="task-icon" aria-hidden="true" />,
};

// Descriptive text for screen readers
const filterDescriptions: Record<FilterValue, string> = {
  all:   'Show all tasks regardless of status',
  todo:  'Show only tasks that need to be started',
  doing: 'Show only tasks in progress',
  done:  'Show only completed tasks'
};

interface FilterProps {
  value    : FilterValue;
  onChange : (value: FilterValue) => void;
}

export default function Filter({ value, onChange }: FilterProps) {
  const filters: FilterValue[] = ['all', 'todo', 'doing', 'done'];
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Focus management - only for arrow key navigation
  useEffect(() => {
    // Only update focus when value changes due to arrow key navigation
    const selectedIndex = filters.indexOf(value);
    if (document.activeElement?.getAttribute('role') === 'tab') {
      buttonsRef.current[selectedIndex]?.focus();
    }
  }, [value, filters]);

  // Keyboard interaction handler
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = index === 0 ? filters.length - 1 : index - 1;
        onChange(filters[nextIndex]);
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = index === filters.length - 1 ? 0 : index + 1;
        onChange(filters[nextIndex]);
        break;

      case 'Home':
        e.preventDefault();
        onChange(filters[0]);
        break;

      case 'End':
        e.preventDefault();
        onChange(filters[filters.length - 1]);
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
      className  = "filter" 
      role       = "tablist" 
      aria-label = "Filter tasks by status"
      aria-live  = "polite"
    >
      {filters.map((filterValue, index) => (
        <button
          key           = {filterValue}
          ref           = {el => buttonsRef.current[index] = el}
          role          = "tab"
          aria-selected = {value === filterValue}
          aria-controls = "filtered-projects"
          aria-label    = {filterDescriptions[filterValue]}
          aria-current  = {value === filterValue ? 'page' : undefined}
          onClick       = {() => onChange(filterValue)}
          onKeyDown     = {(e) => handleKeyDown(e, index)}
          tabIndex      = {value === filterValue ? 0 : -1}
          data-status   = {filterValue}
        >
          {filterValue === 'all' ? null : (
            <span className="icon-wrapper" aria-hidden="true">
              {icons[filterValue as TaskStatus]}
            </span>
          )}
          <span className="filter-text">
            {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
          </span>
        </button>
      ))}
    </div>
  );
}