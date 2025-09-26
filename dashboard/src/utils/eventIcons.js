import { 
  GitCommit, 
  GitPullRequest, 
  AlertCircle, 
  MessageSquare, 
  Eye, 
  CheckCircle, 
  XCircle,
  Plus,
  Minus,
  FileText
} from 'lucide-react';

export const getEventIcon = (eventType, action = null) => {
  switch (eventType) {
    case 'push':
      return <GitCommit className="w-4 h-4 text-green-600" />;
    
    case 'pull_request':
      switch (action) {
        case 'opened':
          return <GitPullRequest className="w-4 h-4 text-blue-600" />;
        case 'closed':
          return <XCircle className="w-4 h-4 text-red-600" />;
        case 'merged':
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        default:
          return <GitPullRequest className="w-4 h-4 text-blue-600" />;
      }
    
    case 'issues':
      switch (action) {
        case 'opened':
          return <AlertCircle className="w-4 h-4 text-orange-600" />;
        case 'closed':
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        default:
          return <AlertCircle className="w-4 h-4 text-orange-600" />;
      }
    
    case 'issue_comment':
      return <MessageSquare className="w-4 h-4 text-purple-600" />;
    
    case 'pull_request_review':
      return <Eye className="w-4 h-4 text-indigo-600" />;
    
    default:
      return <FileText className="w-4 h-4 text-gray-600" />;
  }
};

export const getEventColor = (eventType) => {
  switch (eventType) {
    case 'push':
      return 'bg-green-100 text-green-800';
    case 'pull_request':
      return 'bg-blue-100 text-blue-800';
    case 'issues':
      return 'bg-orange-100 text-orange-800';
    case 'issue_comment':
      return 'bg-purple-100 text-purple-800';
    case 'pull_request_review':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getActionText = (eventType, action) => {
  switch (eventType) {
    case 'push':
      return 'Push realizado';
    case 'pull_request':
      switch (action) {
        case 'opened':
          return 'Pull Request aberto';
        case 'closed':
          return 'Pull Request fechado';
        case 'merged':
          return 'Pull Request mesclado';
        default:
          return 'Pull Request atualizado';
      }
    case 'issues':
      switch (action) {
        case 'opened':
          return 'Issue aberta';
        case 'closed':
          return 'Issue fechada';
        default:
          return 'Issue atualizada';
      }
    case 'issue_comment':
      return 'Comentário adicionado';
    case 'pull_request_review':
      return 'Review realizado';
    default:
      return 'Evento recebido';
  }
};
