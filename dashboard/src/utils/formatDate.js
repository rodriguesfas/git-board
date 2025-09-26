import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    return dateString;
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    });
  } catch (error) {
    return dateString;
  }
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
