import { Skeleton } from '@/components/Skeleton/Skeleton.component';
import styles from './Filter.module.css';

export const FilterSkeleton = () => {
  // Create 4 skeleton items to match 'all', 'todo', 'doing', 'done'
  return (
    <div className={styles.filters} data-skeleton="true">
      {[...Array(4)].map((_, index) => (
        <div key={index} className={styles.label}>
          <Skeleton 
            width={"100%"}
            height={"100%"}
            radius={4}
          />
        </div>
      ))}
    </div>
  );
};
