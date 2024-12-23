import { useState, useEffect } from 'react';
import styles from './Form.module.css';
import { ProjectComponent } from '@types';

interface ProjectFormProps {
  project?: ProjectComponent;
  onSubmit: (project: Omit<ProjectComponent, 'id' | 'tasks'>) => void;
  onCancel: () => void;
}

export const Form = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} data-action="secondary">
          Cancel
        </button>
        <button type="submit" data-action="primary">
          {project ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};