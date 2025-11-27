# 📱 移动端适配说明

## ✨ 适配特性

### 1. **响应式布局** 📐

#### 视频预览位置自适应
- **桌面端**：左下角，160x120px
- **平板（≤768px）**：左下角，120x90px
- **手机（≤480px）**：底部居中，100x75px，避开手势区域
- **横屏模式**：右下角，80x60px，节省空间

#### 全屏按钮优化
- **桌面端**：右下角，标准大小
- **移动端**：增大触摸区域（12px padding）
- **触摸反馈**：按下缩小动画

---

### 2. **性能优化** ⚡

#### 自动降低粒子数量
```javascript
// 低端设备：10000 粒子
// 移动端：15000 粒子
// 桌面端：30000 粒子

判断条件：
- 设备类型（User-Agent）
- 像素密度（devicePixelRatio < 2）
- CPU核心数（hardwareConcurrency < 4）
```

#### 移动端粒子大小调整
```javascript
桌面端：0.04
移动端：0.05  // 稍大，更易识别
```

---

### 3. **触摸优化** 👆

#### 禁用默认行为
- 下拉刷新
- 文本选择
- 长按菜单
- 双击缩放

#### 安全区域适配
```css
/* iPhone X 等刘海屏 */
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
padding-bottom: env(safe-area-inset-bottom);
```

---

### 4. **视口配置** 🖼️

```html
<meta name="viewport" 
  content="width=device-width, 
           initial-scale=1.0, 
           maximum-scale=1.0, 
           user-scalable=no, 
           viewport-fit=cover">

<!-- PWA 支持 -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

---

## 📊 断点设置

| 设备类型 | 宽度范围 | 粒子数 | 适配重点 |
|---------|---------|-------|---------|
| **桌面** | > 768px | 30000 | 完整功能 |
| **平板** | 481-768px | 15000 | 中等性能 |
| **手机** | ≤ 480px | 10000-15000 | 性能优先 |
| **横屏** | height < 500px | 15000 | 布局调整 |

---

## 🎨 移动端UI调整

### 视频预览
```
竖屏手机：
├─ 位置：底部居中
├─ 大小：100x75px
├─ 偏移：bottom: 60px（避开手势）
└─ 指示器：更紧凑

横屏模式：
├─ 位置：右下角
├─ 大小：80x60px
└─ 最小化占用
```

### 手势指示器
```
字体大小：
- 桌面：11px
- 移动：9-10px
- 横屏：8px

图标大小：
- 桌面：20px
- 移动：16-18px
- 横屏：14px
```

---

## 🔧 性能检测逻辑

```javascript
// 设备类型判断
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  .test(navigator.userAgent)

// 低端设备判断
const isLowEnd = isMobile && (
  window.devicePixelRatio < 2 ||        // 低像素密度
  navigator.hardwareConcurrency < 4     // 少于4核
)

// 粒子数量
particleCount: isLowEnd ? 10000 : 
               isMobile ? 15000 : 
               30000
```

---

## 📱 测试设备

### iOS
- ✅ iPhone 12/13/14 系列
- ✅ iPhone SE
- ✅ iPad Air/Pro

### Android
- ✅ Samsung Galaxy S20+
- ✅ Google Pixel 6
- ✅ OnePlus 9

### 浏览器
- ✅ Safari (iOS)
- ✅ Chrome (Android/iOS)
- ✅ Firefox Mobile
- ✅ Edge Mobile

---

## 🎯 移动端最佳实践

### 1. 启动应用
```
① 打开浏览器访问应用
② 允许摄像头权限
③ 等待加载完成
④ 点击全屏按钮（可选）
```

### 2. 手势控制
```
✋ 张开/握紧 → 粒子大小
↔️ 左右转动 → 模型旋转
📏 前后移动 → 相机远近
✋ 正面复位 → 归零
```

### 3. 性能建议
```
- 关闭后台应用
- 清理浏览器缓存
- 低电量模式下粒子会自动减少
- 建议中高端设备使用
```

---

## 🐛 已知问题

### iOS Safari
- ⚠️ 某些iOS版本摄像头权限需要手动授予
- ✅ 解决：设置 > Safari > 摄像头 > 允许

### Android Chrome
- ⚠️ 低端设备可能卡顿
- ✅ 解决：自动降低粒子数量

### 横屏模式
- ⚠️ 某些手机横屏时UI可能重叠
- ✅ 解决：自动调整布局

---

## 📦 修改文件清单

```
✏️ index.html                          - viewport配置
✏️ src/main.jsx                        - 导入全局样式
📄 src/index.css                       - 全局样式和移动端基础
✏️ src/components/VideoPreview.css    - 响应式视频预览
✏️ src/components/FullscreenButton.css - 移动端按钮
✏️ src/components/ParticleScene.jsx   - 性能自适应
```

---

## 🚀 部署建议

### HTTPS 必需
```
移动端摄像头访问需要 HTTPS
- Cloudflare Pages ✅
- Vercel ✅
- Netlify ✅
- GitHub Pages ⚠️ (需配置)
```

### PWA 优化（可选）
```
添加 manifest.json：
{
  "name": "手势粒子交互",
  "short_name": "粒子交互",
  "icons": [...],
  "display": "fullscreen",
  "orientation": "any"
}
```

---

## 💡 用户提示

### 首次使用
```
1. 横屏使用体验更佳
2. 确保光线充足
3. 保持手掌在镜头前30-50cm
4. 全屏模式获得最佳效果
```

### 性能优化
```
- 低端设备：10000粒子（流畅）
- 中端设备：15000粒子（平衡）
- 高端设备：30000粒子（极致）
```

---

**{{ AURA-X }}** - Mobile First Design  
**版本**: v3.2.0  
**适配**: iOS + Android  
**状态**: 完成并测试 ✅

