import { useRef, useEffect } from 'react'
import { HAND_CONNECTIONS, COLORS } from '../utils/handConnections'
import './VideoPreview.css'

/**
 * 摄像头视频预览组件
 * {{ AURA-X: Modify - 添加手部关键点可视化Canvas层 }}
 */
function VideoPreview({ videoRef, interactionStrength = 0, isFacingCamera = false, isHeartGesture = false, handLandmarks = null }) {
  const isActive = interactionStrength > 0.1
  const strengthPercent = Math.round(interactionStrength * 100)
  const canvasRef = useRef(null)
  
  // {{ AURA-X: Add - 实时绘制手部关键点和连接线 }}
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video) return
    
    const ctx = canvas.getContext('2d')
    let animationId
    
    const drawHands = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (handLandmarks && handLandmarks.length > 0) {
        // 绘制每只检测到的手
        handLandmarks.forEach(landmarks => {
          // 1. 绘制连接线
          ctx.strokeStyle = COLORS.connection
          ctx.lineWidth = COLORS.lineWidth
          ctx.lineCap = 'round'
          
          HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const start = landmarks[startIdx]
            const end = landmarks[endIdx]
            
            if (start && end) {
              ctx.beginPath()
              ctx.moveTo(start.x * canvas.width, start.y * canvas.height)
              ctx.lineTo(end.x * canvas.width, end.y * canvas.height)
              ctx.stroke()
            }
          })
          
          // 2. 绘制关键点
          ctx.fillStyle = COLORS.point
          landmarks.forEach(landmark => {
            if (landmark) {
              const x = landmark.x * canvas.width
              const y = landmark.y * canvas.height
              
              ctx.beginPath()
              ctx.arc(x, y, COLORS.pointRadius, 0, 2 * Math.PI)
              ctx.fill()
              
              // 添加发光效果
              ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
              ctx.lineWidth = 2
              ctx.stroke()
            }
          })
        })
      }
      
      animationId = requestAnimationFrame(drawHands)
    }
    
    drawHands()
    
    // 清理函数
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [handLandmarks, videoRef])
  
  // {{ AURA-X: Add - Canvas尺寸自适应 }}
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video) return
    
    const updateCanvasSize = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
    }
    
    video.addEventListener('loadedmetadata', updateCanvasSize)
    updateCanvasSize()
    
    return () => {
      video.removeEventListener('loadedmetadata', updateCanvasSize)
    }
  }, [videoRef])
  
  return (
    <div className="video-preview-container">
      <div className="video-canvas-wrapper">
        <video
          ref={videoRef}
          className="video-preview"
          autoPlay
          playsInline
          muted
        />
        {/* {{ AURA-X: Add - Canvas叠加层用于绘制手部骨架 }} */}
        <canvas
          ref={canvasRef}
          className="hand-overlay-canvas"
        />
      </div>
      {/* 手势检测状态指示器 */}
      <div className={`gesture-indicator ${isActive ? 'active' : ''} ${isFacingCamera ? 'facing' : ''} ${isHeartGesture ? 'heart-gesture' : ''}`}>
        <div className="gesture-icon">
          {isHeartGesture ? '💕' : (isFacingCamera ? '✋' : (isActive ? '🖐️' : '👋'))}
        </div>
        <div className="gesture-strength">
          {isHeartGesture ? '💖 我爱你韩妮妮' : (isFacingCamera ? '正面 - 已复位' : `强度: ${strengthPercent}%`)}
        </div>
        <div className="gesture-bar">
          <div 
            className="gesture-bar-fill" 
            style={{ width: `${isHeartGesture ? 100 : strengthPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoPreview

