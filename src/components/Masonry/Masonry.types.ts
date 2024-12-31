/**
 * Props for Masonry component
 * - items: Array of items to display in the grid
 * - gap: Space between items in rem units
 * - render: Function to render each item
 */
export interface MasonryProps<T> {
  items: T[];
  gap?: number;
  render: (item: T, index: number) => React.ReactNode;
}
