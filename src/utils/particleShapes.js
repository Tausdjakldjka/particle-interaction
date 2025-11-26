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
    // {{ AURA-X: Modify - 使用超饱满圆润的3D心形算法，粒子铺满整个体积 }}
    // 心形 - 采用体积填充而非表面分布
    const u = Math.random() * Math.PI * 2  // 水平角度
    const v = Math.random() * Math.PI      // 垂直角度
    const rH = Math.pow(Math.random(), 0.3)  // 径向分布
    
    // 基础心形轮廓（极坐标方程）
    const t = u
    let baseX = 16 * Math.pow(Math.sin(t), 3)
    let baseY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    
    // 计算到中心的归一化距离
    const baseR = Math.sqrt(baseX * baseX + baseY * baseY)
    const normalizedR = baseR / 20
    
    // 3D体积厚度：使用球形插值创建饱满的体积
    // 使用更平缓的衰减函数，让整个体积都充满粒子
    const depthRadius = Math.sqrt(Math.max(0, 1 - Math.pow(normalizedR, 1.2))) * 1.5
    
    // 在深度方向上均匀分布（球形坐标）
    const theta = Math.acos(2 * Math.random() - 1)  // 均匀球面分布
    const phi = Math.random() * Math.PI * 2
    
    // 计算3D位置
    let x = baseX * rH
    let y = baseY * rH
    let z = depthRadius * rH * Math.sin(theta) * Math.cos(phi) * 10
    
    // 让心形更圆润：对尖角部分进行平滑处理
    const smoothFactor = Math.max(0, 1 - Math.abs(baseY) / 25)
    x *= (1 + smoothFactor * 0.2)
    y *= (1 + smoothFactor * 0.15)
    
    // 缩放到合适大小：更大更饱满
    x *= 0.22
    y *= 0.22
    z *= 0.18
    
    // 整体向上偏移并微微向前
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

