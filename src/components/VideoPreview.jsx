import './VideoPreview.css'

/**
 * 摄像头视频预览组件
 * {{ AURA-X: Modify - 添加手势强度视觉反馈指示器 }}
 */
function VideoPreview({ videoRef, interactionStrength = 0 }) {
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
      <div className={`gesture-indicator ${isActive ? 'active' : ''}`}>
        <div className="gesture-icon">{isActive ? '🖐️' : '👋'}</div>
        <div className="gesture-strength">
          强度: {strengthPercent}%
        </div>
        <div className="gesture-bar">
          <div 
            className="gesture-bar-fill" 
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoPreview

