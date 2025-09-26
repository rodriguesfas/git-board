import { useEffect, useRef, useState } from 'react';

/**
 * Hook para Server-Sent Events (SSE)
 * Escuta eventos em tempo real e executa callback quando novos eventos chegam
 */
export const useSSE = (url, onNewEvent, onError) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEventId, setLastEventId] = useState(0);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      // Fechar conexão anterior se existir
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Construir URL com lastEventId se disponível
      const sseUrl = lastEventId > 0 ? `${url}?lastEventId=${lastEventId}` : url;
      
      // Criar nova conexão SSE
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      // Evento de conexão aberta
      eventSource.onopen = () => {
        console.log('SSE conectado');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      // Evento de novo evento
      eventSource.addEventListener('new_event', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Novo evento recebido via SSE:', data);
          
          // Atualizar lastEventId se disponível
          if (data.event && data.event.id) {
            setLastEventId(data.event.id);
          }
          
          // Executar callback
          if (onNewEvent) {
            onNewEvent(data);
          }
        } catch (error) {
          console.error('Erro ao processar evento SSE:', error);
        }
      });

      // Evento de heartbeat
      eventSource.addEventListener('heartbeat', (event) => {
        console.log('SSE heartbeat recebido');
      });

      // Evento de fechamento
      eventSource.addEventListener('close', (event) => {
        console.log('SSE fechado pelo servidor');
        setIsConnected(false);
        eventSource.close();
      });

      // Evento de erro
      eventSource.onerror = (error) => {
        console.error('Erro na conexão SSE:', error);
        setIsConnected(false);
        eventSource.close();

        // Tentar reconectar
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Backoff exponencial, máximo 30s
          
          console.log(`Tentando reconectar SSE em ${delay}ms (tentativa ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('Máximo de tentativas de reconexão SSE atingido');
          if (onError) {
            onError(new Error('Falha na conexão SSE após múltiplas tentativas'));
          }
        }
      };

    } catch (error) {
      console.error('Erro ao conectar SSE:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Conectar quando o hook é montado
  useEffect(() => {
    connect();

    // Cleanup quando o componente é desmontado
    return () => {
      disconnect();
    };
  }, []);

  // Reconectar quando lastEventId muda
  useEffect(() => {
    if (lastEventId > 0 && isConnected) {
      // Reconectar com o novo lastEventId
      connect();
    }
  }, [lastEventId]);

  return {
    isConnected,
    lastEventId,
    connect,
    disconnect
  };
};
