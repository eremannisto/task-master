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
      // Only handle arrow keys when focused on the article element itself
      if (!activeElement?.matches('article[role="list"]')) return;

      const columns = Array.from(containerRef.current?.querySelectorAll(`.${styles.column}`) || []);
      const currentColumn = activeElement.closest(`.${styles.column}`);
      if (!currentColumn) return;

      const currentColumnIndex = columns.indexOf(currentColumn as Element);
      const itemsInCurrentColumn = Array.from(currentColumn.querySelectorAll(`.${styles.item}`));
      const currentItemIndex = itemsInCurrentColumn.findIndex(item => item.contains(activeElement));
      
      e.preventDefault();
      let nextElement: HTMLElement | undefined;

      switch (e.key) {
        case 'ArrowLeft':
          if (currentColumnIndex > 0) {
            const prevColumn = columns[currentColumnIndex - 1];
            const itemsInPrevColumn = prevColumn.querySelectorAll(`.${styles.item}`);
            const targetItem = itemsInPrevColumn[Math.min(currentItemIndex, itemsInPrevColumn.length - 1)];
            nextElement = targetItem?.querySelector('article[role="listitem"]') as HTMLElement;
          }
          break;
        case 'ArrowRight':
          if (currentColumnIndex < columns.length - 1) {
            const nextColumn = columns[currentColumnIndex + 1];
            const itemsInNextColumn = nextColumn.querySelectorAll(`.${styles.item}`);
            const targetItem = itemsInNextColumn[Math.min(currentItemIndex, itemsInNextColumn.length - 1)];
            nextElement = targetItem?.querySelector('article[role="listitem"]') as HTMLElement;
          }
          break;
        case 'ArrowUp':
          if (currentItemIndex > 0) {
            const targetItem = itemsInCurrentColumn[currentItemIndex - 1];
            nextElement = targetItem?.querySelector('article[role="listitem"]') as HTMLElement;
          }
          break;
        case 'ArrowDown':
          if (currentItemIndex < itemsInCurrentColumn.length - 1) {
            const targetItem = itemsInCurrentColumn[currentItemIndex + 1];
            nextElement = targetItem?.querySelector('article[role="listitem"]') as HTMLElement;
          }
          break;
      }

      focusWithScroll(nextElement);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [columnCount]);

  // Create columns with correct item distribution
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  const rowCount = Math.ceil(items.length / columnCount);
  
  // Fill columns in row-first order for correct tab sequence
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < columnCount; col++) {
      const index = row * columnCount + col;
      if (index < items.length) {
        columns[col].push(items[index]);
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={styles.masonry}
      style={{ 
        '--gap': `${gap}rem`,
        '--columns': columnCount
      } as React.CSSProperties}
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