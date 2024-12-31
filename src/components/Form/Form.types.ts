/**
 * Form field configuration
 * - label      : The label for the field
 * - type       : The type of input field
 * - placeholder: The placeholder text for the field
 * - helpText   : The help text for the field
 * - disabled   : Whether the field is disabled
 * - readOnly   : Whether the field is read-only
 * - autoFocus  : Whether the field should be focused on mount
 * - rows       : The number of rows for the textarea field
 * - validation : The validation rules for the field
 */
export interface FormField {
  label        : string;
  type         : 'text' | 'textarea';
  placeholder? : string;
  helpText?    : string;
  disabled?    : boolean;
  readOnly?    : boolean;
  autoFocus?   : boolean;
  rows?        : number;
  validation?  : {
    required?          : boolean;
    minLength?         : number;
    maxLength?         : number;
    allowedCharacters? : string[];
    pattern?           : RegExp;
    validate?          : (value: string) => string | true;
  };
}

/**
 * Form configuration
 * - A map of field names to field configurations
 */
export type FormConfig = {
  [key: string]: FormField;
}

/**
 * Form component props
 * - config       : The form configuration
 * - initialValues: The initial values for the form fields
 * - onSubmit     : The callback function for form submission
 * - onCancel     : The callback function for form cancellation
 * - submitLabel  : The label for the submit button
 * - cancelLabel  : The label for the cancel button
 */
export interface FormProps<T extends FormConfig> {
  config         : T;
  initialValues? : Partial<{ [K in keyof T]: string }>;
  onSubmit       : (values: { [K in keyof T]: string }) => void;
  onCancel?      : () => void;
  submitLabel?   : string;
  cancelLabel?   : string;
} 