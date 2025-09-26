import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Settings, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const NotificationSystem = ({ events = [], onNotificationSettings }) => {
  const [notifications, setNotifications] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    slack: false,
    thresholds: {
      highActivity: 10,
      failedWebhooks: 1,
      newRepositories: 1
    },
    eventTypes: {
      push: true,
      pull_request: true,
      issues: true,
      workflow_run: false
    }
  });

  // Verificar se o navegador suporta notificações
  useEffect(() => {
    if ('Notification' in window) {
      setIsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setIsEnabled(permission === 'granted');
    }
  }, []);

  // Criar notificação do navegador
  const createBrowserNotification = useCallback((title, body, icon = null) => {
    if (!isEnabled || !settings.push) return;

    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'git-board',
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }, [isEnabled, settings.push]);

  // Adicionar notificação à lista
  const addNotification = useCallback((type, title, message, data = null) => {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Manter apenas 50 notificações

    // Criar notificação do navegador
    createBrowserNotification(title, message);

    return notification;
  }, [createBrowserNotification]);

  // Detectar eventos importantes
  useEffect(() => {
    if (!events || events.length === 0) return;

    const latestEvent = events[0];
    if (!latestEvent) return;

    const eventTime = new Date(latestEvent.created_at);
    const now = new Date();
    const timeDiff = now - eventTime;

    // Só processar eventos muito recentes (últimos 30 segundos)
    if (timeDiff > 30000) return;

    // Verificar tipo de evento
    if (settings.eventTypes[latestEvent.event_type]) {
      switch (latestEvent.event_type) {
        case 'push':
          if (latestEvent.commits_count > 5) {
            addNotification(
              'info',
              'Push com muitos commits',
              `${latestEvent.actor_login} fez push com ${latestEvent.commits_count} commits em ${latestEvent.repository_name}`,
              latestEvent
            );
          }
          break;

        case 'pull_request':
          if (latestEvent.action === 'opened') {
            addNotification(
              'info',
              'Nova Pull Request',
              `${latestEvent.actor_login} abriu uma PR em ${latestEvent.repository_name}`,
              latestEvent
            );
          }
          break;

        case 'issues':
          if (latestEvent.action === 'opened') {
            addNotification(
              'warning',
              'Nova Issue',
              `${latestEvent.actor_login} abriu uma issue em ${latestEvent.repository_name}`,
              latestEvent
            );
          }
          break;

        case 'workflow_run':
          if (latestEvent.conclusion === 'failure') {
            addNotification(
              'error',
              'Workflow falhou',
              `Workflow falhou em ${latestEvent.repository_name}`,
              latestEvent
            );
          }
          break;
      }
    }
  }, [events, settings.eventTypes, addNotification]);

  // Detectar alta atividade
  useEffect(() => {
    if (!events || events.length === 0) return;

    const now = new Date();
    const last5Minutes = events.filter(event => {
      const eventTime = new Date(event.created_at);
      return (now - eventTime) <= 5 * 60 * 1000; // 5 minutos
    });

    if (last5Minutes.length >= settings.thresholds.highActivity) {
      addNotification(
        'info',
        'Alta atividade detectada',
        `${last5Minutes.length} eventos nos últimos 5 minutos`,
        { count: last5Minutes.length, period: '5 minutos' }
      );
    }
  }, [events, settings.thresholds.highActivity, addNotification]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={requestPermission}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        title="Notificações"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Status das notificações */}
      {!isEnabled && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Notificações desabilitadas
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Clique no sino para habilitar notificações do navegador
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de notificações */}
      {notifications.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notificações ({unreadCount} não lidas)
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como lidas
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpar
                </button>
                <button
                  onClick={() => onNotificationSettings && onNotificationSettings(settings)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Mostrando 10 de {notifications.length} notificações
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
