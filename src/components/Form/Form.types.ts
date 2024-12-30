export interface FormField {
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  rows?: number;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowedCharacters?: string[];
    pattern?: RegExp;
    validate?: (value: string) => string | true;
  };
}

export type FormConfig = {
  [key: string]: FormField;
}

export interface FormProps<T extends FormConfig> {
  config: T;
  initialValues?: Partial<{ [K in keyof T]: string }>;
  onSubmit: (values: { [K in keyof T]: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
} 