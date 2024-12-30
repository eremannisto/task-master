import { useRef, useState, useEffect } from 'react';
import styles from './Masonry.module.css';

interface MasonryProps<T> {
  items: T[];
  gap?: number;
  render: (item: T, index: number) => React.ReactNode;
}

export function Masonry<T>({ 
  items, 
  gap = 0.8,
  render 
}: MasonryProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);

  // Helper function to focus and scroll with offset
  const focusWithScroll = (element: HTMLElement | undefined) => {
    if (!element) return;
    element.focus();
    scrollIntoViewWithOffset(element);
  };

  const scrollIntoViewWithOffset = (element: HTMLElement) => {
    const navOffsetRem = 16; // Navigation height in rem
    const extraPaddingRem = 1; // Extra padding in rem
    const navOffset = navOffsetRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const rect = element.getBoundingClientRect();
    const isAboveNav = rect.top < navOffset;
    
    if (isAboveNav) {
      const extraPadding = extraPaddingRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
      window.scrollBy({
        top: rect.top - navOffset - extraPadding,
        behavior: 'smooth'
      });
    }
  };

  // Handle focus events for tab navigation
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest(`.${styles.item}`)) {
        scrollIntoViewWithOffset(target);
      }
    };

    containerRef.current?.addEventListener('focusin', handleFocus);
    return () => containerRef.current?.removeEventListener('focusin', handleFocus);
  }, []);

  // Update column count based on container width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateColumnCount = () => {
      const width = containerRef.current?.offsetWidth || 0;
      let cols = 4;
      if (width <= 640) cols = 1;
      else if (width <= 1024) cols = 2;
      else if (width <= 1280) cols = 3;
      setColumnCount(cols);
    };

    const observer = new ResizeObserver(updateColumnCount);
    observer.observe(containerRef.current);
    updateColumnCount(); // Initial count

    return () => observer.disconnect();
  }, []);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      
      const activeElement = document.activeElement;
      // Only handle arrow keys when focused on the article element
      if (!activeElement?.matches('article')) return;

      const columns = Array.from(containerRef.current?.querySelectorAll(`.${styles.column}`) || []);
      const currentColumn = activeElement.closest(`.${styles.column}`);
      if (!currentColumn) return;

      const currentColumnIndex = columns.indexOf(currentColumn as Element);
      const itemsInCurrentColumn = Array.from(currentColumn.querySelectorAll('article'));
      const currentItemIndex = itemsInCurrentColumn.findIndex(item => item === activeElement);
      
      e.preventDefault();
      let nextElement: HTMLElement | undefined;

      switch (e.key) {
        case 'ArrowLeft':
          if (currentColumnIndex > 0) {
            const prevColumn = columns[currentColumnIndex - 1];
            const itemsInPrevColumn = Array.from(prevColumn.querySelectorAll('article'));
            nextElement = itemsInPrevColumn[Math.min(currentItemIndex, itemsInPrevColumn.length - 1)] as HTMLElement;
          }
          break;
        case 'ArrowRight':
          if (currentColumnIndex < columns.length - 1) {
            const nextColumn = columns[currentColumnIndex + 1];
            const itemsInNextColumn = Array.from(nextColumn.querySelectorAll('article'));
            nextElement = itemsInNextColumn[Math.min(currentItemIndex, itemsInNextColumn.length - 1)] as HTMLElement;
          }
          break;
        case 'ArrowUp':
          if (currentItemIndex > 0) {
            nextElement = itemsInCurrentColumn[currentItemIndex - 1] as HTMLElement;
          }
          break;
        case 'ArrowDown':
          if (currentItemIndex < itemsInCurrentColumn.length - 1) {
            nextElement = itemsInCurrentColumn[currentItemIndex + 1] as HTMLElement;
          }
          break;
      }

      if (nextElement) {
        e.preventDefault();
        focusWithScroll(nextElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [columnCount]);

  // Create columns with correct item distribution
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  
  // Fill columns vertically for correct up/down navigation
  items.forEach((item, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(item);
  });

  return (
    <div 
      ref={containerRef}
      className={styles.masonry}
      style={{ 
        '--gap': `${gap}rem`,
        '--columns': columnCount
      } as React.CSSProperties}
      aria-label="Projects"
    >
      {columns.map((column, colIndex) => (
        <div key={colIndex} className={styles.column}>
          {column.map((item, itemIndex) => (
            <div key={itemIndex} className={styles.item}>
              {render(item, itemIndex * columnCount + colIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 