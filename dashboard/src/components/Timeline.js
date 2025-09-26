import React from 'react';
import { formatRelativeTime } from '../utils/formatDate';
import { getEventIcon, getEventColor, getActionText } from '../utils/eventIcons';
import Tooltip, { useTooltips } from './Tooltip';

const Timeline = ({ events, loading }) => {
  const tooltips = useTooltips();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Nenhum evento encontrado</div>
        <div className="text-gray-400 text-sm mt-2">
          Configure um webhook no GitHub para começar a receber eventos
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getEventIcon(event.event_type, event.action)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                  <Tooltip content={tooltips.eventType} position="top">
                    <div className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </Tooltip>
                </div>
                {event.action && (
                  <span className="text-sm text-gray-600">
                    {getActionText(event.event_type, event.action)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">
                    {event.repository_name}
                  </span>
                  <Tooltip content={tooltips.eventRepository} position="top">
                    <div className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </Tooltip>
                </div>
                {event.actor_login && (
                  <div className="flex items-center gap-1">
                    <span>por <strong>{event.actor_login}</strong></span>
                    <Tooltip content={tooltips.eventActor} position="top">
                      <div className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Tooltip>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>{formatRelativeTime(event.created_at)}</span>
                  <Tooltip content={tooltips.eventTime} position="top">
                    <div className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </Tooltip>
                </div>
              </div>

              {event.title && (
                <div className="text-gray-900 font-medium mb-1">
                  {event.title}
                </div>
              )}

              {event.body && (
                <div className="text-gray-600 text-sm line-clamp-2">
                  {event.body}
                </div>
              )}

              {/* Estatísticas do evento */}
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                {event.commits_count > 0 && (
                  <span>{event.commits_count} commit(s)</span>
                )}
                {event.files_changed > 0 && (
                  <span>{event.files_changed} arquivo(s) alterado(s)</span>
                )}
                {event.additions > 0 && (
                  <span className="text-green-600">+{event.additions}</span>
                )}
                {event.deletions > 0 && (
                  <span className="text-red-600">-{event.deletions}</span>
                )}
                {event.branch && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {event.branch}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
