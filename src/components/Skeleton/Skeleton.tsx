import { CSSProperties }     from 'react';
import { SkeletonComponent } from '@types';
import './Skeleton.css';

export const Skeleton = ({ 
  width     = '100%', 
  height    = '2rem',
  radius    = '0.4rem',
  className = ''
}: SkeletonComponent) => {
  const style: CSSProperties = {
    width        : typeof width  === 'number' ? `${width}px`  : width,
    height       : typeof height === 'number' ? `${height}px` : height,
    borderRadius : typeof radius === 'number' ? `${radius}px` : radius
  };
  return (
    <div 
      className={`skeleton ${className}`}
      style={style}
      role="progressbar"
      aria-busy="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext="Loading..."
    />
  );
};