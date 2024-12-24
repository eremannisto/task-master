import { ProjectComponent } from '@types';

export const mockProjects: ProjectComponent[] = [
  {
    id: crypto.randomUUID(),
    name: 'Project (1)',
    description: 'Description',
    tasks: [
      { id: crypto.randomUUID(), description: 'Task 1', status: 'todo' },
      { id: crypto.randomUUID(), description: 'Task 2', status: 'doing' },
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Mobile App Development (2)',
    description: 'New iOS and Android app for task management with offline functionality',
    tasks: [
      { id: crypto.randomUUID(), description: 'API integration', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Offline sync', status: 'todo' },
      { id: crypto.randomUUID(), description: 'Push notifications', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Content Strategy (3)',
    description: 'Develop comprehensive content strategy for Q1 2024',
    tasks: [
      { id: crypto.randomUUID(), description: 'Competitor analysis', status: 'done' },
      { id: crypto.randomUUID(), description: 'Content calendar', status: 'doing' },
      { id: crypto.randomUUID(), description: 'SEO optimization', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'User Research (4)',
    description: 'Conduct user interviews and analyze feedback for product improvement',
    tasks: [
      { id: crypto.randomUUID(), description: 'Interview planning', status: 'done' },
      { id: crypto.randomUUID(), description: 'User interviews', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Data analysis', status: 'todo' },
      { id: crypto.randomUUID(), description: 'Report creation', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Performance Optimization (5)',
    description: 'Improve application performance and loading times',
    tasks: [
      { id: crypto.randomUUID(), description: 'Performance audit', status: 'done' },
      { id: crypto.randomUUID(), description: 'Image optimization', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Code splitting', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Accessibility Improvements (6)',
    description: 'Ensure WCAG 2.1 AA compliance across all pages',
    tasks: [
      { id: crypto.randomUUID(), description: 'Accessibility audit', status: 'done' },
      { id: crypto.randomUUID(), description: 'Keyboard navigation', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Screen reader testing', status: 'todo' },
      { id: crypto.randomUUID(), description: 'Color contrast fixes', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Documentation Update (7)',
    description: 'Update all technical documentation and user guides',
    tasks: [
      { id: crypto.randomUUID(), description: 'API documentation', status: 'doing' },
      { id: crypto.randomUUID(), description: 'User guides', status: 'todo' },
      { id: crypto.randomUUID(), description: 'Tutorial videos', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Security Audit (8)',
    description: 'Comprehensive security review and penetration testing',
    tasks: [
      { id: crypto.randomUUID(), description: 'Vulnerability scan', status: 'done' },
      { id: crypto.randomUUID(), description: 'Penetration testing', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Security patches', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Team Training (9)',
    description: 'Organize training sessions for new development tools and methodologies',
    tasks: [
      { id: crypto.randomUUID(), description: 'Training materials', status: 'done' },
      { id: crypto.randomUUID(), description: 'Workshop planning', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Feedback collection', status: 'todo' }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Analytics Integration (10)',
    description: 'Implement advanced analytics and create custom dashboards',
    tasks: [
      { id: crypto.randomUUID(), description: 'Analytics setup', status: 'done' },
      { id: crypto.randomUUID(), description: 'Custom events', status: 'doing' },
      { id: crypto.randomUUID(), description: 'Dashboard creation', status: 'todo' },
      { id: crypto.randomUUID(), description: 'Team training', status: 'todo' }
    ]
  }
];