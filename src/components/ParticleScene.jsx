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
function ParticleScene({ interactionStrength, handRotation, handDistance }) {
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
  const configRef = useRef({
    particleCount: 15000,
    particleSize: 0.05,
    color: '#00ffff',
    shape: 'Heart',
    autoRotate: false,  // 改为false，使用手势控制
    rotationSensitivity: 0.01,
    distanceSensitivity: 5.0
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
    controls.autoRotate = true
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
    
    // {{ AURA-X: Modify - 添加手势控制灵敏度调节 }}
    const gestureFolder = gui.addFolder('🖐️ 手势控制')
    gestureFolder.add(config, 'rotationSensitivity', 0.001, 0.05).name('旋转灵敏度')
    gestureFolder.add(config, 'distanceSensitivity', 1, 10).name('距离灵敏度')
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
      // 更新粒子位置
      const pos = particles.geometry.attributes.position.array
      const target = shapesRef.current[config.shape]
      const currentStrength = interactionStrengthRef.current
      const currentRotation = handRotationRef.current
      const currentDistance = handDistanceRef.current
      
      // 动态缩放：手张开时粒子扩散，握拳时粒子收缩
      const scale = 1 + currentStrength * 3.0
      
      // 动态抖动：根据强度添加粒子抖动效果
      const jitter = currentStrength * 0.15
      
      // 动态速度：强度越高，粒子响应越快
      const lerpSpeed = 0.04 + currentStrength * 0.08

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

      // {{ AURA-X: Add - 根据手掌旋转角度控制粒子系统旋转 }}
      if (!config.autoRotate) {
        const sens = config.rotationSensitivity
        // 将手掌的俯仰、偏航映射到粒子的旋转
        particles.rotation.x += (currentRotation.x * sens - particles.rotation.x) * 0.1
        particles.rotation.y += (currentRotation.y * sens - particles.rotation.y) * 0.1
        particles.rotation.z += (currentRotation.z * sens * 0.5 - particles.rotation.z) * 0.1
      } else {
        // 自动旋转模式
        if (currentStrength > 0.3) {
          particles.rotation.y += 0.01 * currentStrength
          particles.rotation.x += 0.005 * currentStrength
        }
      }
      
      // {{ AURA-X: Add - 根据手掌距离控制相机远近 }}
      const targetZ = 5 + currentDistance * config.distanceSensitivity  // 5-15之间
      camera.position.z += (targetZ - camera.position.z) * 0.1
      
      // 材质透明度随强度变化
      if (particles.material) {
        particles.material.opacity = 0.6 + currentStrength * 0.3
        particles.material.size = config.particleSize * (1 + currentStrength * 0.5)
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

