import './VideoPreview.css'

/**
 * 摄像头视频预览组件
 * {{ AURA-X: Modify - 添加手势强度、正面复位、比心手势状态指示器 }}
 */
function VideoPreview({ videoRef, interactionStrength = 0, isFacingCamera = false, isHeartGesture = false }) {
  const isActive = interactionStrength > 0.1
  const strengthPercent = Math.round(interactionStrength * 100)
  
  return (
    <div className="video-preview-container">
      <video
        ref={videoRef}
        className="video-preview"
        autoPlay
        playsInline
        muted
      />
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

