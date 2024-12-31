import { useCallback, useRef }        from 'react'
import { CirclePlus, DatabaseBackup } from 'lucide-react'
import { mockProjects }               from '@/mock-data'
import { Button }                     from '@components/Button/Button.component'
import styles                         from './Navigation.module.css'
import logo                           from '@assets/logo-alt.png'
import type { NavigationProps }       from './Navigation.types'
/**
 * Action button descriptions for screen readers
 * - mockData: Loads sample project data
 * - newProject: Creates a new empty project
 */
const actionDescriptions = {
  mockData  : 'Load sample projects for demonstration',
  newProject: 'Create a new project'
} as const;

/**
 * Main navigation component
 * - Displays the application logo
 * - Provides actions for creating projects and loading sample data
 * - Handles keyboard navigation between action buttons
 */
export default function Navigation({ onNewProject }: NavigationProps) {
  /**
   * Refs for action buttons to manage focus
   * - Used for keyboard navigation between buttons
   * - Allows focus management without re-renders
   */
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Loads sample project data after user confirmation
   * - Shows confirmation dialog
   * - Replaces existing projects in localStorage
   * - Reloads the page to show new data
   */
  const loadMockData = () => {
    if (window.confirm('This will replace any existing projects with sample data. Continue?')) {
      localStorage.setItem('projects', JSON.stringify(mockProjects));
      window.location.reload();
    }
  };

  /**
   * Handles keyboard navigation within the action buttons
   * - Left/Up: Move to previous button
   * - Right/Down: Move to next button
   * - Home: Move to first button
   * - End: Move to last button
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const buttons = buttonsRef.current.filter(Boolean);
    let nextIndex: number;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = index === 0 ? buttons.length - 1 : index - 1;
        buttons[nextIndex]?.focus();
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = index === buttons.length - 1 ? 0 : index + 1;
        buttons[nextIndex]?.focus();
        break;

      case 'Home':
        e.preventDefault();
        buttons[0]?.focus();
        break;

      case 'End':
        e.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;
    }
  }, []);

  return (
    <header className={styles.header}>
      <nav 
        className  = {styles.navigation}
        aria-label = "Main navigation"
      >
        <div className={styles.content}>
          <a 
            href       = "/" 
            className  = {styles.logo}
            aria-label = "Return to TaskMaster home page"
          >
            <img 
              src         = {logo} 
              alt         = "TaskMaster logo" 
              aria-hidden = "true"
              width       = "32"
              height      = "32"
            />
            <span aria-hidden="true">
              Task<strong>Master</strong>
            </span>
          </a>

          <div 
            className  = {styles.actions}
            role       = "toolbar"
            aria-label = "Project management actions"
          >
            <Button
              ref         = {el => buttonsRef.current[1] = el}
              icon        = {DatabaseBackup}
              theme       = "zinc"
              size        = "medium"
              title       = "Load Sample Data"
              description = {actionDescriptions.mockData}
              hideTitle   = {true}
              onClick     = {loadMockData}
              onKeyDown   = {e => handleKeyDown(e, 1)}
              aria-label  = "Load sample projects. This will replace any existing projects."
            />

            <Button
              ref         = {el => buttonsRef.current[2] = el}
              icon        = {CirclePlus}
              theme       = "emerald"
              size        = "medium"
              title       = "New Project"
              description = {actionDescriptions.newProject}
              hideTitle   = {true}
              onClick     = {onNewProject}
              onKeyDown   = {e => handleKeyDown(e, 2)}
              aria-label  = "Create a new project"
            />
          </div>
        </div>
      </nav>
    </header>
  )
}
