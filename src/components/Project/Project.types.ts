/**
 * Task status options
 * - todo: Task not started
 * - doing: Task in progress
 * - done: Task completed
 */
export type TaskStatus = 'todo' | 'doing' | 'done';

/**
 * Task data structure
 * - id: Unique identifier
 * - description: Task description
 * - status: Current task status
 */
export interface TaskComponent {
  id          : string;
  description : string;
  status      : TaskStatus;
}

/**
 * Project data structure
 * - id: Unique identifier
 * - name: Project name
 * - description: Project description
 * - tasks: Array of tasks in the project
 */
export interface ProjectComponent {
  id          : string;
  name        : string;
  description : string;
  tasks       : TaskComponent[];
}

/**
 * Props for Project component
 * - id: Optional unique identifier for the project
 * - project: Project data including tasks
 * - onDelete: Callback when project is deleted
 * - onEdit: Optional callback when project is edited
 * - onTaskUpdate: Callback when tasks are modified
 * - filter: Current task filter status
 * - onKeyDown: Optional keyboard event handler
 */
export interface ProjectProps {
  id?          : string;
  project      : ProjectComponent;
  onDelete     : (id: string) => void;
  onEdit?      : (project: ProjectComponent) => void;
  onTaskUpdate : (tasks: TaskComponent[]) => void;
  filter       : 'all' | TaskStatus;
  onKeyDown?   : (e: React.KeyboardEvent) => void;
}

/**
 * Validation options for project ID
 * - allowLetters: Allow letters (a-z, A-Z)
 * - allowNumbers: Allow numbers (0-9)
 * - allowCharacters: Array of allowed special characters
 * - minimumLength: Minimum length
 * - maximumLength: Maximum length
 */
export interface ValidationOptions {
  allowLetters    : boolean;     // Allow a-z, A-Z
  allowNumbers    : boolean;     // Allow 0-9
  allowCharacters : string[];    // Array of allowed special characters
  minimumLength   : number;      // Minimum length
  maximumLength   : number;      // Maximum length
}

/**
 * Props for ProjectForm component
 * - project: The project to edit (optional)
 * - onSubmit: Callback for form submission
 * - onCancel: Callback for form cancellation
 * - idValidation: Validation options for project ID
 * - existingIds: Array of existing project IDs to check for uniqueness
 */
export interface ProjectFormProps {
  project?      : ProjectComponent;
  onSubmit      : (data: Omit<ProjectComponent, 'tasks'>) => void;
  onCancel      : () => void;
  idValidation? : ValidationOptions;
  existingIds?  : string[];
}
