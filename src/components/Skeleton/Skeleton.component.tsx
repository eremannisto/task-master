import { CSSProperties }          from 'react';
import type { SkeletonComponent } from './Skeleton.types';
import styles                     from './Skeleton.module.css';

/**
 * Skeleton component
 * - Displays a loading placeholder
 * - Customizable width, height, and border radius
 * - Optional additional CSS class name
 */
export const Skeleton = ({ 
  width  = '100%', 
  height = '2rem',
  radius = '0.4rem',
}: SkeletonComponent) => {
  const style: CSSProperties = {
    width        : typeof width  === 'number' ? `${width}px`  : width,
    height       : typeof height === 'number' ? `${height}px` : height,
    borderRadius : typeof radius === 'number' ? `${radius}px` : radius
  };    
  return (
    <div 
      className={styles.skeleton}
      style={style}
      role="progressbar"
      aria-busy="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext="Loading..."
    />
  );
};