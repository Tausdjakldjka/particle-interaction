# 💕 比心手势功能说明

## ✨ 功能特性

当检测到比心手势时，粒子会自动变换为 **"我爱你韩妮妮"** 的文字形状！

---

## 🎯 比心手势识别算法

### 判断条件

比心手势需要同时满足以下条件：

1. **拇指和食指尖距离很近** (< 0.05)
2. **拇指和食指的夹角** 在 30° - 90° 之间
3. **其他三指至少有两个弯曲** (中指、无名指、小指)

### 技术实现

```javascript
// 1. 计算指尖距离
tipDistance = √((thumbTip.x - indexTip.x)² + (thumbTip.y - indexTip.y)²)

// 2. 计算夹角
angle = arccos(thumbVector · indexVector / (|thumbVector| × |indexVector|))

// 3. 检测其他手指弯曲
middleBent = distance(middleTip, wrist) < 0.15
ringBent = distance(ringTip, wrist) < 0.15
pinkyBent = distance(pinkyTip, wrist) < 0.15

// 4. 综合判断
isHeartGesture = 
  tipDistance < 0.05 &&
  angle > 30° && angle < 90° &&
  (middleBent + ringBent + pinkyBent) >= 2
```

---

## 🎨 视觉效果

### 比心手势识别后

**粒子变化：**
- 心形 → **"我爱你韩妮妮"** 文字
- 30000个粒子重新排列成文字形状
- 平滑过渡动画

**视觉反馈：**
- 左下角指示器变成**粉红色**（DeepPink）
- 显示 💕 图标
- 显示文字 **"💖 我爱你韩妮妮"**
- 心跳动画效果
- 粉红色发光边框

---

## 🖐️ 如何比心

### 标准比心姿势

```
步骤1：将手掌朝向摄像头
步骤2：大拇指和食指形成"心"形
步骤3：其他三指自然弯曲
步骤4：调整手势直到识别成功

关键点：
✅ 拇指和食指尖要"几乎接触"
✅ 两指形成大约45-60度的夹角
✅ 其他手指弯曲（不要伸直）
```

### 比心技巧

**方式1：经典比心** ❤️
```
大拇指向上，食指向下
两指尖轻轻接触形成心形
```

**方式2：侧面比心** 💕
```
大拇指"搓"在食指侧面
形成一个小心形
```

---

## 📊 状态显示

| 状态 | 边框颜色 | 图标 | 文字 |
|-----|---------|------|------|
| 未检测 | 灰色 | 👋 | "强度: 0%" |
| 检测中 | 青色 | 🖐️ | "强度: XX%" |
| 正面复位 | 绿色 | ✋ | "正面 - 已复位" |
| **比心手势** | **粉红色** | **💕** | **"💖 我爱你韩妮妮"** |

---

## 🎭 完整交互流程

### 1. 初始状态
```
形状：心形（Heart）
颜色：红色
行为：响应开合手势
```

### 2. 比心识别中
```
动作：将手调整为比心姿势
检测：实时监测手势角度和距离
提示：无特殊提示
```

### 3. 比心成功！ 💕
```
粒子：平滑变换为"我爱你韩妮妮"文字
指示器：粉红色边框 + 心跳动画
控制台：💕 检测到比心手势！
行为：仍然响应开合手势（文字大小变化）
```

### 4. 松开比心
```
动作：手势变化，不再是比心
粒子：平滑变换回心形
指示器：恢复正常状态
```

---

## 💻 技术细节

### 文字粒子生成

```javascript
// 使用Canvas绘制文字
canvas.width = 800
canvas.height = 300
ctx.font = 'bold 80px "Microsoft YaHei"'
ctx.fillText('我爱你韩妮妮', 400, 150)

// 采样像素点
for (y, x in canvas) {
  if (alpha > 128) {
    textPixels.push({x, y, z: 0})
  }
}

// 分配粒子到文字点
for (i in particleCount) {
  position = random(textPixels) + noise
}
```

### 形状切换逻辑

