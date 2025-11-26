import './VideoPreview.css'

/**
 * 摄像头视频预览组件
 * {{ AURA-X: Create - 独立的视频预览UI组件 }}
 */
function VideoPreview({ videoRef }) {
  return (
    <video
      ref={videoRef}
      className="video-preview"
      autoPlay
      playsInline
      muted
    />
  )
}

export default VideoPreview

