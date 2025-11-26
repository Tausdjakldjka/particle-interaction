import { useState, useRef, useEffect } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

/**
 * 手势追踪Hook
 * {{ AURA-X: Modify - 增强摄像头权限处理和错误提示 }}
 */
export function useHandTracking() {
  const [interactionStrength, setInteractionStrength] = useState(0)
  const videoRef = useRef(null)
  const handLandmarkerRef = useRef(null)
  const visionContextRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastVideoTimeRef = useRef(-1)

  /**
   * 初始化手势识别
   * @param {string} modelUrl - 可选的本地模型URL
   * @returns {Promise<boolean>} 是否初始化成功
   */
  const initHandTracking = async (modelUrl = null) => {
    try {
      // 1. 初始化WASM运行环境
      if (!visionContextRef.current) {
        console.log('正在加载 WASM 运行环境...')
        visionContextRef.current = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
        )
        console.log('✓ WASM 运行环境加载成功')
      }

      // 2. 确定模型路径
      let finalModelPath = modelUrl
      
      if (!finalModelPath) {
        finalModelPath = "/hand_landmarker.task"
        console.log('尝试加载本地模型:', finalModelPath)
      }

      // 3. 创建HandLandmarker实例（多重降级）
      try {
        console.log('正在创建 HandLandmarker 实例...')
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(
          visionContextRef.current,
          {
            baseOptions: {
              modelAssetPath: finalModelPath,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          }
        )
        console.log('✓ HandLandmarker 创建成功')
      } catch (error) {
        console.warn('本地模型加载失败，尝试备用 CDN...', error)
        
        // 备用：尝试 Google CDN
        finalModelPath = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
        console.log('尝试使用 Google CDN:', finalModelPath)
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(
          visionContextRef.current,
          {
            baseOptions: {
              modelAssetPath: finalModelPath,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          }
        )
        console.log('✓ 备用 CDN 加载成功')
      }

      // 4. 启动摄像头（增强错误处理）
      console.log('正在请求摄像头权限...')
      
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        console.log('✓ 摄像头权限获取成功')
      } catch (cameraError) {
        console.error('摄像头访问失败:', cameraError)
        
        // 提供详细的错误信息
        if (cameraError.name === 'NotFoundError') {
          throw new Error('未检测到摄像头设备。请确保您的设备有摄像头，或者外接摄像头已正确连接。')
        } else if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') {
          throw new Error('摄像头权限被拒绝。请在浏览器设置中允许此网站访问摄像头。')
        } else if (cameraError.name === 'NotReadableError') {
          throw new Error('摄像头被其他应用占用。请关闭其他使用摄像头的程序后重试。')
        } else {
          throw new Error(`摄像头错误: ${cameraError.message}`)
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // 等待视频加载完成后开始检测循环
        return new Promise((resolve) => {
          videoRef.current.addEventListener('loadeddata', () => {
            console.log('✓ 视频流准备就绪，开始手势检测')
            startDetectionLoop()
            resolve(true)
          }, { once: true })
        })
      }

      return true

    } catch (error) {
      console.error('❌ Hand tracking initialization failed:', error)
      // 将错误信息传递给上层
      throw error
    }
  }

  /**
   * 手势检测循环
   */
  const startDetectionLoop = () => {
    const detect = () => {
      const video = videoRef.current
      const landmarker = handLandmarkerRef.current

      if (video && landmarker && video.videoWidth > 0) {
        // 避免重复处理同一帧
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime

          // 执行手势检测
          const result = landmarker.detectForVideo(video, performance.now())

          if (result.landmarks.length > 0) {
            // 计算拇指尖(4)和食指尖(8)的距离
            const hand = result.landmarks[0]
            const thumbTip = hand[4]
            const indexTip = hand[8]
            
            const dist = Math.sqrt(
              Math.pow(thumbTip.x - indexTip.x, 2) + 
              Math.pow(thumbTip.y - indexTip.y, 2)
            )

            // 距离映射到0-1的强度值
            let strength = (dist - 0.03) * 5
            strength = Math.max(0, Math.min(1, strength))

            // 平滑过渡
            setInteractionStrength(prev => prev + (strength - prev) * 0.1)
          } else {
            // 没有检测到手势，逐渐归零
            setInteractionStrength(prev => prev + (0 - prev) * 0.05)
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect)
    }

    detect()
  }

  // 清理资源
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  return {
    videoRef,
    interactionStrength,
    initHandTracking
  }
}
