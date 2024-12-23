import type { ProjectComponent, TaskComponent, TaskStatus } from '@types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Masonry }  from 'masonic';
import { Project }  from '@components/Project/Project';
import { Skeleton } from '@components/Skeleton/Skeleton';
import Filter       from '@components/Filter/Filter';
import { Modal }    from '@components/Modal/Modal';
import { Form as ProjectForm } from '@components/Project/Form/Form';
import Navigation from '@components/Navigation/Navigation';
import './TaskManager.css';

// Generate stable keys for Masonry grid items to prevent unnecessary re-renders
const getStableKey = (project: ProjectComponent) => `project-${project.id}`;

// Interface for storing position information
interface ItemPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function TaskManager() {
  const [projects,       setProjects]       = useState<ProjectComponent[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [filter,         setFilter]         = useState<'all' | TaskStatus>('all');  
  const [editingProject, setEditingProject] = useState<ProjectComponent | null>(null);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const projectRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemPositions = useRef<Map<string, ItemPosition>>(new Map());
  const containerRef = useRef<HTMLElement>(null);

  // Load projects from localStorage on initial mount
  useEffect(() => {
    try {
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

  // Project operations
  const handleDelete = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

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

  const handleCreateProject = (projectData: Omit<ProjectComponent, 'id' | 'tasks'>) => {
    const newProject: ProjectComponent = {
      id: crypto.randomUUID(),
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
        ? { ...project, ...projectData }
        : project
    ));
    
    setEditingProject(null);
    setIsModalOpen(false);
  };

  // Set initial focus on first project when filter changes
  useEffect(() => {
    if (!isLoading && filteredProjects.length > 0) {
      const firstProject = filteredProjects[0];
      setTimeout(() => {
        projectRefs.current.get(firstProject.id)?.focus();
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [filter, isLoading, filteredProjects]);

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
  const renderProject = useCallback(({ data: project, index }: { data: ProjectComponent, index: number }) => (
    <div 
      ref={el => el && projectRefs.current.set(project.id, el)}
      key={getStableKey(project)}
      id={getStableKey(project)}
      role="gridcell"
      className="project-container"
      tabIndex={0}
      aria-rowindex={Math.floor(index / 4) + 1}
      aria-colindex={(index % 4) + 1}
      onKeyDown={(e) => handleProjectKeyDown(e, project.id)}
    >
      <Project
        project={project}
        onDelete={handleDelete}
        onEdit={(project) => {
          setEditingProject(project);
          setIsModalOpen(true);
        }}
        onTaskUpdate={(newTasks) => handleTaskUpdate(project.id, newTasks)}
        filter={filter}
      />
    </div>
  ), [handleDelete, handleTaskUpdate, filter, handleProjectKeyDown]);

  // Clean up refs when projects change
  useEffect(() => {
    const currentRefs = new Map(projectRefs.current);
    projectRefs.current = new Map();
    itemPositions.current.clear();
    
    return () => {
      currentRefs.clear();
    };
  }, [filteredProjects]);

  return (
    <>
      <Navigation onNewProject={() => setIsModalOpen(true)} />

      <h1>
        Organize Your Projects,
        <br/>
        <span>Unlock Your Full Potential</span>
      </h1>

      <Filter value={filter} onChange={setFilter} />

      {/* Projects Grid with Loading and Empty States */}
      <section 
        ref={containerRef}
        className="projects-container" 
        id="filtered-projects"
        role="grid"
        aria-label="Projects grid"
        aria-rowcount={Math.ceil(filteredProjects.length / 4)}
        aria-colcount={Math.min(4, filteredProjects.length)}
        aria-live="polite"
      >
        {isLoading ? (
          <div className="projects-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="project-skeleton">
                <Skeleton height={32} className="skeleton-header" />
                <Skeleton height={24} width="60%" />
                <Skeleton height={24} width="80%" />
                <Skeleton height={24} width="70%" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <Masonry
            items={filteredProjects}
            columnGutter={8}
            columnWidth={300}
            render={renderProject}
            overscanBy={2}
            role="grid"
            maxColumnCount={4}
            itemHeightEstimate={200}
            key={`masonry-${filter}`}
            rowGutter={8}
            itemKey={getStableKey}
            onRender={handleMasonryRender}
          />
        ) : (
          <p className="no-results">
            No projects found with {filter} tasks
          </p>
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
        />
      </Modal>
    </>
  );
}