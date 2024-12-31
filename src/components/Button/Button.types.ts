import type { LucideIcon } from 'lucide-react';

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
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