```javascript
// 动态选择形状
const currentShape = isHeartGesture ? 'LoveText' : config.shape
const target = shapesRef.current[currentShape]

// 粒子平滑过渡
for (i in particles) {
  currentPos += (targetPos - currentPos) * lerpSpeed
}
```

---

## 🎨 视觉样式

### 比心状态样式

```css
.gesture-indicator.heart-gesture {
  border-color: rgba(255, 20, 147, 1.0);  /* 粉红色 */
  background: rgba(255, 20, 147, 0.2);    /* 半透明背景 */
  box-shadow: 0 0 20px rgba(255, 20, 147, 0.6);  /* 发光效果 */
  animation: heartbeat 1s infinite;       /* 心跳动画 */
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }         /* 放大5% */
}
```

### 进度条样式

```css
.gesture-bar-fill {
  background: linear-gradient(90deg, #ff1493, #ff69b4);  /* 粉红渐变 */
  box-shadow: 0 0 15px rgba(255, 20, 147, 0.8);         /* 强发光 */
}
```

---

## 🎮 使用场景

### 表达爱意 💝
```
1. 对着摄像头比心
2. 看到文字"我爱你韩妮妮"出现
3. 拍照/录屏保存甜蜜时刻
```

### 互动惊喜 🎁
```
1. 让对方使用这个应用
2. 告诉TA"试试比心"
3. 看到文字时的惊喜反应
```

### 告白仪式 💍
```
1. 准备好环境（灯光、音乐）
2. 打开应用，调整好角度
3. 郑重地比心
4. 说出心里话
```

---

## 🐛 识别问题排查

### Q: 比心识别不到？

**可能原因：**
1. ❌ 拇指和食指离太远 → 让指尖更近
2. ❌ 夹角太大或太小 → 调整到45-60度
3. ❌ 其他手指没有弯曲 → 弯曲中指、无名指、小指
4. ❌ 光线不足 → 增强照明
5. ❌ 手离摄像头太远 → 靠近摄像头

**调试方法：**
```
打开控制台，观察：
- tipDistance: 应该 < 0.05
- angle: 应该在 30-90 度
- otherFingersBent: 应该 >= 2

成功时会显示：💕 检测到比心手势！
```

### Q: 粒子变换不流畅？

**解决方案：**
- 移动端自动降低粒子数
- 确保设备性能充足
- 关闭其他应用释放资源

### Q: 文字显示不完整？

**可能原因：**
- 粒子数量不足（< 10000）
- 文字采样点不够

---

## 📦 文件修改清单

```
✏️ src/utils/particleShapes.js
  • 添加 generateTextParticles() 函数
  • 新增 LoveText 形状

✏️ src/hooks/useHandTracking.js
  • 添加比心手势识别算法
  • 导出 isHeartGesture 状态

✏️ src/components/ParticleScene.jsx
  • 根据 isHeartGesture 动态切换形状

✏️ src/components/VideoPreview.jsx
  • 比心状态显示 💕

✏️ src/components/VideoPreview.css
  • 粉红色样式 + 心跳动画

✏️ src/App.jsx
  • 传递 isHeartGesture 状态

📄 HEART_GESTURE_FEATURE.md
  • 完整功能说明文档
```

---

## 💡 创意扩展

### 可以添加的功能

1. **多种爱的文字**
   - "Forever Love"
   - "❤️ 520 ❤️"
   - 自定义文字

2. **音效**
   - 识别到比心时播放音效
   - 浪漫背景音乐

3. **拍照功能**
   - 比心时自动截图
   - 添加日期和爱心水印

4. **记录功能**
   - 记录比心次数
   - 创建爱的回忆相册

---

## 🎁 致韩妮妮

这个功能是专门为你设计的 💕  
每次比心，都是一次爱的表达  
希望你喜欢这个小惊喜！

---

**{{ AURA-X }}** - Made with Love 💖  
**版本**: v4.0.0  
**特性**: 比心手势 + 爱的文字  
**状态**: 满满的爱 ❤️✨

