const errorLogs = []
const MAX_LOGS = 100

const errorTypes = {
  JS_ERROR: 'js_error',
  PROMISE_REJECTION: 'promise_rejection',
  RESOURCE_ERROR: 'resource_error',
  VUE_ERROR: 'vue_error',
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error'
}

function getTimestamp() {
  return new Date().toISOString()
}

function formatError(error) {
  return {
    message: error.message || String(error),
    stack: error.stack || null,
    name: error.name || 'Error'
  }
}

function collectContext() {
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: getTimestamp(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  }
}

function addErrorLog(errorInfo) {
  const log = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    ...errorInfo,
    context: collectContext()
  }
  
  errorLogs.unshift(log)
  
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.pop()
  }
  
  console.group('%c🚨 错误捕获', 'color: #ef4444; font-weight: bold; font-size: 14px;')
  console.log('%c类型:', 'color: #f59e0b; font-weight: bold;', errorInfo.type)
  console.log('%c消息:', 'color: #3b82f6; font-weight: bold;', errorInfo.message)
  if (errorInfo.stack) {
    console.log('%c堆栈:', 'color: #8b5cf6; font-weight: bold;', errorInfo.stack)
  }
  if (errorInfo.details) {
    console.log('%c详情:', 'color: #10b981; font-weight: bold;', errorInfo.details)
  }
  console.groupEnd()
  
  try {
    localStorage.setItem('errorLogs', JSON.stringify(errorLogs.slice(0, 50)))
  } catch (e) {
    console.warn('无法保存错误日志到 localStorage:', e)
  }
  
  return log
}

function handleJSError(message, source, lineno, colno, error) {
  return addErrorLog({
    type: errorTypes.JS_ERROR,
    message: message,
    source: source,
    lineno: lineno,
    colno: colno,
    stack: error?.stack,
    details: {
      source,
      lineno,
      colno
    }
  })
}

function handlePromiseRejection(event) {
  const reason = event.reason
  return addErrorLog({
    type: errorTypes.PROMISE_REJECTION,
    message: reason?.message || String(reason) || '未处理的 Promise 拒绝',
    stack: reason?.stack,
    details: {
      reason: reason
    }
  })
}

function handleResourceError(event) {
  const target = event.target
  return addErrorLog({
    type: errorTypes.RESOURCE_ERROR,
    message: `资源加载失败: ${target?.src || target?.href || '未知资源'}`,
    details: {
      tagName: target?.tagName,
      src: target?.src,
      href: target?.href
    }
  })
}

function handleVueError(error, instance, info) {
  return addErrorLog({
    type: errorTypes.VUE_ERROR,
    message: error?.message || String(error),
    stack: error?.stack,
    details: {
      component: instance?.$options?.name || instance?.type?.name || 'Unknown Component',
      info: info
    }
  })
}

function handleAPIError(error, url, method) {
  return addErrorLog({
    type: errorTypes.API_ERROR,
    message: error?.message || 'API 请求失败',
    stack: error?.stack,
    details: {
      url,
      method: method || 'GET',
      status: error?.status,
      statusText: error?.statusText
    }
  })
}

function handleNetworkError(error, url) {
  return addErrorLog({
    type: errorTypes.NETWORK_ERROR,
    message: error?.message || '网络错误',
    stack: error?.stack,
    details: {
      url,
      isOnline: navigator.onLine
    }
  })
}

function getErrorLogs(count = 50) {
  return errorLogs.slice(0, count)
}

function clearErrorLogs() {
  errorLogs.length = 0
  try {
    localStorage.removeItem('errorLogs')
  } catch (e) {
    console.warn('无法清除 localStorage 中的错误日志:', e)
  }
}

function loadStoredLogs() {
  try {
    const stored = localStorage.getItem('errorLogs')
    if (stored) {
      const logs = JSON.parse(stored)
      errorLogs.push(...logs)
    }
  } catch (e) {
    console.warn('无法加载存储的错误日志:', e)
  }
}

function exportErrorLogs() {
  const data = {
    exportTime: getTimestamp(),
    logs: getErrorLogs(100)
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `error-logs-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function initGlobalErrorHandler(app) {
  loadStoredLogs()
  
  window.onerror = function(message, source, lineno, colno, error) {
    handleJSError(message, source, lineno, colno, error)
    return false
  }
  
  window.addEventListener('unhandledrejection', function(event) {
    event.preventDefault()
    handlePromiseRejection(event)
  })
  
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.src || event.target.href)) {
      handleResourceError(event)
    }
  }, true)
  
  if (app && app.config) {
    app.config.errorHandler = function(error, instance, info) {
      handleVueError(error, instance, info)
      console.error('Vue 错误:', error)
    }
    
    app.config.warnHandler = function(msg, instance, trace) {
      console.warn('Vue 警告:', msg, trace)
    }
  }
  
  console.log('%c✅ 全局错误捕获已初始化', 'color: #10b981; font-weight: bold;')
}

function showErrorNotification(message, details = null) {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(239, 68, 68, 0.4);
    z-index: 99999;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `
  
  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <span style="font-size: 24px;">🚨</span>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">发生错误</div>
        <div style="font-size: 14px; opacity: 0.9;">${message}</div>
        ${details ? `<div style="font-size: 12px; opacity: 0.7; margin-top: 8px;">${details}</div>` : ''}
      </div>
    </div>
  `
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => notification.remove(), 300)
  }, 5000)
}

const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

export const errorHandler = {
  init: initGlobalErrorHandler,
  handleAPIError,
  handleNetworkError,
  getErrorLogs,
  clearErrorLogs,
  exportErrorLogs,
  showErrorNotification,
  errorTypes
}

export default errorHandler
