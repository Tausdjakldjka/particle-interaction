import { useState, useEffect } from 'react'
import './MobileTip.css'

/**
 * 移动端使用提示组件
 * {{ AURA-X: Create - 移动端友好的操作提示 }}
 */
function MobileTip() {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // 3秒后自动隐藏
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  const handleShow = () => {
    setIsVisible(true)
  }

  // 检测是否是移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // 非移动端不显示
  if (!isMobile) return null

  return (
    <>
      {/* 提示面板 */}
      {isVisible && !isDismissed && (
        <div className="mobile-tip">
          <div className="mobile-tip-header">
            <span className="mobile-tip-title">👋 操作提示</span>
            <button className="mobile-tip-close" onClick={handleDismiss}>✕</button>
          </div>
          <div className="mobile-tip-content">
            <div className="mobile-tip-item">
              <span className="mobile-tip-icon">✋</span>
              <span>张开/握紧手掌 → 粒子扩散/收缩</span>
            </div>
            <div className="mobile-tip-item">
              <span className="mobile-tip-icon">🔄</span>
              <span>翻转手掌 → 模型旋转</span>
            </div>
            <div className="mobile-tip-item">
              <span className="mobile-tip-icon">📏</span>
              <span>手掌远近 → 相机远近</span>
            </div>
            <div className="mobile-tip-item">
              <span className="mobile-tip-icon">💕</span>
              <span>比心手势 → 爱的告白</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 悬浮按钮（关闭后可重新打开） */}
      {!isVisible && isDismissed && (
        <button className="mobile-tip-fab" onClick={handleShow}>
          ❓
        </button>
      )}
    </>
  )
}

export default MobileTip

