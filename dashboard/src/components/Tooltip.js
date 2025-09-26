import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Componente de Tooltip Educativo
 * Exibe informações explicativas quando o usuário passa o mouse sobre o ícone de ajuda
 */
const Tooltip = ({ 
  content, 
  position = 'top', 
  maxWidth = '300px',
  children,
  className = '',
  iconSize = 'w-4 h-4'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Calcular posição do tooltip
  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollLeft + 8;
        break;
      default:
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
    }

    // Ajustar para não sair da tela
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight + scrollTop - 8) {
      top = viewportHeight + scrollTop - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      window.addEventListener('scroll', updateTooltipPosition);
      window.addEventListener('resize', updateTooltipPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateTooltipPosition);
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger - pode ser children ou ícone padrão */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children || (
          <HelpCircle className={`${iconSize} text-gray-400 hover:text-gray-600 transition-colors`} />
        )}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: maxWidth
          }}
        >
          <div className="whitespace-pre-wrap">{content}</div>
          
          {/* Seta do tooltip */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1' :
              'right-full top-1/2 -translate-y-1/2 translate-x-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Hook para tooltips com conteúdo pré-definido
 */
export const useTooltips = () => {
  const tooltips = {
    // Estatísticas gerais
    totalEvents: "Número total de eventos recebidos via webhooks do GitHub, incluindo pushes, pull requests, issues, etc.",
    totalRepositories: "Quantidade de repositórios únicos que enviaram eventos para este dashboard.",
    totalUsers: "Número de usuários únicos que realizaram ações nos repositórios monitorados.",
    activeToday: "Eventos que ocorreram nas últimas 24 horas, mostrando a atividade recente.",
    
    // Timeline
    timeline: "Cronologia de todos os eventos recebidos, ordenados do mais recente para o mais antigo. Cada evento mostra detalhes como tipo, usuário, repositório e timestamp.",
    eventType: "Tipo do evento GitHub: push (commits), pull_request (PRs), issues (problemas), workflow_run (GitHub Actions), etc.",
    eventActor: "Usuário que realizou a ação que gerou o evento.",
    eventTime: "Data e hora exata quando o evento ocorreu no GitHub.",
    eventRepository: "Repositório onde o evento aconteceu.",
    
    // Gráfico de tipos de eventos
    eventTypeChart: "Distribuição visual dos tipos de eventos recebidos. Mostra quais tipos de atividades são mais comuns nos seus repositórios.",
    chartLegend: "Legenda explicando as cores e tipos de eventos representados no gráfico.",
    
    // Estatísticas de usuários
    userStats: "Ranking dos usuários mais ativos baseado no número de eventos gerados. Útil para identificar os colaboradores mais engajados.",
    userActivity: "Número de eventos gerados por cada usuário, incluindo commits, PRs, issues e outras ações.",
    userAvatar: "Foto de perfil do usuário no GitHub.",
    
    // Seletor de repositórios
    repositorySelector: "Filtro para visualizar eventos de um repositório específico. Selecione 'Todos' para ver eventos de todos os repositórios.",
    repositoryFilter: "Use este filtro para focar em um repositório específico e analisar sua atividade isoladamente.",
    
    // Conexão SSE
    realTimeConnection: "Indicador de conexão em tempo real. Verde = conectado, recebendo eventos instantaneamente. Vermelho = offline, usando atualização automática a cada 60 segundos.",
    lastUpdate: "Timestamp da última atualização dos dados no dashboard.",
    
    // Botões e controles
    refreshButton: "Atualiza manualmente todos os dados do dashboard. Útil quando a conexão em tempo real não está funcionando.",
    settingsButton: "Acesse configurações avançadas do dashboard (em desenvolvimento).",
    
    // Webhooks
    webhookUrl: "URL para configurar webhooks no GitHub. Cole esta URL nas configurações de webhooks do seu repositório.",
    webhookEvents: "Tipos de eventos que o webhook está configurado para receber do GitHub.",
    
    // SSE
    sseConnection: "Server-Sent Events (SSE) permite receber notificações em tempo real quando novos eventos chegam, sem precisar recarregar a página.",
    
    // Dados e armazenamento
    dataStorage: "Os dados são armazenados localmente em arquivos JSON. Cada evento é salvo com timestamp, tipo, usuário e detalhes completos.",
    eventDetails: "Cada evento contém informações detalhadas como mensagens de commit, títulos de PRs, descrições de issues, etc."
  };

  return tooltips;
};

export default Tooltip;
