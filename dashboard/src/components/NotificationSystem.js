import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Settings, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const NotificationSystem = ({ events = [], onNotificationSettings }) => {
  const [notifications, setNotifications] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.notification-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
    <div className="relative notification-dropdown">
      {/* Botão de notificações */}
      <button
        onClick={() => {
          if (!isEnabled) {
            requestPermission();
          } else {
            setIsDropdownOpen(!isDropdownOpen);
          }
        }}
        className="relative inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        title="Notificações"
      >
        <Bell className="w-4 h-4 mr-2" />
        Notificações
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header do dropdown */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Limpar
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    onNotificationSettings && onNotificationSettings(settings);
                    setIsDropdownOpen(false);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo do dropdown */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
                <p className="text-xs text-gray-400 mt-1">
                  Você será notificado sobre eventos importantes
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
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
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">
                Mostrando 10 de {notifications.length} notificações
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status das notificações - apenas quando não habilitadas */}
      {!isEnabled && !isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Notificações desabilitadas
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Clique no botão para habilitar notificações do navegador
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
