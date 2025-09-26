import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchData };
};

export const useTimeline = (repositoryId = null, limit = 50) => {
  const [timeline, setTimeline] = useState([]);
  const { loading, error, fetchData } = useApi();

  const loadTimeline = useCallback(async () => {
    try {
      const data = await fetchData(() => apiService.getTimeline(limit, repositoryId));
      setTimeline(data.timeline || []);
    } catch (err) {
      console.error('Erro ao carregar timeline:', err);
    }
  }, [repositoryId, limit, fetchData]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  return { timeline, loading, error, refetch: loadTimeline };
};

export const useStats = (repositoryId = null) => {
  const [stats, setStats] = useState([]);
  const { loading, error, fetchData } = useApi();

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchData(() => apiService.getStats(repositoryId));
      setStats(data.stats || []);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [repositoryId, fetchData]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refetch: loadStats };
};

export const useUserStats = (repositoryId = null, limit = 10) => {
  const [userStats, setUserStats] = useState([]);
  const { loading, error, fetchData } = useApi();

  const loadUserStats = useCallback(async () => {
    try {
      const data = await fetchData(() => apiService.getUserStats(repositoryId, limit));
      setUserStats(data.user_stats || []);
    } catch (err) {
      console.error('Erro ao carregar estatísticas de usuários:', err);
    }
  }, [repositoryId, limit, fetchData]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  return { userStats, loading, error, refetch: loadUserStats };
};

export const useEventStats = (repositoryId = null) => {
  const [eventStats, setEventStats] = useState([]);
  const { loading, error, fetchData } = useApi();

  const loadEventStats = useCallback(async () => {
    try {
      const data = await fetchData(() => apiService.getEventStats(repositoryId));
      setEventStats(data.event_stats || []);
    } catch (err) {
      console.error('Erro ao carregar estatísticas de eventos:', err);
    }
  }, [repositoryId, fetchData]);

  useEffect(() => {
    loadEventStats();
  }, [loadEventStats]);

  return { eventStats, loading, error, refetch: loadEventStats };
};

export const useRepositories = () => {
  const [repositories, setRepositories] = useState([]);
  const { loading, error, fetchData } = useApi();

  const loadRepositories = useCallback(async () => {
    try {
      const data = await fetchData(() => apiService.getRepositories());
      setRepositories(data.repositories || []);
    } catch (err) {
      console.error('Erro ao carregar repositórios:', err);
    }
  }, [fetchData]);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  return { repositories, loading, error, refetch: loadRepositories };
};
