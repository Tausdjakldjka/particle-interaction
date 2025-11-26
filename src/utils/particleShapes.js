/*
 * @Author: guoyawei
 * @LastEditors: guoyawei
 * @Email: guoyawei@supcon.com
 * @Date: 2025-11-26 13:27:32
 * @LastEditTime: 2025-11-26 15:22:17
 */
/**
 * 粒子形状生成工具
 * {{ AURA-X: Create - 提取粒子形状计算逻辑为独立工具模块 }}
 */

/**
 * 初始化所有粒子形状
 * @param {number} count - 粒子数量
 * @returns {Object} 包含所有形状的对象
 */
export function initParticleShapes(count) {
  const shapes = {
    Heart: new Float32Array(count * 3),
    Sphere: new Float32Array(count * 3),
    Flower: new Float32Array(count * 3),
    Knot: new Float32Array(count * 3),
    Fireworks: new Float32Array(count * 3)
  }

  for (let i = 0; i < count; i++) {
    // {{ AURA-X: Modify - 实心3D心形，粒子完全填充整个体积 }}
    // 心形 - 真正的体积填充，中心不留空洞
    
    // 1. 生成心形轮廓上的点（参数化方程）
    const t = Math.random() * Math.PI * 2
    let baseX = 16 * Math.pow(Math.sin(t), 3)
    let baseY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    
    // 2. 径向填充：从中心到边缘均匀分布（立方根确保体积均匀）
    const radialRatio = Math.pow(Math.random(), 1/3)  // 立方根分布 = 体积均匀
    
    // 3. 深度方向的填充半径（基于心形轮廓的距离）
    const baseR = Math.sqrt(baseX * baseX + baseY * baseY)
    const normalizedR = baseR / 20
    
    // 深度半径：中心最厚，边缘渐薄，但不会产生空洞
    // 使用更温和的衰减，确保中心区域密实
    const maxDepth = 10 * Math.sqrt(Math.max(0.1, 1 - Math.pow(normalizedR, 0.8)))
    
    // 4. 在深度方向随机分布（确保填充整个厚度）
    const depthRatio = Math.pow(Math.random(), 1/3)  // 深度方向也用立方根均匀分布
    const zDepth = (Math.random() - 0.5) * 2 * maxDepth * depthRatio
    
    // 5. 应用径向缩放（从中心向外）
    let x = baseX * radialRatio
    let y = baseY * radialRatio
    let z = zDepth
    
    // 6. 平滑尖角，让心形更圆润
    const smoothFactor = Math.max(0, 1 - Math.abs(y) / 25)
    x *= (1 + smoothFactor * 0.2)
    y *= (1 + smoothFactor * 0.15)
    
    // 7. 缩放到合适大小
    x *= 0.22
    y *= 0.22
    z *= 0.2  // 增加Z轴厚度
    
    // 8. 整体偏移到合适位置
    shapes.Heart[i * 3] = x
    shapes.Heart[i * 3 + 1] = y + 0.8
    shapes.Heart[i * 3 + 2] = z

    // 球体 (斐波那契球)
    const phi = Math.acos(-1 + (2 * i) / count)
    const theta = Math.sqrt(count * Math.PI) * phi
    const rS = 3
    shapes.Sphere[i * 3] = rS * Math.cos(theta) * Math.sin(phi)
    shapes.Sphere[i * 3 + 1] = rS * Math.sin(theta) * Math.sin(phi)
    shapes.Sphere[i * 3 + 2] = rS * Math.cos(phi)

    // 花朵
    const tF = Math.random() * Math.PI * 2
    const pF = Math.random() * Math.PI
    const rF = 2 + Math.sin(5 * tF) * Math.sin(5 * pF)
    shapes.Flower[i * 3] = rF * Math.sin(pF) * Math.cos(tF)
    shapes.Flower[i * 3 + 1] = rF * Math.sin(pF) * Math.sin(tF)
    shapes.Flower[i * 3 + 2] = rF * Math.cos(pF)

    // 环结 (Torus Knot)
    const u = Math.random() * Math.PI * 2
    const v = Math.random() * Math.PI * 2
    const p = 3
    const q = 7
    const rK = 2 + Math.cos(q * u / p) * 0.5
    shapes.Knot[i * 3] = rK * Math.cos(u) * (2 + Math.cos(v))
    shapes.Knot[i * 3 + 1] = rK * Math.sin(u) * (2 + Math.cos(v))
    shapes.Knot[i * 3 + 2] = rK * Math.sin(v)

    // 烟花 (随机分布)
    shapes.Fireworks[i * 3] = (Math.random() - 0.5) * 12
    shapes.Fireworks[i * 3 + 1] = (Math.random() - 0.5) * 12
    shapes.Fireworks[i * 3 + 2] = (Math.random() - 0.5) * 12
  }

  return shapes
}

