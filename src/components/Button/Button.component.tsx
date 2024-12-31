import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import styles from './Button.module.css';

/**
 * Button component
 * - Accessible button with multiple variants
 * - Supports loading states and icons
 * - Responsive with mobile considerations
 * - Follows WAI-ARIA button patterns
 */
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
