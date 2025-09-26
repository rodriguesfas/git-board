import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Clock, TrendingUp } from 'lucide-react';

const ActivityChart = ({ events = [], loading = false }) => {
  const [timeRange, setTimeRange] = useState('day'); // day, week, month
  const [chartType, setChartType] = useState('hourly'); // hourly, daily, weekly

  const chartData = useMemo(() => {
    if (!events || events.length === 0) {
      return [];
    }

    const now = new Date();
    let data = [];

    switch (timeRange) {
      case 'day':
        // Últimas 24 horas
        data = Array.from({ length: 24 }, (_, i) => {
          const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours());
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
          
          const count = events.filter(event => {
            // Converter formato "2025-09-26 05:12:35" para ISO
            const isoDate = event.created_at.replace(' ', 'T') + 'Z';
            const eventDate = new Date(isoDate);
            const isInRange = eventDate >= hourStart && eventDate < hourEnd;
            return isInRange;
          }).length;

          return {
            label: hour.getHours().toString().padStart(2, '0') + ':00',
            value: count,
            date: hourStart
          };
        });
        break;

      case 'week':
        // Últimos 7 dias
        data = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const count = events.filter(event => {
            // Converter formato "2025-09-26 05:12:35" para ISO
            const isoDate = event.created_at.replace(' ', 'T') + 'Z';
            const eventDate = new Date(isoDate);
            return eventDate >= dayStart && eventDate < dayEnd;
          }).length;

          return {
            label: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
            value: count,
            date: dayStart
          };
        });
        break;

      case 'month':
        // Últimos 30 dias
        data = Array.from({ length: 30 }, (_, i) => {
          const day = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const count = events.filter(event => {
            // Converter formato "2025-09-26 05:12:35" para ISO
            const isoDate = event.created_at.replace(' ', 'T') + 'Z';
            const eventDate = new Date(isoDate);
            return eventDate >= dayStart && eventDate < dayEnd;
          }).length;

          return {
            label: day.getDate().toString(),
            value: count,
            date: dayStart
          };
        });
        break;

      default:
        break;
    }

    return data;
  }, [events, timeRange]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const totalEvents = chartData.reduce((sum, d) => sum + d.value, 0);
  const avgEvents = totalEvents / chartData.length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
            <h3 className="text-lg font-semibold text-gray-900">Atividade Temporal</h3>
            <p className="text-sm text-gray-600">
              {timeRange === 'day' && 'Últimas 24 horas'}
              {timeRange === 'week' && 'Últimos 7 dias'}
              {timeRange === 'month' && 'Últimos 30 dias'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">24h</option>
            <option value="week">7 dias</option>
            <option value="month">30 dias</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
          <div className="text-sm text-blue-800">Total de Eventos</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{avgEvents.toFixed(1)}</div>
          <div className="text-sm text-green-800">Média por Período</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{maxValue}</div>
          <div className="text-sm text-purple-800">Pico de Atividade</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg hidden xl:block">
          <div className="text-2xl font-bold text-orange-600">{chartData.filter(d => d.value > 0).length}</div>
          <div className="text-sm text-orange-800">Períodos Ativos</div>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-lg hidden xl:block">
          <div className="text-2xl font-bold text-indigo-600">{Math.round((chartData.filter(d => d.value > 0).length / chartData.length) * 100)}%</div>
          <div className="text-sm text-indigo-800">Taxa de Atividade</div>
        </div>
        <div className="text-center p-3 bg-pink-50 rounded-lg hidden xl:block">
          <div className="text-2xl font-bold text-pink-600">{chartData.length > 0 ? Math.round(totalEvents / chartData.length * 100) / 100 : 0}</div>
          <div className="text-sm text-pink-800">Eventos/Período</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative">
        <div className="flex items-end justify-between h-64 chart-responsive px-4 pb-4 border-b border-gray-200">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer relative group"
                style={{ 
                  height: `${Math.max((item.value / maxValue) * 200, item.value > 0 ? 4 : 0)}px`,
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
                title={`${item.label}: ${item.value} eventos`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item.label}: {item.value} eventos
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Eixo Y */}
        <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Insights */}
      {chartData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Insights
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            {(() => {
              const peakHour = chartData.reduce((max, item) => 
                item.value > max.value ? item : max, chartData[0]
              );
              const quietHour = chartData.reduce((min, item) => 
                item.value < min.value ? item : min, chartData[0]
              );
              
              return (
                <>
                  <p>• <strong>Pico de atividade:</strong> {peakHour.label} ({peakHour.value} eventos)</p>
                  <p>• <strong>Período mais calmo:</strong> {quietHour.label} ({quietHour.value} eventos)</p>
                  {timeRange === 'day' && (
                    <p>• <strong>Padrão:</strong> {peakHour.value > avgEvents * 1.5 ? 'Atividade concentrada' : 'Atividade distribuída'}</p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityChart;
