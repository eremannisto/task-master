import { Skeleton } from '@/components/Skeleton/Skeleton.component';
import styles from './Project.module.css';

export const ProjectSkeleton = () => {
  return (
    <div className={styles.projectSkeleton}>
      {/* Project Header */}
      <div className={styles.header}>
        <Skeleton height={18} width="70%"/>
        <Skeleton height={18} width="100%"/>
        <Skeleton height={18} width="80%"/>
      </div>

      {/* Task List */}
      <div className={styles.tasks} style={{ marginTop: '1.6rem' }}>
        {/* Random amount of tasks */}
        {Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => (
          <div className={styles.task} key={index}>
            <Skeleton height={18} width="100%"/>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className={styles.actions} style={{ marginTop: '1.6rem' }}>
        <Skeleton height={24} width={"100%"} />
        <Skeleton height={24} width={"100%"} />
      </div>
    </div>
  );
}; 