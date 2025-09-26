import React from 'react';
import { 
  GitCommit, 
  GitPullRequest, 
  AlertCircle, 
  Users, 
  Activity,
  TrendingUp
} from 'lucide-react';
import { formatNumber } from '../utils/formatDate';

const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Nenhuma estatística disponível</div>
      </div>
    );
  }

  // Calcular totais
  const totals = stats.reduce((acc, stat) => ({
    totalEvents: acc.totalEvents + (stat.total_events || 0),
    totalPushes: acc.totalPushes + (stat.pushes || 0),
    totalPullRequests: acc.totalPullRequests + (stat.pull_requests || 0),
    totalIssues: acc.totalIssues + (stat.issues || 0),
    totalContributors: acc.totalContributors + (stat.unique_contributors || 0)
  }), {
    totalEvents: 0,
    totalPushes: 0,
    totalPullRequests: 0,
    totalIssues: 0,
    totalContributors: 0
  });

  const cards = [
    {
      title: 'Total de Eventos',
      value: formatNumber(totals.totalEvents),
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Pushes',
      value: formatNumber(totals.totalPushes),
      icon: <GitCommit className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Pull Requests',
      value: formatNumber(totals.totalPullRequests),
      icon: <GitPullRequest className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Issues',
      value: formatNumber(totals.totalIssues),
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
