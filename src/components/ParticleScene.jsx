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
  // {{ AURA-X: Add - 移动端自动降低粒子数量 }}
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isLowEnd = isMobile && (window.devicePixelRatio < 2 || navigator.hardwareConcurrency < 4)
  
  const configRef = useRef({
    particleCount: isLowEnd ? 10000 : (isMobile ? 15000 : 30000),  // 移动端自适应
    particleSize: isMobile ? 0.05 : 0.04,    // 移动端粒子稍大
    color: '#ff0066',      // 改为红色（浪漫的玫瑰红）
    shape: 'Heart',
    autoRotate: false,  // 改为false，使用手势控制
    rotationSensitivity: 0.01,
    distanceSensitivity: 3.0,  // 降低灵敏度（原5.0）
    minDistance: 6,     // 最近距离
    maxDistance: 12,    // 最远距离（确保模型可见）
    breathingSpeed: 1.5,   // {{ AURA-X: Add - 呼吸频率（每秒周期数）}}
    breathingIntensity: 0.15  // {{ AURA-X: Add - 呼吸强度（缩放幅度）}}
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
    camera.position.z = 8
    camera.position.y = 2
    cameraRef.current = camera

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

    // {{ AURA-X: Modify - 增强GUI控制面板，添加使用提示 }}
    // 创建GUI控制面板
    const gui = new GUI({ title: '🎮 交互控制' })
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
      const currentStrength = interactionStrengthRef.current
      const currentRotation = handRotationRef.current
      const currentDistance = handDistanceRef.current
      
      // {{ AURA-X: Modify - 握紧拳头时粒子极度收缩成一团 + 呼吸律动效果 }}
      // 呼吸效果：使用正弦波创造律动感
      const breathingPhase = Math.sin(Date.now() * 0.001 * config.breathingSpeed * Math.PI * 2)
      const breathingScale = 1 + breathingPhase * config.breathingIntensity  // 0.85 → 1.15
      
      // 动态缩放：握拳时缩成一团（0.05倍），张开时扩散（4倍），叠加呼吸效果
      const baseScale = 0.05 + currentStrength * 3.95  // 0.05 → 4.0
      const scale = baseScale * breathingScale  // 加上呼吸律动
      
      // 动态抖动：根据强度添加粒子抖动效果
      const jitter = currentStrength * 0.2  // 提高抖动效果
      
      // 动态速度：强度越高，粒子响应越快
      const lerpSpeed = 0.05 + currentStrength * 0.15  // 提高响应速度

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
      
      // {{ AURA-X: Modify - 增强粒子视觉变化 + 呼吸透明度 }}
      // 材质透明度随强度变化（握紧时更暗，张开时更亮），叠加呼吸效果
      if (particles.material) {
        const baseOpacity = 0.4 + currentStrength * 0.5  // 0.4 → 0.9
        const breathingOpacity = breathingPhase * 0.1  // ±0.1
        particles.material.opacity = baseOpacity + breathingOpacity
        
        const baseSize = config.particleSize * (0.5 + currentStrength * 1.0)  // 0.5x → 1.5x
        const breathingSize = baseSize * (1 + breathingPhase * 0.05)  // ±5%
        particles.material.size = breathingSize
      }

      renderer.render(scene, camera)
    }
    animate()

    // 窗口大小调整处理
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
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

