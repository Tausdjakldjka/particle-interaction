import { useRef } from 'react'
import './LoadingOverlay.css'

/**
 * 加载/手动上传模型的遮罩层组件
 * {{ AURA-X: Modify - 增加摄像头错误提示和重试功能 }}
 */
function LoadingOverlay({ showManualPanel, statusText, errorMessage, onFileSelect, onRetry }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="overlay">
      {/* 加载面板 */}
      {!showManualPanel && !errorMessage && (
        <div className="panel loading-panel">
          <div className="spinner">🔮</div>
          <div className="status-text">{statusText}</div>
        </div>
      )}

      {/* 摄像头错误提示 */}
      {!showManualPanel && errorMessage && errorMessage.includes('摄像头') && (
        <div className="panel manual-panel">
          <h2>📷 摄像头访问失败</h2>
          <p style={{ color: '#ff6b6b', marginBottom: '20px' }}>
            {errorMessage}
          </p>

          <div className="instruction-box">
            <div className="instruction-label">解决方案：</div>
            <ul style={{ 
              textAlign: 'left', 
              fontSize: '14px', 
              color: '#ccc', 
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>确保您的设备有摄像头（或已连接外接摄像头）</li>
              <li>点击浏览器地址栏左侧的<strong>锁图标</strong>，允许访问摄像头</li>
              <li>关闭其他正在使用摄像头的应用（如视频会议软件）</li>
              <li>刷新页面后重新授权</li>
            </ul>
            <button
              className="btn btn-upload"
              onClick={onRetry}
              style={{ marginTop: '20px' }}
            >
              🔄 重新尝试
            </button>
          </div>
        </div>
      )}

      {/* 手动上传面板 */}
      {showManualPanel && (
        <div className="panel manual-panel">
          <h2>⚠️ 模型加载失败</h2>
          <p>
            AI 模型文件无法正常加载。<br />
            {errorMessage && <span style={{ color: '#ff6b6b' }}>{errorMessage}</span>}
          </p>

          <div className="instruction-box">
            <div className="instruction-label">
              解决方案：手动上传模型文件
            </div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              如果您还没有模型文件，请先
              <a
                href="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ffff', textDecoration: 'underline', margin: '0 5px' }}
              >
                点击此处下载
              </a>
              (约9MB)
            </p>
            <div className="file-upload-wrapper">
              <button
                className="btn btn-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                📂 选择 hand_landmarker.task 文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".task"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingOverlay
