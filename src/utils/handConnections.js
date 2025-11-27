/**
 * MediaPipe Hand Landmarker 手部关键点连接关系
 * {{ AURA-X: Create - 手部骨架连接定义，用于可视化绘制 }}
 * 
 * 手部共21个关键点（0-20）：
 * 0: 手腕 (WRIST)
 * 1-4: 拇指 (THUMB_CMC, THUMB_MCP, THUMB_IP, THUMB_TIP)
 * 5-8: 食指 (INDEX_FINGER_MCP, INDEX_FINGER_PIP, INDEX_FINGER_DIP, INDEX_FINGER_TIP)
 * 9-12: 中指 (MIDDLE_FINGER_MCP, MIDDLE_FINGER_PIP, MIDDLE_FINGER_DIP, MIDDLE_FINGER_TIP)
 * 13-16: 无名指 (RING_FINGER_MCP, RING_FINGER_PIP, RING_FINGER_DIP, RING_FINGER_TIP)
 * 17-20: 小指 (PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP)
 */

// 手部骨架连接线（每个数组代表一条连线的起点和终点）
export const HAND_CONNECTIONS = [
  // 手掌
  [0, 1],   // 手腕 -> 拇指根部
  [0, 5],   // 手腕 -> 食指根部
  [0, 17],  // 手腕 -> 小指根部
  [5, 9],   // 食指根部 -> 中指根部
  [9, 13],  // 中指根部 -> 无名指根部
  [13, 17], // 无名指根部 -> 小指根部
  
  // 拇指
  [1, 2],   // 拇指关节
  [2, 3],
  [3, 4],
  
  // 食指
  [5, 6],   // 食指关节
  [6, 7],
  [7, 8],
  
  // 中指
  [9, 10],  // 中指关节
  [10, 11],
  [11, 12],
  
  // 无名指
  [13, 14], // 无名指关节
  [14, 15],
  [15, 16],
  
  // 小指
  [17, 18], // 小指关节
  [18, 19],
  [19, 20]
]

// 关键点名称映射（用于调试）
export const LANDMARK_NAMES = [
  'WRIST',
  'THUMB_CMC', 'THUMB_MCP', 'THUMB_IP', 'THUMB_TIP',
  'INDEX_FINGER_MCP', 'INDEX_FINGER_PIP', 'INDEX_FINGER_DIP', 'INDEX_FINGER_TIP',
  'MIDDLE_FINGER_MCP', 'MIDDLE_FINGER_PIP', 'MIDDLE_FINGER_DIP', 'MIDDLE_FINGER_TIP',
  'RING_FINGER_MCP', 'RING_FINGER_PIP', 'RING_FINGER_DIP', 'RING_FINGER_TIP',
  'PINKY_MCP', 'PINKY_PIP', 'PINKY_DIP', 'PINKY_TIP'
]

// 颜色配置
export const COLORS = {
  point: '#00ffff',        // 关键点颜色（青色）
  connection: '#ff0066',   // 连接线颜色（玫瑰红）
  pointRadius: 4,          // 关键点半径
  lineWidth: 2             // 连接线宽度
}

