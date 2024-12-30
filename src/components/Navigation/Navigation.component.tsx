import { useCallback, useRef }        from 'react'
import { CirclePlus, DatabaseBackup } from 'lucide-react'
import { mockProjects }               from '@data'
import { Button }                     from '@components/Button/Button.component.tsx'

import styles from './Navigation.module.css'
import logo   from '@assets/logo-alt.png'

interface NavigationProps {
  onNewProject: () => void;
}

// Action button descriptions for screen readers
const actionDescriptions = {
  mockData  : 'Load sample projects for demonstration',
  newProject: 'Create a new project'
} as const;

export default function Navigation({ onNewProject }: NavigationProps) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const loadMockData = () => {
    if (window.confirm('This will replace any existing projects with sample data. Continue?')) {
      localStorage.setItem('projects', JSON.stringify(mockProjects));
      window.location.reload();
    }
  };

  // Handle keyboard navigation within the action buttons group
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
    <header className={styles.header} role="banner">
      <nav 
        className={styles.navigation}
        aria-label="Main navigation"
      >
        <div className={styles.content}>
          <a 
            href="/" 
            className={styles.logo}
            aria-label="TaskMaster Home"
          >
            <img 
              src         = {logo} 
              alt         = "TaskMaster Logo" 
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
            role       = "group"
            aria-label = "Navigation options"
          >
            <Button
              ref={el => buttonsRef.current[1] = el}
              icon={DatabaseBackup}
              theme="zinc"
              size="medium"
              title="Mockup Data"
              description={actionDescriptions.mockData}
              hideTitle={true}
              onClick={loadMockData}
              onKeyDown={e => handleKeyDown(e, 1)}
            />

            <Button
              ref={el => buttonsRef.current[2] = el}
              icon={CirclePlus}
              theme="emerald"
              size="medium"
              title="New Project"
              description={actionDescriptions.newProject}
              hideTitle={true}
              onClick={onNewProject}
              onKeyDown={e => handleKeyDown(e, 2)}
            />
          </div>
        </div>
      </nav>
    </header>
  )
}
