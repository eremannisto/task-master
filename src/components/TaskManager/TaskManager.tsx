import type { ProjectComponent, TaskComponent, TaskStatus } from '@types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Masonry }  from 'masonic';
import { Form as ProjectForm } from '@components/Project/Form/Form';
import { Project }  from '@components/Project/Project';
import { Modal }    from '@components/Modal/Modal';
import Filter       from '@components/Filter/Filter';
import Navigation from '@components/Navigation/Navigation';
import { ProjectSkeleton } from '@components/Project/Project.skeleton';
import { Plus } from 'lucide-react';
import './TaskManager.css';

// Generate stable keys for Masonry grid items to prevent unnecessary re-renders
const getStableKey = (project: ProjectComponent | { id: string }) => `project-${project.id}`;

// Interface for storing position information
interface ItemPosition {
  id    : string;
  x     : number;
  y     : number;
  width : number;
  height: number;
}

// Generate skeleton items for Masonry grid
const generateSkeletonItems = (count: number) => Array.from({ length: count }, (_, i) => ({
  id: `skeleton-${i}`
}));

// Main TaskManager component
export default function TaskManager() {
  const [projects,       setProjects]       = useState<ProjectComponent[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [filter,         setFilter]         = useState<'all' | TaskStatus>('all');  
  const [editingProject, setEditingProject] = useState<ProjectComponent | null>(null);
  const [isModalOpen,    setIsModalOpen]    = useState(false);

  const projectRefs   = useRef<Map<string, HTMLElement>>(new Map());
  const itemPositions = useRef<Map<string, ItemPosition>>(new Map());
  const containerRef  = useRef<HTMLElement>(null);

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

  // Update positions when Masonic renders
  const handleMasonryRender = useCallback(() => {
    requestAnimationFrame(() => {
      itemPositions.current.clear();
      
      filteredProjects.forEach(project => {
        const element = projectRefs.current.get(project.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          const offsetX = containerRect ? rect.left - containerRect.left : rect.left;
          const offsetY = containerRect ? rect.top - containerRect.top : rect.top;
          
          itemPositions.current.set(project.id, {
            id: project.id,
            x: offsetX,
            y: offsetY,
            width: rect.width,
            height: rect.height
          });
        }
      });
    });
  }, [filteredProjects]);

  // Project operations
  const handleDelete = useCallback((projectId: string) => {
    // Clean up refs
    projectRefs.current.delete(projectId);
    itemPositions.current.delete(projectId);
    
    setProjects(prev => {
      const newProjects = prev.filter(p => p.id !== projectId);
      // Schedule a position update after the state change is complete
      requestAnimationFrame(() => {
        handleMasonryRender();
      });
      return newProjects;
    });
  }, [handleMasonryRender]);

  const handleTaskUpdate = useCallback((projectId: string, newTasks: TaskComponent[]) => {
    // Only update if tasks actually changed
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
  };

  // Find closest item in given direction
  const findClosestItem = useCallback((currentId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
    const current = itemPositions.current.get(currentId);
    if (!current) return null;

    let closest: string | null = null;
    let minDistance = Infinity;

    const COLUMN_THRESHOLD = 50; // Pixels threshold for considering items in same column
    const ROW_THRESHOLD = 50;    // Pixels threshold for considering items in same row

    itemPositions.current.forEach((position, id) => {
      if (id === currentId) return;

      const isCorrectDirection = () => {
        switch (direction) {
          case 'up':
            return position.y < current.y;
          case 'down':
            return position.y > current.y;
          case 'left':
            return position.x < current.x;
          case 'right':
            return position.x > current.x;
        }
      };

      if (!isCorrectDirection()) return;

      const horizontalDistance = Math.abs(position.x - current.x);
      const verticalDistance = Math.abs(position.y - current.y);
      
      // For vertical movement, prioritize items in the same column
      const distance = (direction === 'up' || direction === 'down')
        ? (horizontalDistance <= COLUMN_THRESHOLD ? verticalDistance : Infinity)
        : (verticalDistance <= ROW_THRESHOLD ? horizontalDistance : Infinity);

      if (distance < minDistance) {
        minDistance = distance;
        closest = id;
      }
    });

    return closest;
  }, []);

  // Handle keyboard navigation within the projects grid
  const handleProjectKeyDown = useCallback((e: React.KeyboardEvent, projectId: string) => {
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;

    switch (e.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
      case 'Home':
        if (e.ctrlKey && filteredProjects.length > 0) {
          e.preventDefault();
          projectRefs.current.get(filteredProjects[0].id)?.focus();
        }
        return;
      case 'End':
        if (e.ctrlKey && filteredProjects.length > 0) {
          e.preventDefault();
          projectRefs.current.get(filteredProjects[filteredProjects.length - 1].id)?.focus();
        }
        return;
      default:
        return;
    }

    const nextItemId = findClosestItem(projectId, direction);
    if (nextItemId) {
      e.preventDefault();
      projectRefs.current.get(nextItemId)?.focus();
    }
  }, [filteredProjects, findClosestItem]);

  // Monitor container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(() => {
      handleMasonryRender();
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleMasonryRender]);

  // Render individual project for Masonry grid
  const renderProject = useCallback(({ data: project}: { data: ProjectComponent, index: number }) => (
    <Project
      ref={el => el && projectRefs.current.set(project.id, el)}
      key={getStableKey(project)}
      id={getStableKey(project)}
      project={project}
      onDelete={handleDelete}
      onEdit={(project) => {
        setEditingProject(project);
        setIsModalOpen(true);
      }}
      onTaskUpdate={(newTasks) => handleTaskUpdate(project.id, newTasks)}
      filter={filter}
      onKeyDown={(e) => handleProjectKeyDown(e, project.id)}
    />
  ), [handleDelete, handleTaskUpdate, filter, handleProjectKeyDown]);

  return (
    <>
      <Navigation onNewProject={() => setIsModalOpen(true)} />

      <h1>
        Organize Your Projects,
        <br/>
        <span>Unlock Your Full Potential</span>
      </h1>

      <Filter value={filter} onChange={setFilter} />

      <section 
        ref={containerRef}
        className="projects-container" 
        id="filtered-projects"
        role="list"
        aria-label="Projects"
      >
        {isLoading ? (
          <div aria-label="Loading projects" role="status">
            <Masonry
              items={generateSkeletonItems(10)}
              columnGutter={8}
              columnWidth={300}
              render={() => <ProjectSkeleton/>}
              overscanBy={2}
              maxColumnCount={4}
              rowGutter={8}
            />
          </div>
        ) : filteredProjects.length > 0 ? (
          <Masonry
            key={filteredProjects.map(p => p.id).join(',')}
            items={filteredProjects}
            columnGutter={8}
            columnWidth={300}
            render={renderProject}
            overscanBy={2}
            maxColumnCount={4}
            itemHeightEstimate={200}
            rowGutter={8}
            onRender={handleMasonryRender}
          />
        ) : (
          <div 
            className="no-results"
            role="status"
            aria-live="polite"
          >
            <p>
              {filter === 'all' 
                ? "No projects found. Create your first project!"
                : `No projects found with filter: ${filter}`
              }
            </p>
            {filter === 'all' && (
              <button 
                className="create-project-button"
                onClick={() => setIsModalOpen(true)}
                aria-label="Create new project"
                aria-haspopup="dialog"
              >
                <Plus aria-hidden="true" />
                <span>New Project</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Project Creation/Edit Modal */}
      <Modal 
        title={editingProject ? 'Edit Project' : 'New Project'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
      >
        <ProjectForm
          key={editingProject?.id || 'new'}
          project={editingProject ?? undefined}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
          // Original task requires *name* to be unique and only allow 
          // letters and numbers. But current application uses id as identifier
          // and allows letters, numbers and dashes. If no id is provided,
          // it will generate a random one.

          idValidation={{
            allowLetters: true,
            allowNumbers: true,
            allowDashes : true,
            allowSpaces : false,
            allowDots   : false,
            allowUnderscores: false,
            minLength: 3,
            maxLength: 60
          }}
        />
      </Modal>
    </>
  );
}