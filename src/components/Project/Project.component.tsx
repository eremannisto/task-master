import { useState, useRef, useEffect, useCallback, useMemo, memo, forwardRef } from 'react';
import { CircleDashed, CircleDot, CircleCheck, Trash, Plus, X, PencilLine, EyeOff } from 'lucide-react';
import type { ProjectProps, ProjectFormProps, ValidationOptions, TaskComponent} from './Project.types';

import { Modal }      from '@/components/Modal/Modal.component';
import { generateId } from '@utils/generateId';
import { Form }       from '@components/Form/Form.component';
import { Button }     from '@components/Button/Button.component';
import styles         from './Project.module.css';

/**
 * Project component
 * - Displays and manages a project and its tasks
 * - Supports task creation, editing, deletion
 * - Implements task status management
 * - Provides keyboard navigation and accessibility
 * - Handles task filtering by status
 */
const ProjectBase = forwardRef<HTMLElement, ProjectProps>(({ 
  id,
  project: initialProject, 
  onDelete, 
  onEdit, 
  onTaskUpdate,
  filter,
  onKeyDown
}, ref) => {

  /**
   * Component state
   * - tasks: Current tasks in the project
   * - newTaskText: Text for new task being created
   * - editingTaskId: ID of task currently being edited
   * - editingText: Current text while editing a task
   * - showDeleteConfirm: Controls delete confirmation modal
   */
  const [ tasks,             setTasks             ] = useState(initialProject?.tasks || []);
  const [ newTaskText,       setNewTaskText       ] = useState('');
  const [ editingTaskId,     setEditingTaskId     ] = useState<string | null>(null);
  const [ editingText,       setEditingText       ] = useState('');
  const [ showDeleteConfirm, setShowDeleteConfirm ] = useState(false);

  /**
   * Refs for managing textarea elements
   * - textareaRefs: Map of task IDs to textarea elements
   * - newTaskTextareaRef: Ref for new task input
   */
  const textareaRefs       = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const newTaskTextareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Sync tasks with parent component
   * Updates local task state when project tasks change
   */
  useEffect(() => {
    if (initialProject?.tasks) {
      setTasks(initialProject.tasks);
    }
  }, [initialProject?.tasks]);

  /**
   * Textarea height management
   * Adjusts heights of all task textareas when tasks change
   */
  useEffect(() => {
    initialProject.tasks.forEach(task => {
      const textarea = textareaRefs.current.get(task.id);
      if (textarea) {
        adjustTextareaHeight(textarea);
      }
    });

    if (newTaskTextareaRef.current) {
      adjustTextareaHeight(newTaskTextareaRef.current);
    }
  }, [initialProject.tasks]);

  /**
   * Task filtering
   * - Filters tasks based on current filter status
   * - Memoized to prevent unnecessary recalculations
   */
  const visibleTasks = useMemo(() => {
    if (!tasks?.length) return [];
    return filter === 'all' 
      ? tasks 
      : tasks.filter(task => task?.status === filter);
  }, [tasks, filter]);

  const hiddenTasks = tasks.length - visibleTasks.length;

  /**
   * Task operations
   * - handleTaskUpdate: Generic task update function
   * - handleTaskDelete: Removes a task
   * - handleTaskStatusChange: Cycles task status
   * - handleTaskEdit: Updates task description
   * - handleAddTask: Creates a new task
   */
  const handleTaskUpdate = (updateFn: (tasks: TaskComponent[]) => TaskComponent[]) => {
    const newTasks = updateFn(tasks);
    setTasks(newTasks);
    onTaskUpdate(newTasks);
  };

  /**
   * Handle task deletion
   * - Removes a task from the project
   */
  const handleTaskDelete = (taskId: string) => {
    handleTaskUpdate((currentTasks) => 
      currentTasks.filter(task => task.id !== taskId)
    );
  };

  /**
   * Handle task status change
   * - Cycles task status between todo, doing, and done
   * - Maintains focus on the button after status change
   */
  const handleTaskStatusChange = (taskId: string, button?: HTMLElement) => {
    handleTaskUpdate((currentTasks) => 
      currentTasks.map(task => {
        if (task.id === taskId) {
          const nextStatus = 
            task.status === 'todo' ? 'doing' :
            task.status === 'doing' ? 'done' : 'todo';
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
    // Maintain focus on the button after status change
    if (button) {
      requestAnimationFrame(() => {
        button.focus();
      });
    }
  };

  /**
   * Edit a task description
   * - Updates the task description if it's not empty
   * - Deletes the task if the new description is empty
   */
  const handleTaskEdit = (taskId: string, description: string) => {
    if (!description.trim()) {
      handleTaskDelete(taskId);
    } else {
      handleTaskUpdate((currentTasks) =>
        currentTasks.map(task => 
          task.id === taskId ? { ...task, description: description.trim() } : task
        )
      );
    }
  };

  /**
   * Add a new task to the project
   * - Generates a new task ID
   * - Adds the new task to the project
   */
  const handleAddTask = (description: string) => {
    const newTask = {
      id: `${initialProject.id}-${initialProject.tasks.length + 1}`,
      description,
      status: 'todo' as const
    };
    handleTaskUpdate((currentTasks) => [...currentTasks, newTask]);
  };

  /**
   * UI helpers
   * - adjustTextareaHeight: Dynamically adjusts textarea height
   * - getTaskIcon: Returns appropriate icon for task status
   */
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  /**
   * Get task icon
   * - Returns an icon based on the task status
   */
  const getTaskIcon = (status: TaskComponent['status']) => {
    switch (status) {
      case 'todo'  : return <CircleDashed className="task-icon" aria-hidden="true" />;
      case 'doing' : return <CircleDot    className="task-icon" aria-hidden="true" />;
      case 'done'  : return <CircleCheck  className="task-icon" aria-hidden="true" />;
    }
  };

  /**
   * Event handlers
   * - handleTaskKeyDown: Keyboard navigation for tasks
   * - handleConfirmDelete: Project deletion confirmation
   */
  const handleTaskKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTaskStatusChange(taskId, e.currentTarget as HTMLElement);
    }
  };

  /**
   * Handle project deletion
   * - Deletes the project and closes the delete confirmation modal
   */
  const handleConfirmDelete = useCallback(() => {
    onDelete(initialProject.id);
    setShowDeleteConfirm(false);
  }, [onDelete, initialProject.id]);

  return (
    <article 
      ref={ref}
      id={id}
      className={styles.project}
      tabIndex={0}
      aria-label={`Project: ${initialProject.name}. Contains ${tasks.length} tasks.`}
      onKeyDown={onKeyDown}
    >
      {/* Project Header Section
          - Displays project name and description
          - Provides context for screen readers
      */}
      <header>
        <div className={styles.details}>
          <h2 className={styles.title}>{initialProject.name}</h2>
          <p className={styles.description}>{initialProject.description}</p>
        </div>
      </header>

      {/* Task List Section
          - Contains all tasks for the project
          - Supports filtering by task status
          - Provides keyboard navigation
      */}
      <div 
        className={styles.tasks} 
        role="group"
        aria-label={`Tasks for project ${initialProject.name}. ${tasks.length} total tasks.`}
      >
        {visibleTasks.map((task) => (
          <div 
            key={task.id} 
            className={styles.task} 
            data-status={task.status}
            role="group"
            aria-label={`Task with status ${task.status}: ${task.description}`}
          >
            {/* Task Status Toggle Button
                - Cycles through todo -> doing -> done
                - Provides visual and screen reader feedback
                - Supports keyboard interaction
            */}
            <button
              data-action="status"
              className={styles.statusButton}
              onClick={(e) => handleTaskStatusChange(task.id, e.currentTarget)}
              onKeyDown={(e) => handleTaskKeyDown(e, task.id)}
              aria-label={`Change status of task: ${task.description}. Current status: ${task.status}`}
              role="switch"
              aria-checked={task.status === 'done'}
            >
              <span data-icon="status">
                {getTaskIcon(task.status)}
              </span>
              <span data-icon="delete">
                <Trash className={styles.icon} aria-hidden="true" />
              </span>
            </button>

            {/* Task Description Textarea
                - Auto-resizing input field
                - Supports markdown editing
                - Handles empty state deletion
                - Provides keyboard shortcuts
            */}
            <textarea
              ref={(el) => {
                if (el) textareaRefs.current.set(task.id, el);
                else textareaRefs.current.delete(task.id);
              }}
              className={styles.description}
              value={editingTaskId === task.id ? editingText : task.description}
              onChange={(e) => {
                if (editingTaskId === task.id) {
                  setEditingText(e.target.value);
                  adjustTextareaHeight(e.target);
                }
              }}
              onFocus={(e) => {
                setEditingTaskId(task.id);
                setEditingText(task.description);
                adjustTextareaHeight(e.target);
              }}
              onBlur={() => {
                if (editingTaskId === task.id && editingText !== task.description) {
                  handleTaskEdit(task.id, editingText);
                }
                setEditingTaskId(null);
                setEditingText('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (editingText !== task.description) {
                    handleTaskEdit(task.id, editingText);
                  }
                  setEditingTaskId(null);
                  setEditingText('');
                }
                if (e.key === 'Escape') {
                  setEditingTaskId(null);
                  setEditingText('');
                }
              }}
              rows={1}
              aria-label={`Edit task description: ${task.description}`}
              style={{
                resize: 'none',
                overflow: 'hidden',
                minHeight: '1.5em'
              }}
            />

            {/* Task Delete Button
                - Removes task from project
                - Provides confirmation via aria-label
                - Maintains focus management
            */}
            <button
              data-action="delete"
              className={styles.deleteButton}
              onClick={() => handleTaskDelete(task.id)}
              aria-label={`Delete task with description: ${task.description}`}
            >
              <X className={styles.icon} aria-hidden="true" />
            </button>
          </div>
        ))}

        {/* Hidden Tasks Indicator
            - Shows count of filtered tasks
            - Updates via aria-live for screen readers
            - Provides visual feedback
        */}
        {hiddenTasks > 0 && (
          <div 
            className={`${styles.task} ${styles["hidden-tasks"]}`}
            role="status"
            aria-live="polite"
          >
            <div className={styles["fake-button"]} aria-hidden="true">
              <span data-icon="status">
                <EyeOff className={styles.icon} aria-hidden="true" />
              </span>
            </div>
            <span className={styles.description}>
              {hiddenTasks} task{hiddenTasks !== 1 ? 's' : ''} hidden by current filter
            </span>
          </div>
        )}

        {/* New Task Input Section
            - Allows quick task creation
            - Auto-focuses on activation
            - Supports keyboard shortcuts
            - Provides clear accessibility labels
        */}
        <div 
          className={`${styles.task} ${styles["new-task"]}`}
          role="group"
          aria-label="Add a new task to this project"
        >
          <button
            data-action="status"
            className={styles.statusButton}
            aria-label="New task will start with todo status"
            disabled
          >
            <Plus className={styles.icon} aria-hidden="true" />
          </button>
          <textarea
            ref={newTaskTextareaRef}
            className={`${styles.description} ${styles["new-task-description"]}`}
            value={newTaskText}
            onChange={(e) => {
              setNewTaskText(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            onFocus={() => {
              adjustTextareaHeight(newTaskTextareaRef.current!);
            }}
            onBlur={() => {
              if (!newTaskText.trim()) {
                setNewTaskText('');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newTaskText.trim()) {
                  handleAddTask(newTaskText.trim());
                  setNewTaskText('');
                }
              }
              if (e.key === 'Escape') {
                setNewTaskText('');
              }
            }}
            placeholder="Add new task..."
            rows={1}
            aria-label="Enter description for new task. Press Enter to add."
            style={{
              resize: 'none',
              overflow: 'hidden',
              minHeight: '1.5em',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Project Actions Section
          - Edit and delete project buttons
          - Provides confirmation dialogs
          - Maintains keyboard accessibility
      */}
      <footer className={styles.actions}>
        <Button
          icon={PencilLine}
          title="Edit"
          theme="zinc"
          variant="solid"
          onClick={() => onEdit?.(initialProject)}
          aria-haspopup="true"
          aria-label={`Edit project ${initialProject.name}`}
          className={`${styles["project-action"]} ${styles["project-edit"]}`}
        />
        <Button
          icon={Trash}
          title="Delete"
          theme="red"
          variant="solid"
          onClick={() => setShowDeleteConfirm(true)}
          aria-haspopup="true"
          aria-label={`Delete project ${initialProject.name}`}
          className={`${styles["project-action"]} ${styles["project-delete"]}`}
        />
      </footer>

      {/* Delete Confirmation Modal
          - Prevents accidental deletion
          - Provides clear warning message
          - Maintains focus trap
          - Supports keyboard interaction
      */}
      {showDeleteConfirm && (
        <Modal
          title="Delete Project"
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className={styles.confirmDelete}>
            <p>This action cannot be undone. Are you sure you want to delete <strong>{initialProject.name}</strong>?</p>
            
            <div className={styles.confirmActions}>
              <Button
                size="medium"
                title="Cancel"
                variant="solid"
                theme="zinc"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <Button
                size="medium"
                icon={Trash}
                title="Delete Project"
                variant="solid"
                theme="red"
                onClick={handleConfirmDelete}
              />
            </div>
          </div>
        </Modal>
      )}
    </article>
  );
});

/**
 * Memoized Project component
 * - Optimizes rendering by comparing props
 * - Uses shallow comparison for tasks array
 * - Returns true if props are unchanged
 */
export const Project = memo(ProjectBase, (prevProps: ProjectProps, nextProps: ProjectProps) => {
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.filter === nextProps.filter &&
    JSON.stringify(prevProps.project.tasks) === JSON.stringify(nextProps.project.tasks)
  );
});

/**
 * Default validation options for project ID
 * - Allow letters, numbers, and dashes
 * - Minimum length of 3 characters
 * - Maximum length of 60 characters
 */
export const DEFAULT_VALIDATION: ValidationOptions = {
  allowLetters    : true,
  allowNumbers    : true,
  allowCharacters : ['-'],  // Only allow dashes as special characters
  minimumLength   : 3,
  maximumLength   : 60
}; 

/**
 * Validate project ID
 * - Checks if the ID is empty or within the allowed length
 * - Validates the characters in the ID
 * - Returns an error message if the ID is invalid
 */
const validateId = (value: string, options: ValidationOptions = DEFAULT_VALIDATION): string | null => {
  if (!value) return null; // Allow empty for auto-generation
  
  if (value.length < options.minimumLength) {
    return `ID must be at least ${options.minimumLength} characters. Only letters (a-zA-Z), numbers (0-9), and dashes (-) are allowed`;
  }
  
  if (value.length > options.maximumLength) {
    return `ID cannot exceed ${options.maximumLength} characters. Only letters (a-zA-Z), numbers (0-9), and dashes (-) are allowed`;
  }

  const allowedChars = new RegExp(
    `^[${options.allowLetters ? 'a-zA-Z' : ''}${options.allowNumbers ? '0-9' : ''}${options.allowCharacters.map(c => `\\${c}`).join('')}]*$`
  );

  if (!allowedChars.test(value)) {
    return `ID can only contain letters (az-AZ), numbers (0-9), and dashes (-)`;
  }

  return null;
};

/**
 * Project form component
 * - Manages project creation and editing
 * - Validates project ID and name
 * - Handles form submission and cancellation
 * - Provides a form interface for project details
 */
export const ProjectForm = ({ 
  project, 
  onSubmit, 
  onCancel, 
  idValidation = DEFAULT_VALIDATION,
  existingIds = []
}: ProjectFormProps) => {
  const handleSubmit = (values: { id?: string; name: string; description: string }) => {
    // When editing, use the existing project ID
    const submissionId = project ? project.id : (values.id?.trim() || generateId());
    
    if (!project) { // Only validate ID for new projects
      const error = validateId(submissionId, idValidation);
      if (error) {
        return { id: error };
      }

      if (existingIds.includes(submissionId)) {
        return { id: 'This ID is already in use' };
      }
    }

    onSubmit({
      id: submissionId,
      name: values.name.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <Form
      config={{
        ...(project ? {} : {
          id: {
            label: 'Project ID',
            type: 'text' as const,
            placeholder: 'Enter ID or leave empty for auto-generation',
            readOnly: !!project,
            validation: {
              required: false,
              validate: (value: string) => {
                if (!value) return true; // Allow empty for new projects
                const error = validateId(value, idValidation);
                if (error) return error;
                
                // Check uniqueness only for new projects
                if (existingIds.includes(value)) {
                  return 'This ID is already in use';
                }
                return true;
              }
            }
          }
        }),
        name: {
          label: 'Project name',
          type: 'text' as const,
          placeholder: 'Enter project name',
          autoFocus: true,
          validation: {
            required: true,
            minLength: 3,
            maxLength: 80
          }
        },
        description: {
          label: 'Project description',
          type: 'textarea' as const,
          placeholder: 'Enter project description',
          rows: 3,
          validation: {
            required: true,
            minLength: 1,
            maxLength: 160
          }
        }
      }}
      initialValues={project}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={project ? 'Save Changes' : 'Create Project'}
      cancelLabel="Cancel"
    />
  );
};
