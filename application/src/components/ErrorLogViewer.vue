<script setup>
import { ref, onMounted } from 'vue'
import errorHandler from '../services/errorHandler.js'

const showPanel = ref(false)
const logs = ref([])

onMounted(() => {
  loadLogs()
})

function loadLogs() {
  logs.value = errorHandler.getErrorLogs(50)
}

function togglePanel() {
  showPanel.value = !showPanel.value
  if (showPanel.value) {
    loadLogs()
  }
}

function clearLogs() {
  if (confirm('确定要清空所有错误日志吗？')) {
    errorHandler.clearErrorLogs()
    loadLogs()
  }
}

function exportLogs() {
  errorHandler.exportErrorLogs()
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString)
    return date.toLocaleString('zh-CN')
  } catch {
    return isoString
  }
}

function getTypeLabel(type) {
  const labels = {
    js_error: 'JS错误',
    promise_rejection: 'Promise拒绝',
    resource_error: '资源错误',
    vue_error: 'Vue错误',
    api_error: 'API错误',
    network_error: '网络错误'
  }
  return labels[type] || type
}

function getTypeColor(type) {
  const colors = {
    js_error: '#ef4444',
    promise_rejection: '#f59e0b',
    resource_error: '#8b5cf6',
    vue_error: '#3b82f6',
    api_error: '#ec4899',
    network_error: '#6b7280'
  }
  return colors[type] || '#6b7280'
}
</script>

<template>
  <div class="error-log-viewer">
    <button class="toggle-btn" @click="togglePanel" :class="{ active: showPanel }">
      <span class="btn-icon">📋</span>
      <span class="btn-text">{{ showPanel ? '隐藏日志' : '错误日志' }}</span>
      <span v-if="logs.length" class="log-count">{{ logs.length }}</span>
    </button>

    <Transition name="slide">
      <div v-if="showPanel" class="log-panel">
        <div class="panel-header">
          <h3>📋 错误日志</h3>
          <div class="panel-actions">
            <button class="action-btn export" @click="exportLogs" title="导出日志">
              📥 导出
            </button>
            <button class="action-btn clear" @click="clearLogs" title="清空日志">
              🗑️ 清空
            </button>
            <button class="action-btn close" @click="togglePanel">
              ✕
            </button>
          </div>
        </div>

        <div v-if="logs.length === 0" class="empty-state">
          <span class="empty-icon">✅</span>
          <p>暂无错误日志</p>
          <p class="empty-hint">如果发生错误，日志会显示在这里</p>
        </div>

        <div v-else class="log-list">
          <div v-for="log in logs" :key="log.id" class="log-item">
            <div class="log-header">
              <span class="log-type" :style="{ backgroundColor: getTypeColor(log.type) }">
                {{ getTypeLabel(log.type) }}
              </span>
              <span class="log-time">{{ formatDate(log.context?.timestamp) }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.stack" class="log-stack">
              <details>
                <summary>查看堆栈信息</summary>
                <pre>{{ log.stack }}</pre>
              </details>
            </div>
            <div v-if="log.details" class="log-details">
              <details>
                <summary>查看详细信息</summary>
                <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.error-log-viewer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99998;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.toggle-btn.active {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  font-size: 18px;
}

.log-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.log-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 450px;
  max-height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-btn.export {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-btn.export:hover {
  background: rgba(255, 255, 255, 0.3);
}

.action-btn.clear {
  background: rgba(239, 68, 68, 0.8);
  color: white;
}

.action-btn.clear:hover {
  background: rgba(239, 68, 68, 1);
}

.action-btn.close {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 10px;
}

.action-btn.close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 4px 0;
}

.empty-hint {
  font-size: 13px;
  opacity: 0.7;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.log-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 3px solid #667eea;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-type {
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.log-time {
  font-size: 11px;
  color: #9ca3af;
}

.log-message {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  word-break: break-word;
}

.log-stack,
.log-details {
  margin-top: 8px;
}

.log-stack details,
.log-details details {
  font-size: 12px;
}

.log-stack summary,
.log-details summary {
  cursor: pointer;
  color: #667eea;
  font-weight: 500;
}

.log-stack summary:hover,
.log-details summary:hover {
  color: #7c3aed;
}

.log-stack pre,
.log-details pre {
  margin-top: 8px;
  padding: 10px;
  background: #1f2937;
  color: #e5e7eb;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 500px) {
  .error-log-viewer {
    bottom: 10px;
    right: 10px;
  }

  .log-panel {
    width: calc(100vw - 20px);
    right: 10px;
    max-height: 60vh;
  }

  .toggle-btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  .btn-text {
    display: none;
  }
}
</style>
