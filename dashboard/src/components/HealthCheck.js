import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, XCircle, AlertTriangle, RefreshCw, Server, Database, Globe } from 'lucide-react';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState({
    api: { status: 'checking', responseTime: 0, lastCheck: null },
    database: { status: 'checking', responseTime: 0, lastCheck: null },
    nginx: { status: 'checking', responseTime: 0, lastCheck: null },
    overall: 'checking'
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkService = async (service, url, method = 'GET') => {
    const startTime = Date.now();
    try {
      const response = await fetch(url, { 
        method,
        headers: { 'Content-Type': 'application/json' }
      });
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        statusCode: response.status,
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        error: error.message
      };
    }
  };

  const performHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      // Verificar API
      const apiHealth = await checkService('api', '/api/repositories');
      
      // Verificar Database (através da API)
      const dbHealth = await checkService('database', '/api/repositories');
      
      // Verificar Nginx (através do dashboard)
      const nginxHealth = await checkService('nginx', '/');
      
      const newHealthStatus = {
        api: apiHealth,
        database: dbHealth,
        nginx: nginxHealth,
        overall: 'healthy'
      };

      // Determinar status geral
      const hasUnhealthy = Object.values(newHealthStatus).some(service => 
        typeof service === 'object' && service.status === 'unhealthy'
      );
      
      if (hasUnhealthy) {
        newHealthStatus.overall = 'unhealthy';
      } else if (Object.values(newHealthStatus).some(service => 
        typeof service === 'object' && service.status === 'checking'
      )) {
        newHealthStatus.overall = 'checking';
      }

      setHealthStatus(newHealthStatus);
    } catch (error) {
      console.error('Erro no health check:', error);
      setHealthStatus(prev => ({
        ...prev,
        overall: 'unhealthy'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  // Health check automático a cada 30 segundos
  useEffect(() => {
    performHealthCheck();
    const interval = setInterval(performHealthCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'checking':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getResponseTimeColor = (responseTime) => {
    if (responseTime < 200) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Heart className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Health Check</h3>
            <p className="text-sm text-gray-600">Status dos serviços do sistema</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(healthStatus.overall)}`}>
            {getStatusIcon(healthStatus.overall)}
            <span className="ml-2 capitalize">
              {healthStatus.overall === 'checking' ? 'Verificando...' : healthStatus.overall}
            </span>
          </div>
          
          <button
            onClick={performHealthCheck}
            disabled={isChecking}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Verificar novamente"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status dos serviços */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Server className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">API</span>
            </div>
            {getStatusIcon(healthStatus.api.status)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium capitalize ${getStatusColor(healthStatus.api.status).split(' ')[1]}`}>
                {healthStatus.api.status}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tempo de resposta:</span>
              <span className={`font-medium ${getResponseTimeColor(healthStatus.api.responseTime)}`}>
                {healthStatus.api.responseTime}ms
              </span>
            </div>
            
            {healthStatus.api.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {healthStatus.api.error}
              </div>
            )}
            
            {healthStatus.api.lastCheck && (
              <div className="text-xs text-gray-500">
                Última verificação: {healthStatus.api.lastCheck.toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
        </div>

        {/* Database */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Database</span>
            </div>
            {getStatusIcon(healthStatus.database.status)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium capitalize ${getStatusColor(healthStatus.database.status).split(' ')[1]}`}>
                {healthStatus.database.status}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tempo de resposta:</span>
              <span className={`font-medium ${getResponseTimeColor(healthStatus.database.responseTime)}`}>
                {healthStatus.database.responseTime}ms
              </span>
            </div>
            
            {healthStatus.database.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {healthStatus.database.error}
              </div>
            )}
            
            {healthStatus.database.lastCheck && (
              <div className="text-xs text-gray-500">
                Última verificação: {healthStatus.database.lastCheck.toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
        </div>

        {/* Nginx */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Nginx</span>
            </div>
            {getStatusIcon(healthStatus.nginx.status)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium capitalize ${getStatusColor(healthStatus.nginx.status).split(' ')[1]}`}>
                {healthStatus.nginx.status}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tempo de resposta:</span>
              <span className={`font-medium ${getResponseTimeColor(healthStatus.nginx.responseTime)}`}>
                {healthStatus.nginx.responseTime}ms
              </span>
            </div>
            
            {healthStatus.nginx.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {healthStatus.nginx.error}
              </div>
            )}
            
            {healthStatus.nginx.lastCheck && (
              <div className="text-xs text-gray-500">
                Última verificação: {healthStatus.nginx.lastCheck.toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Resumo do Sistema</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {healthStatus.overall === 'healthy' && (
            <p className="text-green-600">✅ Todos os serviços estão funcionando normalmente</p>
          )}
          {healthStatus.overall === 'unhealthy' && (
            <p className="text-red-600">❌ Alguns serviços apresentam problemas</p>
          )}
          {healthStatus.overall === 'checking' && (
            <p className="text-yellow-600">🔄 Verificando status dos serviços...</p>
          )}
          
          <p>• Health check automático a cada 30 segundos</p>
          <p>• Tempo de resposta ideal: &lt; 200ms</p>
          <p>• Tempo de resposta aceitável: &lt; 500ms</p>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
