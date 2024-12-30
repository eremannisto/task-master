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

export type ValidationOptions = {
  required?: boolean;
  unique?: boolean;
  minLength?: number;
  maxLength?: number;
  allowedCharacters?: string[];
  notAllowedCharacters?: string[];
};

export type FormConfig = {
  [key: string]: {
    label: string;
    validation: ValidationOptions;
  };
};

export type FormProps<T extends FormConfig> = {
  config: T;
  initialValues?: { [K in keyof T]: string };
  onSubmit: (values: { [K in keyof T]: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};