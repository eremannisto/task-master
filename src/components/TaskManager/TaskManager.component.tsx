import type { ProjectComponent, TaskComponent, TaskStatus }  from '@types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Components
import { Masonry }              from '@/components/Masonry/Masonry.component';
import { Modal }                from '@/components/Modal/Modal.component';
import { Button }               from '@components/Button/Button.component';
import { Filter }               from '@components/Filter/Filter.component';
import { FilterSkeleton }       from '@components/Filter/Filter.skeleton';
import { Project, ProjectForm } from '@components/Project/Project.component';
import { ProjectSkeleton }      from '@components/Project/Project.skeleton';

// Icons
import { PlusCircle } from 'lucide-react';

// Styles
import styles from './TaskManager.module.css';

interface TaskManagerProps {
  initialModalOpen?: boolean;
  onModalClose?: () => void;
}

// Main TaskManager component
export default function TaskManager({ initialModalOpen = false, onModalClose }: TaskManagerProps) {

  // State management
  const [projects,       setProjects]       = useState<ProjectComponent[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [filter,         setFilter]         = useState<'all' | TaskStatus>('all');  
  const [editingProject, setEditingProject] = useState<ProjectComponent | null>(null);
  const [isModalOpen,    setIsModalOpen]    = useState(initialModalOpen);

  // Refs management
  const projectRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Sync modal state with parent
  useEffect(() => {
    setIsModalOpen(initialModalOpen);
  }, [initialModalOpen]);

  // Load projects from localStorage on initial mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Add a fake loading time
        const emulatedLoadingTime = 1000;
        await new Promise(resolve => setTimeout(resolve, emulatedLoadingTime));
        
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects && storedProjects !== 'undefined') {
          const parsedProjects = JSON.parse(storedProjects);
          if (Array.isArray(parsedProjects)) {
            setProjects(parsedProjects);
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Persist projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, isLoading]);

  // Filter projects based on task status
  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projects;
    return projects.filter(project => 
      project.tasks.some(task => task.status === filter)
    );
  }, [projects, filter]);

  const handleDelete = useCallback((projectId: string) => {
    projectRefs.current.delete(projectId);
    setProjects(prev => {
      const newProjects = prev.filter(p => p.id !== projectId);
      // Immediately update localStorage when projects are deleted
      localStorage.setItem('projects', JSON.stringify(newProjects));
      return newProjects;
    });
  }, []);

  const handleTaskUpdate = useCallback((projectId: string, newTasks: TaskComponent[]) => {
    setProjects(prev => {
      const project = prev.find(p => p.id === projectId);
      if (!project || JSON.stringify(project.tasks) === JSON.stringify(newTasks)) {
        return prev; // No change needed
      }
      return prev.map(p => 
        p.id === projectId 
          ? { ...p, tasks: newTasks }
          : p
      );
    });
  }, []);

  const handleCreateProject = (projectData: Omit<ProjectComponent, 'tasks'>) => {
    const newProject: ProjectComponent = {
      ...projectData,
      tasks: []
    };
    
    setProjects(prev => [...prev, newProject]);
    setIsModalOpen(false);
    onModalClose?.();
  };

  const handleEditProject = (projectData: Omit<ProjectComponent, 'id' | 'tasks'>) => {
    if (!editingProject) return;
    
    setProjects(prev => prev.map(project => 
      project.id === editingProject.id 
        ? { 
            ...project,
            name: projectData.name,
            description: projectData.description
          }
        : project
    ));
    
    setEditingProject(null);
    setIsModalOpen(false);
    onModalClose?.();
  };

  // Handle keyboard navigation within the projects grid
  const handleProjectKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Home':
        if (e.ctrlKey && filteredProjects.length > 0) {
          e.preventDefault();
          projectRefs.current.get(filteredProjects[0].id)?.focus();
        }
        break;
      case 'End':
        if (e.ctrlKey && filteredProjects.length > 0) {
          e.preventDefault();
          projectRefs.current.get(filteredProjects[filteredProjects.length - 1].id)?.focus();
        }
        break;
    }
  }, [filteredProjects]);

  // Render individual project
  const renderProject = useCallback((project: ProjectComponent) => (
    <Project
      ref={el => el && projectRefs.current.set(project.id, el)}
      key={project.id}
      id={project.id}
      project={project}
      onDelete={handleDelete}
      onEdit={(project) => {
        setEditingProject(project);
        setIsModalOpen(true);
      }}
      onTaskUpdate={(newTasks) => handleTaskUpdate(project.id, newTasks)}
      filter={filter}
      onKeyDown={handleProjectKeyDown}
    />
  ), [handleDelete, handleTaskUpdate, filter, handleProjectKeyDown]);

  // Update the validation options where it's used
  const idValidation = {
    allowLetters: true,
    allowNumbers: true,
    allowCharacters: ['-', '_'],
    minimumLength: 3,
    maximumLength: 60
  };

  return (
    <>
      <section className={styles.section}>
        <h1 className={styles.title}>
          Organize Your Projects,
          <br/>
          <span>Unlock Your Full Potential</span>
        </h1>

        {/* Loading Skeleton */}
        {isLoading ? (
          <>
            <FilterSkeleton />
            <Masonry
              items={[...Array(12)].map((_, i) => ({
                id: `skeleton-${i}`,
                name: '',
                description: '',
                tasks: []
              }))}
              gap={0.8}
              render={(item) => <ProjectSkeleton key={item.id} />}
            />
          </>
        ) : (
          <>
            {/* Only show filter if there are projects */}
            {projects.length > 0 && (
              <Filter value={filter} onChange={setFilter} />
            )}

            {projects.length === 0 ? (
              <div 
                className={styles["no-projects"]}
                role="button"
                tabIndex={0}
                onClick={() => setIsModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }
                }}
                style={{ cursor: 'pointer' }}
                aria-label="Create new project"
              >
                <p>Create your first project to get started!</p>
                <Button
                  icon={PlusCircle}
                  theme="zinc"
                  size="large"
                  title="New Project"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            ) : filteredProjects.length > 0 ? (
              <Masonry
                items={filteredProjects}
                gap={0.8}
                render={renderProject}
              />
            ) : (
              <div 
                className={styles["no-tasks"]}
                role="status"
                aria-live="polite"
              >
                <p>No tasks found with current filter: <strong>{filter.charAt(0).toUpperCase() + filter.slice(1)}</strong></p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Project Creation/Edit Modal */}
      <Modal 
        title={editingProject ? 'Edit Project' : 'New Project'}
        description={editingProject 
          ? 'Update your project details below.' 
          : 'Create a new project by filling out the form below. You can leave the ID empty to auto-generate one.'
        }
        variant="form"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
          onModalClose?.();
        }}
      >
        <ProjectForm
          key={editingProject?.id || Date.now()}
          project={editingProject ?? undefined}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProject(null);
            onModalClose?.();
          }}
          idValidation={idValidation}
          existingIds={projects.map(p => p.id)}
        />
      </Modal>
    </>
  );
}