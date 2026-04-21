/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useSocket } from './SocketContext';

const IssueContext = createContext();

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeProjectId = useRef(null);
  const socketRef = useSocket();

  // ── Real-time: listen for issue events from server ───────────────────────
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onCreated = (issue) => setIssues(prev =>
      prev.some(i => i._id === issue._id) ? prev : [...prev, issue]
    );
    const onUpdated = (issue) => setIssues(prev =>
      prev.map(i => i._id === issue._id ? issue : i)
    );
    const onAssigned = (issue) => setIssues(prev =>
      prev.map(i => i._id === issue._id ? issue : i)
    );

    socket.on('issue_created', onCreated);
    socket.on('issue_updated', onUpdated);
    socket.on('issue_assigned', onAssigned);

    return () => {
      socket.off('issue_created', onCreated);
      socket.off('issue_updated', onUpdated);
      socket.off('issue_assigned', onAssigned);
    };
  }, [socketRef]);

  // ── Get issues by project ─────────────────────────────────────────────────
  const getIssuesByProject = useCallback(async (projectId) => {
    activeProjectId.current = projectId;
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/issues/project/${projectId}`);
      setIssues(response.data);

      // Join the socket room for this project
      socketRef?.current?.emit('join_project', projectId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues. Check your connection.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [socketRef]);

  // Retry — re-fetch using the last active project
  const retryFetch = useCallback(() => {
    if (activeProjectId.current) getIssuesByProject(activeProjectId.current);
  }, [getIssuesByProject]);

  // ── Create ────────────────────────────────────────────────────────────────
  const createIssue = async (projectId, title, description, priority = 'medium', assignedTo = null, deadline = null) => {
    setLoading(true);
    try {
      const response = await API.post('/issues', { projectId, title, description, priority, assignedTo, deadline });
      setIssues(prev => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create issue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const updateIssue = async (id, updates) => {
    try {
      const response = await API.put(`/issues/${id}`, updates);
      setIssues(prev => prev.map(issue => issue._id === id ? response.data : issue));
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update issue';
      setError(message);
      throw err;
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteIssue = async (id) => {
    try {
      await API.delete(`/issues/${id}`);
      setIssues(prev => prev.filter(issue => issue._id !== id));
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete issue';
      setError(message);
      throw err;
    }
  };

  // ── Assign ────────────────────────────────────────────────────────────────
  const assignIssue = async (id, userId) => {
    try {
      const response = await API.put(`/issues/${id}/assign`, { userId });
      setIssues(prev => prev.map(issue => issue._id === id ? response.data : issue));
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to assign issue';
      setError(message);
      throw err;
    }
  };

  // ── Suggestions ───────────────────────────────────────────────────────────
  const getSuggestions = async (projectId) => {
    try {
      const response = await API.get(`/issues/project/${projectId}/suggestions`);
      return response.data;
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      return [];
    }
  };

  return (
    <IssueContext.Provider value={{
      issues, loading, error,
      getIssuesByProject, retryFetch,
      createIssue, updateIssue, deleteIssue,
      assignIssue, getSuggestions
    }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssue = () => {
  const context = useContext(IssueContext);
  if (!context) throw new Error('useIssue must be used within IssueProvider');
  return context;
};
