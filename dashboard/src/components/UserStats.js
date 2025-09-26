import React from 'react';
import { Users, GitCommit, GitPullRequest, AlertCircle, TrendingUp } from 'lucide-react';
import { formatNumber } from '../utils/formatDate';
import Tooltip from './Tooltip';

const UserStats = ({ userStats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userStats || userStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Top Contribuidores
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Nenhum contribuidor encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        <Tooltip content="Usuários com maior número de eventos no repositório. Inclui pushes, pull requests, issues e outras atividades." position="bottom">
          Top Contribuidores
        </Tooltip>
      </h3>
      
      <div className="space-y-4">
        {userStats.map((user, index) => (
          <div key={user.actor_login} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tooltip content={`Usuário: ${user.actor_login} - Contribuidor ativo do repositório`} position="right">
                <div className="flex-shrink-0 cursor-help">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.actor_login?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </Tooltip>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user.actor_login}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <Tooltip content={`Commits enviados para o repositório (${user.pushes || 0} total)`} position="top">
                    <span className="flex items-center cursor-help">
                      <GitCommit className="w-3 h-3 mr-1" />
                      {user.pushes || 0}
                    </span>
                  </Tooltip>
                  <Tooltip content={`Pull requests criados, revisados ou comentados (${user.pull_requests || 0} total)`} position="top">
                    <span className="flex items-center cursor-help">
                      <GitPullRequest className="w-3 h-3 mr-1" />
                      {user.pull_requests || 0}
                    </span>
                  </Tooltip>
                  <Tooltip content={`Issues criadas, comentadas ou fechadas (${user.issues || 0} total)`} position="top">
                    <span className="flex items-center cursor-help">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {user.issues || 0}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
            
            <Tooltip content={`Total de ${formatNumber(user.total_events)} eventos realizados por este usuário, incluindo pushes, pull requests, issues, workflows e outras atividades.`} position="left">
              <div className="text-right cursor-help">
                <div className="text-sm font-semibold text-gray-900">
                  {formatNumber(user.total_events)}
                </div>
                <div className="text-xs text-gray-500">
                  eventos
                </div>
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStats;
