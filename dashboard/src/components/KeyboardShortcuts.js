import React, { useState, useEffect } from 'react';
import { Keyboard, X, Command, Option } from 'lucide-react';

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  const [shortcuts] = useState([
    {
      key: 'r',
      modifiers: ['ctrl'],
      description: 'Atualizar dados',
      action: 'refresh'
    },
    {
      key: 's',
      modifiers: ['ctrl'],
      description: 'Abrir configurações',
      action: 'settings'
    },
    {
      key: 'f',
      modifiers: ['ctrl'],
      description: 'Abrir filtros',
      action: 'filters'
    },
    {
      key: 'h',
      modifiers: ['ctrl'],
      description: 'Mostrar atalhos',
      action: 'help'
    },
    {
      key: 'Escape',
      modifiers: [],
      description: 'Fechar modais',
      action: 'close'
    },
    {
      key: '1',
      modifiers: ['ctrl'],
      description: 'Ir para dashboard',
      action: 'dashboard'
    },
    {
      key: '2',
      modifiers: ['ctrl'],
      description: 'Ir para timeline',
      action: 'timeline'
    },
    {
      key: '3',
      modifiers: ['ctrl'],
      description: 'Ir para relatórios',
      action: 'reports'
    }
  ]);

  const getModifierIcon = (modifier) => {
    switch (modifier) {
      case 'ctrl':
        return <span className="text-xs font-semibold">Ctrl</span>;
      case 'alt':
        return <Option className="w-3 h-3" />;
      case 'shift':
        return <span className="text-xs font-semibold">Shift</span>;
      case 'cmd':
        return <Command className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getKeyDisplay = (key) => {
    const specialKeys = {
      'Escape': 'Esc',
      ' ': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→'
    };
    return specialKeys[key] || key.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Keyboard className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Atalhos de Teclado</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <div className="flex items-center space-x-1">
                  {shortcut.modifiers.map((modifier, modIndex) => (
                    <React.Fragment key={modIndex}>
                      <kbd className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-800 text-xs font-mono rounded border border-gray-300">
                        {getModifierIcon(modifier)}
                      </kbd>
                      {modIndex < shortcut.modifiers.length - 1 && (
                        <span className="text-gray-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                  {shortcut.modifiers.length > 0 && (
                    <span className="text-gray-400 text-xs">+</span>
                  )}
                  <kbd className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-800 text-xs font-mono rounded border border-gray-300">
                    {getKeyDisplay(shortcut.key)}
                  </kbd>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Dicas:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use Ctrl+Shift+R para atualização forçada (bypass cache)</li>
              <li>• Pressione Tab para navegar entre elementos</li>
              <li>• Use as setas para navegar em listas</li>
              <li>• Pressione Enter para ativar botões focados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar atalhos de teclado
export const useKeyboardShortcuts = (callbacks = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, altKey, shiftKey, metaKey } = event;
      
      // Prevenir atalhos padrão do navegador em alguns casos
      if (ctrlKey && ['r', 's', 'f', 'h'].includes(key.toLowerCase())) {
        event.preventDefault();
      }

      // Mapear atalhos
      const shortcuts = {
        'r': () => ctrlKey && callbacks.refresh?.(),
        's': () => ctrlKey && callbacks.settings?.(),
        'f': () => ctrlKey && callbacks.filters?.(),
        'h': () => ctrlKey && callbacks.help?.(),
        'Escape': () => callbacks.close?.(),
        '1': () => ctrlKey && callbacks.dashboard?.(),
        '2': () => ctrlKey && callbacks.timeline?.(),
        '3': () => ctrlKey && callbacks.reports?.()
      };

      const shortcut = shortcuts[key] || shortcuts[key.toLowerCase()];
      if (shortcut) {
        shortcut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

export default KeyboardShortcuts;
