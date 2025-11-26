import { useState, useEffect, useRef } from "react";
import ParticleScene from "./components/ParticleScene";
import VideoPreview from "./components/VideoPreview";
import LoadingOverlay from "./components/LoadingOverlay";
import FullscreenButton from "./components/FullscreenButton";
import { useHandTracking } from "./hooks/useHandTracking";
import "./App.css";

function App() {
  const [isReady, setIsReady] = useState(false);
  const [showManualPanel, setShowManualPanel] = useState(false);
  const [statusText, setStatusText] = useState("正在初始化 AI 引擎...");
  const [errorMessage, setErrorMessage] = useState("");
  const initStartedRef = useRef(false);

  const { videoRef, interactionStrength, initHandTracking } = useHandTracking();

  // 自动初始化逻辑
  // {{ AURA-X: Modify - 使用 ref 防止重复初始化 }}
  useEffect(() => {
    // 防止重复初始化
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const init = async () => {
      try {
        setStatusText("正在加载 AI 模型...");
        setErrorMessage("");

        console.log("开始初始化 AI 系统...");
        const success = await initHandTracking();

        if (success) {
          console.log("初始化成功，准备进入应用");
          setStatusText("初始化成功！正在启动...");
          setTimeout(() => setIsReady(true), 500);
        }
      } catch (error) {
        console.error("系统初始化错误:", error);

        // 根据错误类型显示不同的提示
        if (error.message.includes("摄像头")) {
          setStatusText("摄像头访问失败");
          setErrorMessage(error.message);
        } else if (error.message.includes("模型")) {
          setStatusText("AI 模型加载失败");
          setErrorMessage(error.message);
          setShowManualPanel(true);
        } else {
          setStatusText("初始化失败");
          setErrorMessage(error.message || "未知错误");
        }
      }
    };
    init();
  }, []); // 空依赖数组，只在挂载时执行一次

  // 手动加载模型保留作为备用
  const handleManualLoad = async (file) => {
    setShowManualPanel(false);
    setStatusText("正在解析本地模型文件...");
    setErrorMessage("");

    try {
      const localUrl = URL.createObjectURL(file);
      const success = await initHandTracking(localUrl);
      if (success) {
        setIsReady(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "文件解析失败");
      setShowManualPanel(true);
    }
  };

  // 重试初始化
  const handleRetry = () => {
    setErrorMessage("");
    setStatusText("正在重新初始化...");
    window.location.reload();
  };

  return (
    <div className="app">
      {!isReady && (
        <LoadingOverlay
          showManualPanel={showManualPanel}
          statusText={statusText}
          errorMessage={errorMessage}
          onFileSelect={handleManualLoad}
          onRetry={handleRetry}
        />
      )}

      {/* {{ AURA-X: Modify - 传递 interactionStrength 给 VideoPreview 以显示检测状态 }} */}
      <VideoPreview videoRef={videoRef} interactionStrength={interactionStrength} />
      <ParticleScene interactionStrength={interactionStrength} />
      <FullscreenButton />
    </div>
  );
}

export default App;
