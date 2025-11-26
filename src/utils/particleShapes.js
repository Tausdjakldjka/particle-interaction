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
    // 心形
    const t = Math.random() * Math.PI * 2
    const rH = Math.pow(Math.random(), 0.3)
    let x = 16 * Math.pow(Math.sin(t), 3)
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    let z = (Math.random() - 0.5) * 4
    x *= 0.15 * rH
    y *= 0.15 * rH
    z *= rH
    shapes.Heart[i * 3] = x
    shapes.Heart[i * 3 + 1] = y
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

