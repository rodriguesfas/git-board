import { useState, useMemo } from 'react';

export const useFilters = (events = []) => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    authors: [],
    eventTypes: [],
    repositories: [],
    branches: [],
    searchTerm: ''
  });

  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    return events.filter(event => {
      // Filtro por data
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(event.created_at);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
      }

      // Filtro por autores
      if (filters.authors.length > 0 && !filters.authors.includes(event.actor_login)) {
        return false;
      }

      // Filtro por tipos de evento
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.event_type)) {
        return false;
      }

      // Filtro por repositórios
      if (filters.repositories.length > 0 && !filters.repositories.includes(event.repository_id)) {
        return false;
      }

      // Filtro por branches
      if (filters.branches.length > 0 && event.branch && !filters.branches.includes(event.branch)) {
        return false;
      }

      // Filtro por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = [
          event.title,
          event.body,
          event.repository_name,
          event.actor_login,
          event.event_type,
          event.action
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        start: '',
        end: ''
      },
      authors: [],
      eventTypes: [],
      repositories: [],
      branches: [],
      searchTerm: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.authors.length > 0) count++;
    if (filters.eventTypes.length > 0) count++;
    if (filters.repositories.length > 0) count++;
    if (filters.branches.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  return {
    filters,
    filteredEvents,
    updateFilters,
    clearFilters,
    getActiveFiltersCount
  };
};
