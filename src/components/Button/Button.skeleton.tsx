import { Skeleton } from '@/components/Skeleton/Skeleton.component';
import styles       from './Button.module.css';

// TODO: Implement Button Skeleton
export const ButtonSkeleton = () => {
  return <Skeleton className={styles.button} />;
};