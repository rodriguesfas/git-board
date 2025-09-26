import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

const CompactMode = ({ isCompact, onToggle }) => {
  const [isEnabled, setIsEnabled] = useState(isCompact);

  useEffect(() => {
    setIsEnabled(isCompact);
  }, [isCompact]);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle(newState);
    
    // Salvar preferência no localStorage
    localStorage.setItem('git-board-compact-mode', newState.toString());
  };

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      title={isEnabled ? 'Sair do modo compacto' : 'Ativar modo compacto'}
    >
      {isEnabled ? (
        <>
          <Maximize2 className="w-4 h-4 mr-2" />
          Modo Normal
        </>
      ) : (
        <>
          <Minimize2 className="w-4 h-4 mr-2" />
          Modo Compacto
        </>
      )}
    </button>
  );
};

// Hook para gerenciar modo compacto
export const useCompactMode = () => {
  const [isCompact, setIsCompact] = useState(() => {
    const saved = localStorage.getItem('git-board-compact-mode');
    return saved === 'true';
  });

  const toggleCompactMode = (newState) => {
    setIsCompact(newState);
  };

  return {
    isCompact,
    toggleCompactMode
  };
};

// Componente para aplicar classes compactas
export const CompactWrapper = ({ children, isCompact, className = '' }) => {
  const compactClasses = isCompact ? 'compact-mode' : '';
  return (
    <div className={`${compactClasses} ${className}`}>
      {children}
    </div>
  );
};

export default CompactMode;
