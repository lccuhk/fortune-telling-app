<script setup>
import { computed } from 'vue'
import { useHistory } from '../composables/useHistory.js'

const {
  history,
  showHistory,
  hasHistory,
  historyCount,
  removeHistoryItem,
  clearHistory,
  closeHistory
} = useHistory()

const typeIcons = {
  tarot: '🃏',
  bazi: '🎯',
  ziwei: '⭐',
  shengxiao: '🐲',
  xingzuo: '♈',
  xingming: '📝',
  jiemeng: '💭',
  hepan: '💑',
  huangli: '📅',
  fortune: '🔮'
}

const typeNames = {
  tarot: '塔罗牌',
  bazi: '八字算命',
  ziwei: '紫微斗数',
  shengxiao: '生肖运势',
  xingzuo: '星座运势',
  xingming: '姓名学',
  jiemeng: '周公解梦',
  hepan: '多人合盘',
  huangli: '黄历',
  fortune: '传统算命'
}

const recentHistory = computed(() => history.value.slice(0, 10))

function handleRemove(id) {
  if (confirm('确定要删除这条记录吗？')) {
    removeHistoryItem(id)
  }
}

function handleClear() {
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
    clearHistory()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="showHistory" class="history-overlay" @click.self="closeHistory">
        <div class="history-panel">
          <div class="history-header">
            <h3>📜 历史记录</h3>
            <div class="header-actions">
              <span class="history-count">{{ historyCount }} 条记录</span>
              <button v-if="hasHistory" class="clear-btn" @click="handleClear">清空</button>
              <button class="close-btn" @click="closeHistory">✕</button>
            </div>
          </div>

          <div class="history-content">
            <div v-if="!hasHistory" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无历史记录</p>
              <p class="empty-hint">开始算命后，记录将显示在这里</p>
            </div>

            <div v-else class="history-list">
              <div v-for="item in recentHistory" :key="item.id" class="history-item">
                <div class="item-icon">{{ typeIcons[item.type] || '🔮' }}</div>
                <div class="item-content">
                  <div class="item-title">
                    {{ item.title || typeNames[item.type] || '算命记录' }}
                  </div>
                  <div class="item-meta">
                    <span class="item-type">{{ typeNames[item.type] || item.type }}</span>
                    <span class="item-time">{{ item.formattedTime }}</span>
                  </div>
                </div>
                <button class="delete-btn" title="删除" @click="handleRemove(item.id)">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.history-panel {
  width: 400px;
  max-width: 100%;
  height: 100%;
  background: white;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #374151;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.clear-btn {
  padding: 5px 15px;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #fee2e2;
}

.close-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state p {
  margin: 0 0 10px 0;
  color: #374151;
  font-size: 1.1rem;
}

.empty-hint {
  color: #6b7280 !important;
  font-size: 0.875rem !important;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #f3f4f6;
}

.item-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  color: #374151;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  gap: 10px;
  font-size: 0.75rem;
  color: #6b7280;
}

.item-type {
  padding: 2px 8px;
  background: #e5e7eb;
  border-radius: 4px;
}

.delete-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  opacity: 1;
  background: #fee2e2;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .history-panel,
.slide-leave-to .history-panel {
  transform: translateX(100%);
}

@media (max-width: 480px) {
  .history-panel {
    width: 100%;
  }
}
</style>
