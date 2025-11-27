import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui'
import { initParticleShapes } from '../utils/particleShapes'
import './ParticleScene.css'

/**
 * Three.js粒子场景组件
 * {{ AURA-X: Create - 将Three.js渲染逻辑封装为React组件 }}
 */
function ParticleScene({ interactionStrength, handRotation, handDistance, isFacingCamera, isHeartGesture }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const particlesRef = useRef(null)
  const shapesRef = useRef(null)
  const guiRef = useRef(null)
  // {{ AURA-X: Add - 使用 ref 存储最新的手势数据，避免闭包问题 }}
  const interactionStrengthRef = useRef(0)
  const handRotationRef = useRef({ x: 0, y: 0, z: 0 })
  const handDistanceRef = useRef(0.5)
  // {{ AURA-X: Modify - 增强移动端性能优化和自适应 }}
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768
  const isLowEnd = isMobile && (window.devicePixelRatio < 2 || navigator.hardwareConcurrency < 4)
  
  // 根据设备类型和性能动态调整粒子数量
  const getParticleCount = () => {
    if (isLowEnd) return 8000        // 低端设备：8k粒子
    if (isMobile && !isTablet) return 12000  // 手机：12k粒子
    if (isTablet) return 18000       // 平板：18k粒子
    return 30000                     // 桌面：30k粒子
  }
  
  const configRef = useRef({
    particleCount: getParticleCount(),
    particleSize: isMobile ? 0.06 : 0.04,    // 移动端粒子更大，更易见
    color: '#ff0066',      // 改为红色（浪漫的玫瑰红）
    shape: 'Heart',
    autoRotate: false,  // 改为false，使用手势控制
    rotationSensitivity: 0.01,
    distanceSensitivity: 2.0,  // {{ AURA-X: Modify - 降低灵敏度，减少距离变化幅度 }}
    minDistance: 4,     // {{ AURA-X: Modify - 最近距离（原来6，现在更近）}}
    maxDistance: 8,     // {{ AURA-X: Modify - 最远距离（原来12，现在更近）}}
    breathingSpeed: 1.5,   // 呼吸频率（每秒周期数）
    breathingIntensity: 0.15  // 呼吸强度（缩放幅度）
  })

  // 初始化Three.js场景
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const config = configRef.current

    // 创建场景
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.02)
    sceneRef.current = scene

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    // {{ AURA-X: Modify - 调整初始相机位置，更近更清晰 }}
    camera.position.z = 6  // 原来8，现在6，更近
    camera.position.y = 1  // 原来2，现在1，视角更平
    cameraRef.current = camera

    // {{ AURA-X: Modify - 移动端渲染器优化 }}
    // 创建渲染器（移动端关闭抗锯齿以提升性能）
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,  // 移动端关闭抗锯齿
      alpha: true,
      powerPreference: isMobile ? 'low-power' : 'high-performance'  // 移动端省电模式
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    // 限制像素比：低端1x，移动端1.5x，桌面2x
    const pixelRatio = isLowEnd ? 1 : (isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2))
    renderer.setPixelRatio(pixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = false  // 关闭自动旋转
    controlsRef.current = controls

    // 初始化粒子形状
    shapesRef.current = initParticleShapes(config.particleCount)

    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(shapesRef.current.Heart)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      color: config.color,
      size: config.particleSize,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    // 创建粒子系统
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    particlesRef.current = particles

    // {{ AURA-X: Modify - 移动端优化：默认关闭GUI }}
    // 创建GUI控制面板（移动端默认关闭）
    const gui = new GUI({ 
      title: '🎮 交互控制',
      closeFolders: isMobile,  // 移动端默认折叠所有文件夹
      width: isMobile ? 280 : 320  // 移动端缩小宽度
    })
    if (isMobile) {
      gui.close()  // 移动端默认关闭GUI
    }
    guiRef.current = gui
    
    gui.add(config, 'shape', Object.keys(shapesRef.current)).name('🎨 切换模型')
    gui.addColor(config, 'color').name('🎨 颜色').onChange(value => {
      material.color.set(value)
    })
    
    // {{ AURA-X: Modify - 添加手势控制灵敏度和距离范围调节 }}
    const gestureFolder = gui.addFolder('🖐️ 手势控制')
    gestureFolder.add(config, 'rotationSensitivity', 0.001, 0.05).name('旋转灵敏度')
    gestureFolder.add(config, 'distanceSensitivity', 1, 5).name('距离灵敏度')
    gestureFolder.add(config, 'minDistance', 4, 8).name('最近距离')
    gestureFolder.add(config, 'maxDistance', 8, 15).name('最远距离')
    gestureFolder.add(config, 'breathingSpeed', 0.5, 3).name('💓 呼吸频率')
    gestureFolder.add(config, 'breathingIntensity', 0, 0.3).name('💓 呼吸强度')
    gestureFolder.add(config, 'autoRotate').name('自动旋转').onChange(value => {
      controls.autoRotate = value
    })
    
    // 添加手势数据显示（只读）
    const gestureData = { 
      strength: 0, 
      rotationX: 0,
      rotationY: 0,
      distance: 0
    }
    gestureFolder.add(gestureData, 'strength', 0, 1).name('✋ 开合度').listen().disable()
    gestureFolder.add(gestureData, 'rotationX', -180, 180).name('🔄 俯仰角').listen().disable()
    gestureFolder.add(gestureData, 'rotationY', -180, 180).name('🔄 偏航角').listen().disable()
    gestureFolder.add(gestureData, 'distance', 0, 1).name('📏 距离').listen().disable()
    gestureFolder.close()
    
    // 添加使用说明
    const instructions = gui.addFolder('📖 使用说明')
    instructions.add({ tip: '张开/握紧 → 粒子扩散/收缩' }, 'tip').name('💡')
    instructions.add({ tip: '翻转手掌 → 模型旋转' }, 'tip').name('💡')
    instructions.add({ tip: '手掌远近 → 相机远近' }, 'tip').name('💡')
    instructions.close()

    // 动画循环
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      controls.update()

      // {{ AURA-X: Modify - 增强手势控制：开合度、旋转、距离 }}
      // {{ AURA-X: Modify - 比心手势时切换到爱的文字 }}
      // 更新粒子位置
      const pos = particles.geometry.attributes.position.array
      // 比心手势时切换到"我爱你韩妮妮"文字，否则保持当前形状
      const currentShape = isHeartGesture ? 'LoveText' : config.shape
      const target = shapesRef.current[currentShape]
      
      // {{ AURA-X: Modify - 增强调试信息，比心时立即输出 }}
      // 比心手势状态变化时立即输出
      if (isHeartGesture && Math.random() < 0.02) {
        console.log('🎨💕 ParticleScene收到比心！当前形状:', currentShape, '| isHeartGesture:', isHeartGesture, '| lerpSpeed:', lerpSpeed.toFixed(2))
      }
      const currentStrength = interactionStrengthRef.current
      const currentRotation = handRotationRef.current
      const currentDistance = handDistanceRef.current
      
      // {{ AURA-X: Modify - 比心手势时固定最佳展示scale，文字完整清晰 }}
      // 呼吸效果：使用正弦波创造律动感
      const breathingPhase = Math.sin(Date.now() * 0.001 * config.breathingSpeed * Math.PI * 2)
      const breathingScale = 1 + breathingPhase * config.breathingIntensity  // 0.85 → 1.15
      
      // 动态缩放：比心时固定为3.0（最佳展示大小），其他时候根据手势开合
      const baseScale = isHeartGesture ? 3.0 : (0.05 + currentStrength * 3.95)  // 比心时固定大小
      const scale = baseScale * breathingScale  // 加上呼吸律动
      
      // 动态抖动：比心时无抖动（保持文字清晰），其他时候根据强度
      const jitter = isHeartGesture ? 0 : (currentStrength * 0.2)  // 比心时无抖动
      
      // {{ AURA-X: Modify - 比心手势时超快速切换，实现丝滑效果 }}
      // 动态速度：比心手势时立即加速到0.3（3倍速），实现秒切换
      const lerpSpeed = isHeartGesture ? 0.3 : (0.08 + currentStrength * 0.12)  // 比心时超快切换

      for (let i = 0; i < config.particleCount; i++) {
        const idx = i * 3
        
        // 添加波动效果：不同粒子有不同的响应幅度
        const particlePhase = (i / config.particleCount) * Math.PI * 2
        const waveInfluence = Math.sin(particlePhase + Date.now() * 0.001) * 0.1
        const particleScale = scale + waveInfluence * currentStrength
        
        const tx = target[idx] * particleScale + (Math.random() - 0.5) * jitter
        const ty = target[idx + 1] * particleScale + (Math.random() - 0.5) * jitter
        const tz = target[idx + 2] * particleScale + (Math.random() - 0.5) * jitter

        pos[idx] += (tx - pos[idx]) * lerpSpeed
        pos[idx + 1] += (ty - pos[idx + 1]) * lerpSpeed
        pos[idx + 2] += (tz - pos[idx + 2]) * lerpSpeed
      }
      
      particles.geometry.attributes.position.needsUpdate = true

      // {{ AURA-X: Modify - 只在Y轴旋转，X和Z轴保持固定 }}
      // 只使用Y轴（左右旋转），正面时快速复位
      const resetSpeed = isFacingCamera ? 0.3 : 0.1
      const sens = config.rotationSensitivity
      
      // Y轴旋转（左右转动）
      particles.rotation.y += (currentRotation.y * sens - particles.rotation.y) * resetSpeed
      
      // X轴和Z轴保持在初始位置（不旋转）
      particles.rotation.x += (0 - particles.rotation.x) * 0.1
      particles.rotation.z += (0 - particles.rotation.z) * 0.1
      
      // {{ AURA-X: Modify - 根据手掌距离控制相机远近，限制范围确保可见 }}
      const rawTargetZ = config.minDistance + currentDistance * config.distanceSensitivity
      const targetZ = Math.max(config.minDistance, Math.min(config.maxDistance, rawTargetZ))
      camera.position.z += (targetZ - camera.position.z) * 0.1
      
      // {{ AURA-X: Modify - 比心手势时强化视觉效果：更亮、更大、更浪漫 }}
      // 材质透明度和大小优化
      if (particles.material) {
        // 比心时固定为最亮（0.95），其他时候根据强度
        const baseOpacity = isHeartGesture ? 0.95 : (0.4 + currentStrength * 0.5)  // 比心时最亮
        const breathingOpacity = breathingPhase * 0.1  // ±0.1
        particles.material.opacity = baseOpacity + breathingOpacity
        
        // 比心时粒子变大（1.8倍），更清晰显示文字
        const baseSize = isHeartGesture ? (config.particleSize * 1.8) : (config.particleSize * (0.5 + currentStrength * 1.0))
        const breathingSize = baseSize * (1 + breathingPhase * 0.05)  // ±5%
        particles.material.size = breathingSize
        
        // {{ AURA-X: Add - 比心时颜色变为浪漫粉红色 }}
        if (isHeartGesture) {
          particles.material.color.setHex(0xff69b4)  // 浪漫粉红色 (HotPink)
        } else {
          particles.material.color.set(config.color)  // 恢复原始颜色
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // {{ AURA-X: Modify - 优化窗口大小调整，添加防抖和移动端横竖屏处理 }}
    // 窗口大小调整处理（防抖优化）
    let resizeTimeout
    const handleResize = () => {
      // 移动端横竖屏切换可能需要延迟处理
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (!container.clientWidth || !container.clientHeight) return
        
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
        
        // 移动端横竖屏切换时，重新调整像素比
        if (isMobile) {
          const newPixelRatio = isLowEnd ? 1 : Math.min(window.devicePixelRatio, 1.5)
          renderer.setPixelRatio(newPixelRatio)
        }
      }, isMobile ? 100 : 50)  // 移动端稍长的防抖时间
    }
    window.addEventListener('resize', handleResize)
    
    // 移动端orientation change事件
    if (isMobile) {
      window.addEventListener('orientationchange', handleResize)
    }

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      if (isMobile) {
        window.removeEventListener('orientationchange', handleResize)
      }
      clearTimeout(resizeTimeout)
      cancelAnimationFrame(animationId)
      
      if (gui) gui.destroy()
      if (renderer) {
        container.removeChild(renderer.domElement)
        renderer.dispose()
      }
      if (geometry) geometry.dispose()
      if (material) material.dispose()
    }
  }, [])

  // {{ AURA-X: Modify - 同步更新所有手势数据到 ref 和 GUI }}
  useEffect(() => {
    // 更新 ref 为最新值
    interactionStrengthRef.current = interactionStrength
    handRotationRef.current = handRotation || { x: 0, y: 0, z: 0 }
    handDistanceRef.current = handDistance || 0.5
    
    if (guiRef.current) {
      // 更新所有手势数据的显示
      guiRef.current.controllers.forEach(controller => {
        if (controller.property === 'strength') {
          controller.object.strength = interactionStrength
          controller.updateDisplay()
        } else if (controller.property === 'rotationX') {
          controller.object.rotationX = handRotation?.x || 0
          controller.updateDisplay()
        } else if (controller.property === 'rotationY') {
          controller.object.rotationY = handRotation?.y || 0
          controller.updateDisplay()
        } else if (controller.property === 'distance') {
          controller.object.distance = handDistance || 0.5
          controller.updateDisplay()
        }
      })
    }
  }, [interactionStrength, handRotation, handDistance])

  return <div ref={containerRef} className="particle-scene" />
}

export default ParticleScene

