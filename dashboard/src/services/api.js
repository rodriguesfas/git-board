import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Timeline
  getTimeline: (limit = 50, repositoryId = null) => {
    const params = { limit };
    if (repositoryId) params.repository_id = repositoryId;
    return api.get('/timeline', { params });
  },

  // Estatísticas gerais
  getStats: (repositoryId = null) => {
    const params = repositoryId ? { repository_id: repositoryId } : {};
    return api.get('/stats', { params });
  },

  // Estatísticas por usuário
  getUserStats: (repositoryId = null, limit = 10) => {
    const params = { limit };
    if (repositoryId) params.repository_id = repositoryId;
    return api.get('/user-stats', { params });
  },

  // Estatísticas por tipo de evento
  getEventStats: (repositoryId = null) => {
    const params = repositoryId ? { repository_id: repositoryId } : {};
    return api.get('/event-stats', { params });
  },

  // Lista de repositórios
  getRepositories: () => {
    return api.get('/repositories');
  },

  // Deletar repositório
  deleteRepository: (repositoryId) => {
    return api.delete(`/repositories/${repositoryId}`);
  },

  // Atividade recente
  getRecentActivity: (hours = 24, repositoryId = null) => {
    const params = { hours };
    if (repositoryId) params.repository_id = repositoryId;
    return api.get('/activity', { params });
  },
};

export default api;
