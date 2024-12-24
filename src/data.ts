import { ProjectComponent } from '@types';

const generateId = () => {
  return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + 
         Date.now().toString(36) + '-' + 
         Math.random().toString(36).substring(2, 9);
};

export const mockProjects: ProjectComponent[] = [
  {
    id: generateId(),
    name: 'Project (1)',
    description: 'Description',
    tasks: [
      { id: generateId(), description: 'Task 1', status: 'todo' },
      { id: generateId(), description: 'Task 2', status: 'doing' },
    ]
  },
  {
    id: generateId(),
    name: 'Mobile App Development (2)',
    description: 'New iOS and Android app for task management with offline functionality',
    tasks: [
      { id: generateId(), description: 'API integration', status: 'doing' },
      { id: generateId(), description: 'Offline sync', status: 'todo' },
      { id: generateId(), description: 'Push notifications', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Content Strategy (3)',
    description: 'Develop comprehensive content strategy for Q1 2024',
    tasks: [
      { id: generateId(), description: 'Competitor analysis', status: 'done' },
      { id: generateId(), description: 'Content calendar', status: 'doing' },
      { id: generateId(), description: 'SEO optimization', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'User Research (4)',
    description: 'Conduct user interviews and analyze feedback for product improvement',
    tasks: [
      { id: generateId(), description: 'Interview planning', status: 'done' },
      { id: generateId(), description: 'User interviews', status: 'doing' },
      { id: generateId(), description: 'Data analysis', status: 'todo' },
      { id: generateId(), description: 'Report creation', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Performance Optimization (5)',
    description: 'Improve application performance and loading times',
    tasks: [
      { id: generateId(), description: 'Performance audit', status: 'done' },
      { id: generateId(), description: 'Image optimization', status: 'doing' },
      { id: generateId(), description: 'Code splitting', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Accessibility Improvements (6)',
    description: 'Ensure WCAG 2.1 AA compliance across all pages',
    tasks: [
      { id: generateId(), description: 'Accessibility audit', status: 'done' },
      { id: generateId(), description: 'Keyboard navigation', status: 'doing' },
      { id: generateId(), description: 'Screen reader testing', status: 'todo' },
      { id: generateId(), description: 'Color contrast fixes', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Documentation Update (7)',
    description: 'Update all technical documentation and user guides',
    tasks: [
      { id: generateId(), description: 'API documentation', status: 'doing' },
      { id: generateId(), description: 'User guides', status: 'todo' },
      { id: generateId(), description: 'Tutorial videos', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Security Audit (8)',
    description: 'Comprehensive security review and penetration testing',
    tasks: [
      { id: generateId(), description: 'Vulnerability scan', status: 'done' },
      { id: generateId(), description: 'Penetration testing', status: 'doing' },
      { id: generateId(), description: 'Security patches', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Team Training (9)',
    description: 'Organize training sessions for new development tools and methodologies',
    tasks: [
      { id: generateId(), description: 'Training materials', status: 'done' },
      { id: generateId(), description: 'Workshop planning', status: 'doing' },
      { id: generateId(), description: 'Feedback collection', status: 'todo' }
    ]
  },
  {
    id: generateId(),
    name: 'Analytics Integration (10)',
    description: 'Implement advanced analytics and create custom dashboards',
    tasks: [
      { id: generateId(), description: 'Analytics setup', status: 'done' },
      { id: generateId(), description: 'Custom events', status: 'doing' },
      { id: generateId(), description: 'Dashboard creation', status: 'todo' },
      { id: generateId(), description: 'Team training', status: 'todo' }
    ]
  }
];