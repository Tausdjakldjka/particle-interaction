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
function ParticleScene({ interactionStrength }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const particlesRef = useRef(null)
  const shapesRef = useRef(null)
  const guiRef = useRef(null)
  // {{ AURA-X: Add - 使用 ref 存储最新的 interactionStrength，避免闭包问题 }}
  const interactionStrengthRef = useRef(0)
  const configRef = useRef({
    particleCount: 15000,
    particleSize: 0.05,
    color: '#00ffff',
    shape: 'Heart',
    autoRotate: true
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

    // 创建GUI控制面板
    const gui = new GUI({ title: '交互控制' })
    guiRef.current = gui
    
    gui.add(config, 'shape', Object.keys(shapesRef.current)).name('切换模型')
    gui.addColor(config, 'color').name('颜色').onChange(value => {
      material.color.set(value)
    })
    gui.add(config, 'autoRotate').name('自动旋转').onChange(value => {
      controls.autoRotate = value
    })
    gui.add({ interactionStrength: 0 }, 'interactionStrength', 0, 1)
      .name('张合力度')
      .listen()

    // 动画循环
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      controls.update()

      // {{ AURA-X: Modify - 使用 ref 获取最新的交互强度值 }}
      // 更新粒子位置
      const pos = particles.geometry.attributes.position.array
      const target = shapesRef.current[config.shape]
      const currentStrength = interactionStrengthRef.current
      const scale = 1 + currentStrength * 2.0
      const jitter = currentStrength * 0.1

      for (let i = 0; i < config.particleCount; i++) {
        const idx = i * 3
        const tx = target[idx] * scale + (Math.random() - 0.5) * jitter
        const ty = target[idx + 1] * scale + (Math.random() - 0.5) * jitter
        const tz = target[idx + 2] * scale + (Math.random() - 0.5) * jitter

        pos[idx] += (tx - pos[idx]) * 0.06
        pos[idx + 1] += (ty - pos[idx + 1]) * 0.06
        pos[idx + 2] += (tz - pos[idx + 2]) * 0.06
      }
      
      particles.geometry.attributes.position.needsUpdate = true

      // 强交互时旋转粒子
      if (currentStrength > 0.5) {
        particles.rotation.y += 0.02
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

  // {{ AURA-X: Modify - 同步更新 ref 和 GUI 显示 }}
  // 更新GUI中的交互强度显示
  useEffect(() => {
    // 更新 ref 为最新值
    interactionStrengthRef.current = interactionStrength
    
    if (guiRef.current) {
      const controller = guiRef.current.controllers.find(c => c.property === 'interactionStrength')
      if (controller) {
        controller.object.interactionStrength = interactionStrength
        controller.updateDisplay()
      }
    }
  }, [interactionStrength])

  return <div ref={containerRef} className="particle-scene" />
}

export default ParticleScene

