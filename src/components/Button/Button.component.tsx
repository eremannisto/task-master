import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import styles         from './Button.module.css';

export type ButtonSize    = 'small' | 'medium' | 'large';
export type ButtonVariant = 'solid' | 'ghost'  | 'outline';

export type ButtonTheme = 'red'    | 'orange'  | 'amber'   | 'yellow' |
                          'lime'   | 'green'   | 'emerald' | 'teal'   | 
                          'cyan'   | 'sky'     | 'blue'    | 'indigo' | 
                          'violet' | 'purple'  | 'fuchsia' | 'pink'   | 
                          'rose'   | 'stone'   | 'neutral' | 'zinc'   | 
                          'gray'   | 'slate';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title        : string;
  description? : string;
  icon?        : LucideIcon;
  className?   : string;
  size?        : ButtonSize;
  variant?     : ButtonVariant;
  theme?       : ButtonTheme;
  isLoading?   : boolean;
  isDisabled?  : boolean;
  hideTitle?   : boolean;
  hideIcon?    : boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  title,                    // Title of the button
  description,              // Description of the button
  icon: Icon,               // Icon to display
  className   = '',         // Additional class name
  size        = 'medium',   // Size of the button
  variant     = 'solid',    // Variant of the button
  theme       = 'zinc',     // Theme of the button
  isLoading   = false,      // Whether the button is loading
  isDisabled  = false,      // Whether the button is disabled
  type        = 'button',   // Type of the button
  hideTitle   = false,      // Whether to hide the title (for mobile)
  hideIcon    = false,      // Whether to hide the icon (for mobile)
  ...props
}, ref) => {
  const buttonClasses = [
    styles.button,
    className,
    isLoading && styles.loading,
  ].filter(Boolean).join(' ');

  return (
    <button
      data-size        = {size}
      data-type        = {variant}
      data-theme       = {theme}
      data-hide-title  = {hideTitle}
      data-hide-icon   = {hideIcon}
      ref              = {ref}
      type             = {type}
      className        = {buttonClasses}
      disabled         = {isDisabled || isLoading}
      aria-disabled    = {isDisabled || isLoading}
      aria-busy        = {isLoading}
      title            = {title}
      aria-description = {description}
      {...props}
    >
      {/* If loading, show spinner */}
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}

      {/* Show content if not loading */}
      {!isLoading && (
        <>
          {Icon && <Icon className={styles.icon} aria-hidden="true" />}
          <span className={styles.title}>{title}</span>
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
