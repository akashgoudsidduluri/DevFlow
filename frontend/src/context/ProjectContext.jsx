/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback } from 'react';
import API from '../utils/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/projects');
      setProjects(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await API.get(`/projects/${id}`);
      // Backend now returns { project, isMember, isOwner, isPublic }
      const { project, isMember, isOwner, isPublic } = response.data;
      const dataToStore = {
        ...project,
        isMember,
        isOwner,
        isPublic
      };
      setCurrentProject(dataToStore);
      setError(null);
      return dataToStore;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    try {
      const response = await API.post('/projects', projectData);
      setProjects(prev => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, name, description) => {
    setLoading(true);
    try {
      const response = await API.put(`/projects/${id}`, { name, description });
      setProjects(prev => prev.map(p => p._id === id ? response.data : p));
      if (currentProject && currentProject._id === id) setCurrentProject(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (id) => {
    setLoading(true);
    try {
      await API.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (currentProject && currentProject._id === id) setCurrentProject(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const addMember = useCallback(async (projectId, email) => {
    setLoading(true);
    try {
      const response = await API.post(`/projects/${projectId}/members`, { email });
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyInvitation = useCallback(async (token) => {
    setLoading(true);
    try {
      const response = await API.post('/projects/invitations/verify', { token });
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectInvitations = useCallback(async (projectId) => {
    try {
      const response = await API.get(`/projects/${projectId}/invitations`);
      return response.data;
    } catch {
      return [];
    }
  }, []);

  // Remove member from project
  const removeMember = useCallback(async (projectId, memberId) => {
    setLoading(true);
    try {
      await API.delete(`/projects/${projectId}/members/${memberId}`);
      // Refresh current project to reflect removal
      if (currentProject && currentProject._id === projectId) {
        getProjectById(projectId);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject, getProjectById]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      loading,
      error,
      getProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      addMember,
      verifyInvitation,
      getProjectInvitations,
      removeMember
    }}>
      {children}
    </ProjectContext.Provider>
  );
};


export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
