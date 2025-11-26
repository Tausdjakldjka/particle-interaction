/*
 * @Author: guoyawei
 * @LastEditors: guoyawei
 * @Email: guoyawei@supcon.com
 * @Date: 2025-11-26 13:27:32
 * @LastEditTime: 2025-11-26 15:52:51
 */
import { useState, useRef, useEffect } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

/**
 * 手势追踪Hook
 * {{ AURA-X: Modify - 增强摄像头权限处理和错误提示 }}
 */
export function useHandTracking() {
  const [interactionStrength, setInteractionStrength] = useState(0)
  // {{ AURA-X: Add - 增加手掌旋转角度、距离和正面状态 }}
  const [handRotation, setHandRotation] = useState({ x: 0, y: 0, z: 0 })
  const [handDistance, setHandDistance] = useState(0)
  const [isFacingCamera, setIsFacingCamera] = useState(false)
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
        
        // {{ AURA-X: Modify - 添加超时保护和播放控制，防止视频加载挂起 }}
        // 等待视频加载完成后开始检测循环（带超时保护）
        return new Promise((resolve, reject) => {
          const video = videoRef.current
          
          // 设置30秒超时
          const timeoutId = setTimeout(() => {
            console.error('视频加载超时')
            reject(new Error('视频加载超时，请检查摄像头连接或尝试刷新页面'))
          }, 30000)
          
          const onLoadedData = async () => {
            clearTimeout(timeoutId)
            console.log('✓ 视频元数据加载完成')
            
            try {
              // 显式播放视频流
              await video.play()
              console.log('✓ 视频流开始播放')
              
              // 等待视频真正开始输出帧
              const checkVideoReady = () => {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  console.log(`✓ 视频尺寸确认: ${video.videoWidth}x${video.videoHeight}`)
                  console.log('✓ 视频流准备就绪，开始手势检测')
                  startDetectionLoop()
                  resolve(true)
                } else {
                  console.log('等待视频尺寸信息...')
                  setTimeout(checkVideoReady, 100)
                }
              }
              checkVideoReady()
              
            } catch (playError) {
              console.error('视频播放失败:', playError)
              reject(new Error(`视频播放失败: ${playError.message}`))
            }
          }
          
          const onError = (error) => {
            clearTimeout(timeoutId)
            console.error('视频加载错误:', error)
            reject(new Error('视频加载失败，请检查摄像头状态'))
          }
          
          video.addEventListener('loadeddata', onLoadedData, { once: true })
          video.addEventListener('error', onError, { once: true })
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
   * {{ AURA-X: Modify - 增强调试信息，帮助追踪手势检测状态 }}
   */
  const startDetectionLoop = () => {
    let frameCount = 0
    let lastDebugTime = Date.now()
    
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
            // {{ AURA-X: Modify - 使用手指开合度计算，更灵敏自然 }}
            const hand = result.landmarks[0]
            
            // 关键点索引
            const wrist = hand[0]        // 手腕
            const thumbTip = hand[4]     // 拇指尖
            const indexTip = hand[8]     // 食指尖
            const middleTip = hand[12]   // 中指尖
            const ringTip = hand[16]     // 无名指尖
            const pinkyTip = hand[20]    // 小指尖
            
            // 方法1: 计算所有指尖相对于手腕的平均距离（手掌张开度）
            const fingerTips = [thumbTip, indexTip, middleTip, ringTip, pinkyTip]
            let totalSpread = 0
            
            fingerTips.forEach(tip => {
              const dist = Math.sqrt(
                Math.pow(tip.x - wrist.x, 2) + 
                Math.pow(tip.y - wrist.y, 2) +
                Math.pow(tip.z - wrist.z, 2)
              )
              totalSpread += dist
            })
            
            const avgSpread = totalSpread / 5
            
            // 方法2: 计算指尖之间的最大跨度（手指张开宽度）
            let maxSpan = 0
            for (let i = 0; i < fingerTips.length; i++) {
              for (let j = i + 1; j < fingerTips.length; j++) {
                const span = Math.sqrt(
                  Math.pow(fingerTips[i].x - fingerTips[j].x, 2) + 
                  Math.pow(fingerTips[i].y - fingerTips[j].y, 2)
                )
                maxSpan = Math.max(maxSpan, span)
              }
            }
            
            // 方法3: 计算手指分散度（指尖到手掌中心的方差）
            const centerX = fingerTips.reduce((sum, tip) => sum + tip.x, 0) / 5
            const centerY = fingerTips.reduce((sum, tip) => sum + tip.y, 0) / 5
            
            let dispersion = 0
            fingerTips.forEach(tip => {
              dispersion += Math.sqrt(
                Math.pow(tip.x - centerX, 2) + 
                Math.pow(tip.y - centerY, 2)
              )
            })
            dispersion /= 5
            
            // 综合计算开合强度（加权组合）
            // avgSpread: 0.2-0.4（握拳到张开）
            // maxSpan: 0.1-0.3（手指最大跨度）
            // dispersion: 0.05-0.15（手指分散度）
            const spreadScore = (avgSpread - 0.2) / 0.2    // 归一化到0-1
            const spanScore = (maxSpan - 0.1) / 0.2        // 归一化到0-1
            const dispersionScore = (dispersion - 0.05) / 0.1  // 归一化到0-1
            
            // 加权平均（手掌张开度占主要权重）
            let strength = spreadScore * 0.5 + spanScore * 0.3 + dispersionScore * 0.2
            
            // 限制在0-1范围
            strength = Math.max(0, Math.min(1, strength))
            
            // 增强灵敏度：应用曲线调整
            strength = Math.pow(strength, 0.8)  // 使响应更灵敏

            // {{ AURA-X: Add - 计算手掌旋转角度（基于手掌平面法向量）}}
            // 使用手腕、食指根部、小指根部构建手掌平面
            const indexBase = hand[5]   // 食指根部
            const pinkyBase = hand[17]  // 小指根部
            const middleBase = hand[9]  // 中指根部（辅助点）
            
            // 计算手掌的两个方向向量
            const v1 = {
              x: indexBase.x - wrist.x,
              y: indexBase.y - wrist.y,
              z: indexBase.z - wrist.z
            }
            const v2 = {
              x: pinkyBase.x - wrist.x,
              y: pinkyBase.y - wrist.y,
              z: pinkyBase.z - wrist.z
            }
            
            // 叉积得到手掌法向量
            const normal = {
              x: v1.y * v2.z - v1.z * v2.y,
              y: v1.z * v2.x - v1.x * v2.z,
              z: v1.x * v2.y - v1.y * v2.x
            }
            
            // 归一化法向量
            const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
            if (normalLength > 0) {
              normal.x /= normalLength
              normal.y /= normalLength
              normal.z /= normalLength
            }
            
            // {{ AURA-X: Modify - 修正正反面检测，手掌背面朝向摄像头时为正面（复位） }}
            // 计算欧拉角（相对于初始姿态）
            const rotationX = Math.atan2(normal.y, normal.z) * (180 / Math.PI)  // 俯仰（pitch）
            const rotationY = Math.atan2(-normal.x, Math.sqrt(normal.y * normal.y + normal.z * normal.z)) * (180 / Math.PI)  // 偏航（yaw）
            const rotationZ = Math.atan2(v1.y, v1.x) * (180 / Math.PI)  // 翻滚（roll）
            
            // 检测手掌背面是否朝向摄像头（法向量Z分量接近+1，即手掌心朝向自己）
            // 这样的姿态是"标准正面"，用于复位模型
            const isFacingCamera = normal.z > 0.65  // 手掌背面朝摄像头（降低阈值更容易触发）
            
            // 如果手掌正面，将旋转角度归零（复位）
            const finalRotationX = isFacingCamera ? 0 : rotationX
            const finalRotationY = isFacingCamera ? 0 : rotationY
            const finalRotationZ = isFacingCamera ? 0 : rotationZ
            
            // {{ AURA-X: Modify - 修正距离计算，手掌越大=越近，距离值越小 }}
            // 使用手掌宽度（食指根到小指根）作为深度指标
            const palmWidth = Math.sqrt(
              Math.pow(indexBase.x - pinkyBase.x, 2) + 
              Math.pow(indexBase.y - pinkyBase.y, 2)
            )
            
            // 手掌越大 = 离摄像头越近，距离值 0-1（0=近，1=远）
            // 修正映射关系：palmWidth 0.08-0.25 → distance 1.0-0.0
            const distance = Math.max(0, Math.min(1, (0.25 - palmWidth) / (0.25 - 0.08)))

            // {{ AURA-X: Modify - 正面时也保持开合功能 }}
            // 平滑过渡（正面时也响应手势开合）
            setInteractionStrength(prev => {
              const newValue = prev + (strength - prev) * 0.15
              return newValue
            })
            
            // 平滑过渡旋转角度（正面时快速复位）
            const resetSpeed = isFacingCamera ? 0.3 : 0.2
            setHandRotation(prev => ({
              x: prev.x + (finalRotationX - prev.x) * resetSpeed,
              y: prev.y + (finalRotationY - prev.y) * resetSpeed,
              z: prev.z + (finalRotationZ - prev.z) * resetSpeed
            }))
            
            // {{ AURA-X: Modify - 正面时距离也复位到中间位置 }}
            // 平滑过渡距离（正面时强制为0.5，即中间位置）
            const finalDistance = isFacingCamera ? 0.5 : distance
            setHandDistance(prev => {
              const resetSpeed = isFacingCamera ? 0.3 : 0.15
              return prev + (finalDistance - prev) * resetSpeed
            })
            
            // 更新正面状态
            setIsFacingCamera(isFacingCamera)
            
            // 每3秒输出一次调试信息
            const now = Date.now()
            if (now - lastDebugTime > 3000) {
              const facing = isFacingCamera ? '✋正面' : '🔄侧面'
              console.log(`🖐️ 手势 | 强度: ${strength.toFixed(2)} | ${facing} | 旋转: (${finalRotationX.toFixed(0)}°, ${finalRotationY.toFixed(0)}°, ${finalRotationZ.toFixed(0)}°) | 距离: ${distance.toFixed(2)}`)
              lastDebugTime = now
            }
          } else {
            // {{ AURA-X: Modify - 没有检测到手势时，保持当前状态不动 }}
            // 强度逐渐归零
            setInteractionStrength(prev => prev + (0 - prev) * 0.05)
            
            // 旋转和距离保持当前位置，不要移动
            // （注释掉自动归零，避免检测不到手时模型乱动）
            // setHandRotation(prev => ({
            //   x: prev.x * 0.95,
            //   y: prev.y * 0.95,
            //   z: prev.z * 0.95
            // }))
            // setHandDistance(prev => prev + (0.5 - prev) * 0.05)
            
            setIsFacingCamera(false)
            
            // 每5秒提示一次未检测到手势
            frameCount++
            if (frameCount % 300 === 0) {
              console.log('👋 未检测到手势，请将手放在摄像头前')
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect)
    }

    console.log('🎬 手势检测循环已启动')
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
    handRotation,
    handDistance,
    isFacingCamera,
    initHandTracking
  }
}
