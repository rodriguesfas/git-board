import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, GitCommit, Calendar, Download, FileText } from 'lucide-react';

const ReportsInsights = ({ events = [], repositories = [], users = [] }) => {
  const [reportPeriod, setReportPeriod] = useState('week'); // day, week, month
  const [selectedRepository, setSelectedRepository] = useState('all');

  const reportData = useMemo(() => {
    if (!events || events.length === 0) return null;

    const now = new Date();
    let startDate, endDate;

    switch (reportPeriod) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    // Filtrar eventos por período e repositório
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.created_at);
      const inPeriod = eventDate >= startDate && eventDate <= endDate;
      const inRepository = selectedRepository === 'all' || event.repository_id === selectedRepository;
      return inPeriod && inRepository;
    });

    // Calcular métricas
    const totalEvents = filteredEvents.length;
    const uniqueUsers = new Set(filteredEvents.map(e => e.actor_login)).size;
    const uniqueRepositories = new Set(filteredEvents.map(e => e.repository_id)).size;

    // Eventos por tipo
    const eventsByType = filteredEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    // Eventos por usuário
    const eventsByUser = filteredEvents.reduce((acc, event) => {
      if (event.actor_login) {
        acc[event.actor_login] = (acc[event.actor_login] || 0) + 1;
      }
      return acc;
    }, {});

    // Eventos por repositório
    const eventsByRepo = filteredEvents.reduce((acc, event) => {
      if (event.repository_name) {
        acc[event.repository_name] = (acc[event.repository_name] || 0) + 1;
      }
      return acc;
    }, {});

    // Atividade por hora do dia
    const activityByHour = Array.from({ length: 24 }, (_, hour) => {
      const count = filteredEvents.filter(event => {
        const eventHour = new Date(event.created_at).getHours();
        return eventHour === hour;
      }).length;
      return { hour, count };
    });

    // Atividade por dia da semana
    const activityByDay = Array.from({ length: 7 }, (_, day) => {
      const count = filteredEvents.filter(event => {
        const eventDay = new Date(event.created_at).getDay();
        return eventDay === day;
      }).length;
      return { day, count };
    });

    // Top usuários
    const topUsers = Object.entries(eventsByUser)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([user, count]) => ({ user, count }));

    // Top repositórios
    const topRepositories = Object.entries(eventsByRepo)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([repo, count]) => ({ repo, count }));

    // Insights
    const insights = [];
    
    // Pico de atividade
    const peakHour = activityByHour.reduce((max, item) => 
      item.count > max.count ? item : max, activityByHour[0]
    );
    if (peakHour.count > 0) {
      insights.push({
        type: 'info',
        title: 'Pico de Atividade',
        description: `Maior atividade às ${peakHour.hour}:00 (${peakHour.count} eventos)`
      });
    }

    // Usuário mais ativo
    if (topUsers.length > 0) {
      insights.push({
        type: 'success',
        title: 'Usuário Mais Ativo',
        description: `${topUsers[0].user} com ${topUsers[0].count} eventos`
      });
    }

    // Repositório mais ativo
    if (topRepositories.length > 0) {
      insights.push({
        type: 'info',
        title: 'Repositório Mais Ativo',
        description: `${topRepositories[0].repo} com ${topRepositories[0].count} eventos`
      });
    }

    // Tendência
    const avgEventsPerDay = totalEvents / (reportPeriod === 'day' ? 1 : reportPeriod === 'week' ? 7 : 30);
    if (avgEventsPerDay > 10) {
      insights.push({
        type: 'success',
        title: 'Alta Produtividade',
        description: `Média de ${avgEventsPerDay.toFixed(1)} eventos por dia`
      });
    } else if (avgEventsPerDay < 2) {
      insights.push({
        type: 'warning',
        title: 'Baixa Atividade',
        description: `Média de ${avgEventsPerDay.toFixed(1)} eventos por dia`
      });
    }

    return {
      period: reportPeriod,
      startDate,
      endDate,
      totalEvents,
      uniqueUsers,
      uniqueRepositories,
      eventsByType,
      eventsByUser,
      eventsByRepo,
      activityByHour,
      activityByDay,
      topUsers,
      topRepositories,
      insights,
      avgEventsPerDay
    };
  }, [events, reportPeriod, selectedRepository]);

  const exportReport = () => {
    if (!reportData) return;

    const report = {
      period: reportData.period,
      startDate: reportData.startDate.toISOString(),
      endDate: reportData.endDate.toISOString(),
      summary: {
        totalEvents: reportData.totalEvents,
        uniqueUsers: reportData.uniqueUsers,
        uniqueRepositories: reportData.uniqueRepositories,
        avgEventsPerDay: reportData.avgEventsPerDay
      },
      topUsers: reportData.topUsers,
      topRepositories: reportData.topRepositories,
      eventsByType: reportData.eventsByType,
      insights: reportData.insights
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `git-board-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!reportData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum dado disponível para gerar relatórios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Relatórios e Insights</h3>
            <p className="text-sm text-gray-600">
              {reportPeriod === 'day' && 'Últimas 24 horas'}
              {reportPeriod === 'week' && 'Últimos 7 dias'}
              {reportPeriod === 'month' && 'Últimos 30 dias'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedRepository}
            onChange={(e) => setSelectedRepository(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os repositórios</option>
            {repositories.map(repo => (
              <option key={repo.id} value={repo.id}>{repo.full_name}</option>
            ))}
          </select>
          
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">24h</option>
            <option value="week">7 dias</option>
            <option value="month">30 dias</option>
          </select>
          
          <button
            onClick={exportReport}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{reportData.totalEvents}</div>
          <div className="text-sm text-blue-800">Total de Eventos</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{reportData.uniqueUsers}</div>
          <div className="text-sm text-green-800">Usuários Únicos</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{reportData.uniqueRepositories}</div>
          <div className="text-sm text-purple-800">Repositórios</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{reportData.avgEventsPerDay.toFixed(1)}</div>
          <div className="text-sm text-orange-800">Média/Dia</div>
        </div>
      </div>

      {/* Insights */}
      {reportData.insights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <h5 className="font-medium text-gray-900">{insight.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top usuários e repositórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top usuários */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Top Usuários
          </h4>
          <div className="space-y-3">
            {reportData.topUsers.map((user, index) => (
              <div key={user.user} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{user.user}</span>
                </div>
                <span className="text-sm text-gray-600">{user.count} eventos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top repositórios */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <GitCommit className="w-5 h-5 mr-2" />
            Top Repositórios
          </h4>
          <div className="space-y-3">
            {reportData.topRepositories.map((repo, index) => (
              <div key={repo.repo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900 truncate">{repo.repo}</span>
                </div>
                <span className="text-sm text-gray-600">{repo.count} eventos</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de atividade por hora */}
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Atividade por Hora</h4>
        <div className="flex items-end justify-between h-32 px-4 pb-4 border border-gray-200 rounded-lg">
          {reportData.activityByHour.map((item, index) => {
            const maxCount = Math.max(...reportData.activityByHour.map(h => h.count));
            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${item.hour}:00 - ${item.count} eventos`}
                />
                <div className="text-xs text-gray-600 mt-1">
                  {item.hour}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsInsights;
