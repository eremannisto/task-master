import { useState, useEffect } from 'react';
import styles from './Form.module.css';
import { ProjectComponent } from '@types';

interface IdValidationOptions {
  allowLetters?: boolean;   // Allow a-z, A-Z
  allowNumbers?: boolean;   // Allow 0-9
  allowDashes?: boolean;    // Allow -
  allowSpaces?: boolean;    // Allow spaces
  allowDots?: boolean;      // Allow .
  allowUnderscores?: boolean; // Allow _
  minLength?: number;
  maxLength?: number;
}

const DEFAULT_VALIDATION: IdValidationOptions = {
  allowLetters: true,
  allowNumbers: true,
  allowDashes: false,
  allowSpaces: false,
  allowDots: false,
  allowUnderscores: false,
  minLength: 1,
  maxLength: 60
};

const buildIdRegex = (options: IdValidationOptions): RegExp => {
  let pattern = '^[';
  
  if (options.allowLetters) pattern += '\\p{L}';
  if (options.allowNumbers) pattern += '\\p{N}';
  if (options.allowDashes) pattern += '\\-';
  if (options.allowSpaces) pattern += '\\s';
  if (options.allowDots) pattern += '\\.';
  if (options.allowUnderscores) pattern += '_';
  
  pattern += `]{${options.minLength || 1},${options.maxLength || 60}}$`;
  
  return new RegExp(pattern, 'u');
};

interface ProjectFormProps {
  project?: ProjectComponent;
  onSubmit: (project: Omit<ProjectComponent, 'tasks'>) => void;
  onCancel: () => void;
  idValidation?: IdValidationOptions;
}

export const Form = ({ 
  project, 
  onSubmit, 
  onCancel,
  idValidation = DEFAULT_VALIDATION 
}: ProjectFormProps) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [idError, setIdError] = useState<string | null>(null);

  const idRegex = buildIdRegex(idValidation);

  useEffect(() => {
    if (project) {
      setId(project.id);
      setName(project.name);
      setDescription(project.description);
    } else {
      setId('');
      setName('');
      setDescription('');
    }
  }, [project]);

  const generateId = () => {
    return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + 
           Date.now().toString(36) + '-' + 
           Math.random().toString(36).substring(2, 9);
  };

  const validateId = (value: string) => {
    if (!value) {
      return 'Identifier is required';
    }
    if (!idRegex.test(value)) {
      let allowedChars = [];
      if (idValidation.allowLetters) allowedChars.push('letters');
      if (idValidation.allowNumbers) allowedChars.push('numbers');
      if (idValidation.allowDashes) allowedChars.push('dashes');
      if (idValidation.allowSpaces) allowedChars.push('spaces');
      if (idValidation.allowDots) allowedChars.push('dots');
      if (idValidation.allowUnderscores) allowedChars.push('underscores');

      return `Identifier must contain only ${allowedChars.join(', ')}, ` +
             `between ${idValidation.minLength} and ${idValidation.maxLength} characters`;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionId = id.trim() || generateId();
    const error = validateId(submissionId);
    
    if (error) {
      setIdError(error);
      return;
    }

    onSubmit({
      id: submissionId,
      name: name.trim(),
      description: description.trim(),
    });

    setId('');
    setName('');
    setDescription('');
    setIdError(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="id">Identifier</label>
        {project ? (
          <input
            type="text"
            id="id"
            value={id}
            disabled
            aria-label="Project Identifier (cannot be changed)"
          />
        ) : (
          <div className={styles.idField}>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIdError(validateId(e.target.value));
              }}
              maxLength={60}
              aria-invalid={Boolean(idError)}
              aria-describedby={idError ? "id-error" : "id-help"}
              placeholder="Leave empty for auto-generated ID"
            />
            {idError ? (
              <span id="id-error" className={styles.error}>
                {idError}
              </span>
            ) : (
              <span id="id-help" className={styles.help}>
                {id.trim() 
                  ? "Custom identifier will be used" 
                  : "ID will be automatically generated"}
              </span>
            )}
          </div>
        )}
      </div>

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