import React, { useState, useEffect } from 'react';
import errorLogger from '../utils/errorLogger';

/**
 * Debug Panel Component
 * Shows error logs and system information for debugging
 * Press Ctrl+Shift+D to toggle
 */
const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Toggle panel with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-refresh logs
  useEffect(() => {
    if (!isOpen || !autoRefresh) return;

    const interval = setInterval(() => {
      setLogs(errorLogger.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoRefresh]);

  // Load logs when panel opens
  useEffect(() => {
    if (isOpen) {
      setLogs(errorLogger.getLogs());
    }
  }, [isOpen]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.level === filter;
  });

  const handleClearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
  };

  const handleDownloadLogs = () => {
    errorLogger.downloadLogs();
  };

  const handleRefresh = () => {
    setLogs(errorLogger.getLogs());
  };

  if (!isOpen) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-colors z-50"
        onClick={() => setIsOpen(true)}
        title="Click to open debug panel (or press Ctrl+Shift+D)"
      >
        🐛 Debug
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">🐛 Debug Panel</h2>
            <span className="text-sm text-gray-300">
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-100 px-6 py-3 flex items-center gap-4 border-b">
          <div className="flex gap-2">
            {['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="flex-1"></div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>

          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            🔄 Refresh
          </button>

          <button
            onClick={handleDownloadLogs}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            📥 Download
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No logs to display</p>
              <p className="text-sm mt-2">Logs will appear here as the application runs</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    log.level === 'ERROR'
                      ? 'bg-red-50 border-red-500'
                      : log.level === 'WARN'
                      ? 'bg-yellow-50 border-yellow-500'
                      : log.level === 'INFO'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            log.level === 'ERROR'
                              ? 'bg-red-600 text-white'
                              : log.level === 'WARN'
                              ? 'bg-yellow-600 text-white'
                              : log.level === 'INFO'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{log.message}</p>
                      {Object.keys(log.context).length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 rounded-b-lg text-sm text-gray-600 border-t">
          Press <kbd className="px-2 py-1 bg-white rounded border">Ctrl</kbd> +{' '}
          <kbd className="px-2 py-1 bg-white rounded border">Shift</kbd> +{' '}
          <kbd className="px-2 py-1 bg-white rounded border">D</kbd> to toggle this panel
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
