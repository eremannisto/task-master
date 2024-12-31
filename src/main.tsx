import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/reset.css'
import '@/styles/typography.css'
import '@/styles/colors.css'
import '@/styles/global.css'

import Navigation  from '@/components/Navigation/Navigation.component'
import TaskManager from '@/components/TaskManager/TaskManager.component'
import Background  from '@/components/Background/Background.component'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <StrictMode>
      <Navigation onNewProject={() => setIsModalOpen(true)} />
      <main>
        <TaskManager initialModalOpen={isModalOpen} onModalClose={() => setIsModalOpen(false)} />
      </main>
      <Background />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
