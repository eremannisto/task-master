import { useState, useCallback } from 'react';
import { Button } from '@components/Button/Button.component';
import type { FormProps, FormConfig, FormField } from '@components/Form/Form.types';
import styles from './Form.module.css';
import { Check } from 'lucide-react';

export function Form<T extends FormConfig>({ 
  config, 
  initialValues = {}, 
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel'
}: FormProps<T>) {
  const [values, setValues] = useState<{ [K in keyof T]: string }>(() => {
    const initial: any = {};
    Object.keys(config).forEach(key => {
      initial[key] = initialValues[key] || '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});

  const validateField = useCallback((name: keyof T, value: string): string | null => {
    const rules = config[name].validation;
    if (!rules) return null;

    if (rules.required && !value.trim()) {
      return `${config[name].label} is required`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${config[name].label} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${config[name].label} cannot exceed ${rules.maxLength} characters`;
    }

    if (value && rules.allowedCharacters?.length) {
      const pattern = new RegExp(`^[${rules.allowedCharacters.join('')}]*$`);
      if (!pattern.test(value)) {
        return `${config[name].label} can only contain ${rules.allowedCharacters.join(', ')}`;
      }
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${config[name].label} has an invalid format`;
    }

    if (rules.validate) {
      const result = rules.validate(value);
      if (result !== true) {
        return result;
      }
    }

    return null;
  }, [config]);

  const handleChange = useCallback((name: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: { [K in keyof T]?: string } = {};
    let hasErrors = false;

    Object.keys(config).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(config).reduce((acc, key) => ({ 
      ...acc, 
      [key]: true 
    }), {} as { [K in keyof T]: boolean }));

    if (!hasErrors) {
      onSubmit(values);
    }
  }, [config, validateField, values, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {Object.entries(config).map(([name, field]: [string, FormField]) => {
        const showError = touched[name] && errors[name];

        return (
          <div key={name} className={styles.field}>
            <label htmlFor={name}>{field.label}</label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={name}
                value={values[name]}
                onChange={e => handleChange(name, e.target.value)}
                onBlur={() => handleBlur(name)}
                disabled={field.disabled}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                autoFocus={field.autoFocus}
                aria-invalid={!!showError}
                aria-describedby={`${name}-error ${name}-help`}
              />
            ) : (
              <input
                type={field.type}
                id={name}
                value={values[name]}
                onChange={e => handleChange(name, e.target.value)}
                onBlur={() => handleBlur(name)}
                disabled={field.disabled}
                placeholder={field.placeholder}
                autoFocus={field.autoFocus}
                aria-invalid={!!showError}
                aria-describedby={`${name}-error ${name}-help`}
              />
            )}

            {showError && (
              <span id={`${name}-error`} className={styles.error} role="alert">
                {errors[name]}
              </span>
            )}

            {field.helpText && (
              <span id={`${name}-help`} className={styles.help}>
                {field.helpText}
              </span>
            )}
          </div>
        );
      })}

      <div className={styles.actions}>
        {onCancel && (
          <Button
            type="button"
            title={cancelLabel}
            variant="solid"
            theme="zinc"
            onClick={onCancel}
          />
        )}
        <Button
          icon={Check}
          type="submit"
          title={submitLabel}
          variant="solid"
          theme="emerald"
        />
      </div>
    </form>
  );
}
