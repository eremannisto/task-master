import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import styles         from './Button.module.css';

/**
 * Button size options
 * - small: Compact size for tight spaces
 * - medium: Standard size for most uses
 * - large: Prominent size for important actions
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button variant options
 * - solid: Filled background
 * - ghost: No background until hover
 * - outline: Border with transparent background
 */
export type ButtonVariant = 'solid' | 'ghost' | 'outline';

/**
 * Button theme options
 * - Color themes from Tailwind palette
 * - Each theme has its own hover and active states
 * - Includes both colorful and neutral options
 */
export type ButtonTheme = 'red'    | 'orange'  | 'amber'   | 'yellow' |
                         'lime'   | 'green'   | 'emerald' | 'teal'   | 
                         'cyan'   | 'sky'     | 'blue'    | 'indigo' | 
                         'violet' | 'purple'  | 'fuchsia' | 'pink'   | 
                         'rose'   | 'stone'   | 'neutral' | 'zinc'   | 
                         'gray'   | 'slate';

/**
 * Button component props
 * - Extends standard button attributes
 * - Supports icons, loading states, and themes
 * - Includes accessibility attributes
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title        : string;     // Button text
  description? : string;     // Additional description for screen readers
  icon?        : LucideIcon; // Optional Lucide icon
  className?   : string;     // Additional CSS classes
  size?        : ButtonSize; // Button size variant
  variant?     : ButtonVariant; // Button style variant
  theme?       : ButtonTheme;   // Color theme
  isLoading?   : boolean;    // Loading state
  isDisabled?  : boolean;    // Disabled state
  hideTitle?   : boolean;    // Hide text on mobile
  hideIcon?    : boolean;    // Hide icon on mobile
}

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
