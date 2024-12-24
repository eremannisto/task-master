import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@styles/reset.css'
import '@styles/typography.css'
import '@styles/colors.css'
import '@styles/global.css'

import Navigation  from '@components/Navigation/Navigation.tsx'
import TaskManager from '@components/TaskManager/TaskManager.tsx'
import Background  from '@components/Background/Background.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navigation onNewProject={() => {}} />
    <main>
      <TaskManager />
    </main>
    <Background />
  </StrictMode>,
)
