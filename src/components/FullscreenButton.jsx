import './FullscreenButton.css'

/**
 * 全屏按钮组件
 * {{ AURA-X: Create - 独立的全屏控制按钮组件 }}
 */
function FullscreenButton() {
  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <button className="fullscreen-btn" onClick={handleFullscreen}>
      ⛶ 全屏
    </button>
  )
}

export default FullscreenButton

