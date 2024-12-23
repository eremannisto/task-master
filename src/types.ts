export interface SkeletonComponent {
  width?    : string | number;
  height?   : string | number;
  radius?   : string | number;
  className?: string;
}

export interface ProjectComponent {
  id         : string;
  name       : string;
  description: string;
  tasks      : TaskComponent[];
}

export interface TaskComponent {
  id         : string;
  description: string;
  status     : string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export type FilterValue = TaskStatus | 'all';