
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.enabled = true;
  }

  formatLog(level, message, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  addLog(logEntry) {
    this.logs.push(logEntry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    try {
      const storedLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      storedLogs.push(logEntry);
      
      if (storedLogs.length > 50) {
        storedLogs.shift();
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(storedLogs));
    } catch (e) {
      console.warn('Failed to store log in localStorage:', e);
    }
  }

  debug(message, context = {}) {
    if (!this.enabled) return;
    
    const logEntry = this.formatLog(LOG_LEVELS.DEBUG, message, context);
    this.addLog(logEntry);
    console.log(`[${LOG_LEVELS.DEBUG}]`, message, context);
  }

  info(message, context = {}) {
    if (!this.enabled) return;
    
    const logEntry = this.formatLog(LOG_LEVELS.INFO, message, context);
    this.addLog(logEntry);
    console.info(`[${LOG_LEVELS.INFO}]`, message, context);
  }

  warn(message, context = {}) {
    if (!this.enabled) return;
    
    const logEntry = this.formatLog(LOG_LEVELS.WARN, message, context);
    this.addLog(logEntry);
    console.warn(`[${LOG_LEVELS.WARN}]`, message, context);
  }

  error(message, error = null, context = {}) {
    if (!this.enabled) return;
    
    const errorContext = {
      ...context,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
    
    const logEntry = this.formatLog(LOG_LEVELS.ERROR, message, errorContext);
    this.addLog(logEntry);
    console.error(`[${LOG_LEVELS.ERROR}]`, message, error, context);
  }

  getLogs() {
    return this.logs;
  }

  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch (e) {
      console.warn('Failed to retrieve logs from localStorage:', e);
      return [];
    }
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('errorLogs');
    } catch (e) {
      console.warn('Failed to clear logs from localStorage:', e);
    }
  }

  exportLogs() {
    const allLogs = {
      memoryLogs: this.logs,
      storedLogs: this.getStoredLogs(),
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(allLogs, null, 2);
  }

  downloadLogs() {
    const logsJson = this.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

const errorLogger = new ErrorLogger();

window.addEventListener('error', (event) => {
  errorLogger.error('Uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorLogger.error('Unhandled promise rejection', event.reason, {
    promise: event.promise,
  });
});

export default errorLogger;

export const logDebug = (message, context) => errorLogger.debug(message, context);
export const logInfo = (message, context) => errorLogger.info(message, context);
export const logWarn = (message, context) => errorLogger.warn(message, context);
export const logError = (message, error, context) => errorLogger.error(message, error, context);
