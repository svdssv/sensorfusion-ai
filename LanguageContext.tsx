
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: 'SensorFusion',
    subtitle: 'Device Integration Demo',
    install: 'Install App',
    nav: {
      motion: 'Motion',
      vision: 'Vision',
      audio: 'Audio',
      location: 'Location',
      game: 'Game'
    },
    motion: {
      title: 'Motion Sensor',
      liveFeed: 'Live Feed',
      permissionPrompt: 'To access the accelerometer, we need your permission.',
      startBtn: 'Start Sensors',
      notSupported: 'Device Motion API not supported on this device/browser.',
      mobileHint: 'Try opening this on a smartphone.',
      aiTitle: 'AI Context Analysis',
      analyzeBtn: 'Identify Motion',
      analyzing: 'Analyzing...',
      placeholder: 'Perform a motion (shake, tilt, walk) and ask AI to identify it.'
    },
    vision: {
      title: 'Vision Sensor',
      openCamera: 'Open Camera',
      capture: 'Capture',
      takeAnother: 'Take Another',
      aiTitle: 'Visual Analysis',
      analyzing: 'DeepSeek is analyzing the image...',
      placeholder: 'Capture an image to identify objects, text, or scenery.',
      error: 'Could not access camera. Please ensure permissions are granted.'
    },
    audio: {
      title: 'Audio Sensor',
      startBtn: 'Start Microphone',
      aiTitle: 'Audio Visualizer',
      description: 'Real-time FFT (Fast Fourier Transform) visualization of microphone input frequency data.'
    },
    location: {
      title: 'Location Sensor',
      getBtn: 'Get Location',
      lat: 'Latitude',
      lon: 'Longitude',
      accuracy: 'Accuracy',
      aiTitle: 'Location Context',
      analyzing: 'DeepSeek is retrieving geographical context...',
      placeholder: 'Get location to see context.',
      error: 'Geolocation is not supported by your browser'
    },
    game: {
      title: 'Cyber Core',
      score: 'Score',
      instructions: 'Tilt your device to guide the Energy Core to the green charging zones. Avoid red barriers.',
      startBtn: 'Initialize System',
      retryBtn: 'Reboot System',
      sensorInfo: 'Accelerometer Stream',
      description: 'This game directly maps raw accelerometer X/Y data to physics velocity vectors.'
    },
    footer: 'Built with React, Tailwind & DeepSeek API • Mobile-First Sensor Design'
  },
  zh: {
    appTitle: '传感器融合',
    subtitle: '设备集成演示',
    install: '安装 App',
    nav: {
      motion: '运动感知',
      vision: '机器视觉',
      audio: '音频频谱',
      location: '地理位置',
      game: '重力游戏'
    },
    motion: {
      title: '运动传感器',
      liveFeed: '实时数据流',
      permissionPrompt: '需要您的许可才能访问加速度计。',
      startBtn: '启动传感器',
      notSupported: '此设备/浏览器不支持运动传感器 API。',
      mobileHint: '请在智能手机上打开此页面。',
      aiTitle: 'AI 动作分析',
      analyzeBtn: '识别动作',
      analyzing: '分析中...',
      placeholder: '做出一个动作（摇晃、倾斜、走路），然后让 AI 识别它。'
    },
    vision: {
      title: '视觉传感器',
      openCamera: '打开相机',
      capture: '拍摄分析',
      takeAnother: '再拍一张',
      aiTitle: '视觉分析',
      analyzing: 'DeepSeek 正在分析图像...',
      placeholder: '拍摄图像以识别物体、文本或场景。',
      error: '无法访问相机，请确保已授予权限。'
    },
    audio: {
      title: '音频传感器',
      startBtn: '启动麦克风',
      aiTitle: '音频可视化',
      description: '麦克风输入频率数据的实时 FFT（快速傅里叶变换）可视化。'
    },
    location: {
      title: '位置传感器',
      getBtn: '获取位置',
      lat: '纬度',
      lon: '经度',
      accuracy: '精度',
      aiTitle: '地理背景分析',
      analyzing: 'DeepSeek 正在检索地理背景...',
      placeholder: '获取位置以查看 AI 分析的背景信息。',
      error: '您的浏览器不支持地理定位'
    },
    game: {
      title: '赛博核心',
      score: '得分',
      instructions: '倾斜设备以控制能量核心移动到绿色充电区。避开红色障碍物。',
      startBtn: '初始化系统',
      retryBtn: '重启系统',
      sensorInfo: '加速度计数据流',
      description: '此游戏将加速度计 X/Y 轴的原始数据直接映射为物理速度向量。'
    },
    footer: '基于 React, Tailwind & DeepSeek API 构建 • 移动优先设计'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
