import { useState, useRef, useEffect, useCallback, useMemo, memo, forwardRef } from 'react';
import { CircleDashed, CircleDot, CircleCheck, Trash, Plus, X, SquarePen, EyeOff } from 'lucide-react';
import { TaskComponent, ProjectComponent, TaskStatus } from '@types';
import { Modal } from '@components/Modal/Modal';
import styles from './Project.module.css';

interface ProjectProps {
  id?: string;
  project: ProjectComponent;
  onDelete: (id: string) => void;
  onEdit?: (project: ProjectComponent) => void;
  onTaskUpdate: (tasks: TaskComponent[]) => void;
  filter: 'all' | TaskStatus;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * Project component
 * @param project      : ProjectComponent
 * @param onDelete     : (id: string) => void
 * @param onEdit       : (project: ProjectComponent) => void
 * @param onTaskUpdate : (tasks: TaskComponent[]) => void
 * @param filter       : 'all' | TaskStatus
 * @returns 
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

  // Task state
  const [ tasks,             setTasks             ] = useState(initialProject?.tasks || []);
  const [ newTaskText,       setNewTaskText       ] = useState('');
  const [ editingTaskId,     setEditingTaskId     ] = useState<string | null>(null);
  const [ editingText,       setEditingText       ] = useState('');
  const [ showDeleteConfirm, setShowDeleteConfirm ] = useState(false);

  // Refs for managing textarea heights
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const newTaskTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync tasks with parent when they change
  useEffect(() => {
    if (initialProject?.tasks) {
      setTasks(initialProject.tasks);
    }
  }, [initialProject?.tasks]);

  // Adjust textarea heights when tasks change
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

  // Filter visible tasks based on status
  const visibleTasks = useMemo(() => {
    if (!tasks?.length) return [];
    return filter === 'all' 
      ? tasks 
      : tasks.filter(task => task?.status === filter);
  }, [tasks, filter]);

  const hiddenTasks = tasks.length - visibleTasks.length;

  // Task operations
  const handleTaskUpdate = (updateFn: (tasks: TaskComponent[]) => TaskComponent[]) => {
    const newTasks = updateFn(tasks);
    setTasks(newTasks);
    onTaskUpdate(newTasks);
  };

  const handleTaskDelete = (taskId: string) => {
    handleTaskUpdate((currentTasks) => 
      currentTasks.filter(task => task.id !== taskId)
    );
  };

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

  const handleAddTask = (description: string) => {
    const newTask = {
      id: `${initialProject.id}-${initialProject.tasks.length + 1}`,
      description,
      status: 'todo' as const
    };
    handleTaskUpdate((currentTasks) => [...currentTasks, newTask]);
  };

  // UI helpers
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const getTaskIcon = (status: TaskComponent['status']) => {
    switch (status) {
      case 'todo'  : return <CircleDashed className="task-icon" aria-hidden="true" />;
      case 'doing' : return <CircleDot    className="task-icon" aria-hidden="true" />;
      case 'done'  : return <CircleCheck  className="task-icon" aria-hidden="true" />;
    }
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTaskStatusChange(taskId, e.currentTarget as HTMLElement);
    }
  };

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
      role="listitem"
      aria-label={`Project: ${initialProject.name}`}
      onKeyDown={onKeyDown}
    >
      {/* Project Header */}
      <header>
        <div className={styles.details}>
          <h2 className={styles.title}>{initialProject.name}</h2>
          <p className={styles.description}>{initialProject.description}</p>
        </div>
      </header>

      {/* Task List */}
      <div 
        className={styles.tasks} 
        role="group"
        aria-label={`Tasks for ${initialProject.name}`}
      >
        {visibleTasks.map((task) => (
          <div 
            key={task.id} 
            className={styles.task} 
            data-status={task.status}
            role="group"
            aria-label={`Task: ${task.description}`}
          >
            {/* Task Status Toggle */}
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

            {/* Task Description */}
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

            {/* Task Delete Button */}
            <button
              data-action="delete"
              className={styles.deleteButton}
              onClick={() => handleTaskDelete(task.id)}
              aria-label={`Delete task: ${task.description}`}
            >
              <X className={styles.icon} aria-hidden="true" />
            </button>
          </div>
        ))}

        {/* Hidden Tasks Indicator */}
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
              {hiddenTasks} task{hiddenTasks !== 1 ? 's' : ''} hidden by filter
            </span>
          </div>
        )}

        {/* New Task Input */}
        <div 
          className={`${styles.task}`}
          role="group"
          aria-label="Add new task"
        >
          <button
            data-action="status"
            className={styles.statusButton}
            aria-label="New task status"
            disabled
          >
            <Plus className={styles.icon} aria-hidden="true" />
          </button>
          <textarea
            ref={newTaskTextareaRef}
            className={styles.description}
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
            aria-label="Enter new task description"
            style={{
              resize: 'none',
              overflow: 'hidden',
              minHeight: '1.5em'
            }}
          />
        </div>
      </div>

      {/* Project Actions */}
      <footer className={styles.actions}>
        <button 
          className={styles.edit} 
          data-action="edit" 
          onClick={() => onEdit?.(initialProject)} 
          aria-haspopup="true" 
          aria-label="Edit project"
        >
          <SquarePen className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>Edit</span>
        </button>
        <button 
          className={styles.delete} 
          data-action="delete" 
          onClick={() => setShowDeleteConfirm(true)} 
          aria-haspopup="true" 
          aria-label="Delete project"
        >
          <Trash className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>Delete</span>
        </button>
      </footer>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          title="Delete Project"
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className={styles.confirmDelete}>
            <p>Are you sure you want to delete "{initialProject.name}"?</p>
            <p className={styles.warning}>This action cannot be undone.</p>
            
            <div className={styles.confirmActions}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                data-action="secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                data-action="danger"
              >
                Delete Project
              </button>
            </div>
          </div>
        </Modal>
      )}
    </article>
  );
});

export const Project = memo(ProjectBase, (prevProps: ProjectProps, nextProps: ProjectProps) => {
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.filter === nextProps.filter &&
    JSON.stringify(prevProps.project.tasks) === JSON.stringify(nextProps.project.tasks)
  );
});