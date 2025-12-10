
const API_KEY = "sk-bdb6ec0cdddc4874a4cb182092df40a3";
const BASE_URL = "https://api.deepseek.com";

// Helper for DeepSeek API calls
async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("DeepSeek API Request Failed:", error);
    return "";
  }
}

export const analyzeMotionData = async (dataSample: any[], language: 'en' | 'zh'): Promise<string> => {
    const systemPrompt = language === 'zh' ? "你是一个传感器数据分析专家。请用简体中文回答。" : "You are a sensor data expert. Please reply in English.";
    const userPrompt = `
      Analyze this accelerometer/gyroscope data (x,y,z,timestamp) over 2 seconds:
      ${JSON.stringify(dataSample)}
      Briefly describe the likely physical motion (e.g., resting, shaking, tilting). Keep it under 30 words.
    `;
    
    const result = await callDeepSeek(systemPrompt, userPrompt);
    return result || (language === 'zh' ? "无法分析数据。" : "Unable to analyze data.");
};

export const analyzeImage = async (base64Image: string, language: 'en' | 'zh', promptText: string = "Describe what you see in this image in detail."): Promise<string> => {
  // DeepSeek-V3 (deepseek-chat) currently does not support image input.
  return language === 'zh' 
    ? "当前 DeepSeek API 模型暂不支持图像分析功能。" 
    : "The current DeepSeek API model does not support image analysis.";
};

export const analyzeLocationContext = async (lat: number, lon: number, language: 'en' | 'zh'): Promise<string> => {
    const systemPrompt = language === 'zh' ? "你是一个地理学家。请用简体中文回答。" : "You are a geographer. Please reply in English.";
    const userPrompt = `
      I am at Latitude: ${lat}, Longitude: ${lon}.
      Without giving the exact address, describe the general geographical context, climate zone, or interesting facts about this region. 
      Keep it educational and under 50 words.
    `;
    
    const result = await callDeepSeek(systemPrompt, userPrompt);
    return result || (language === 'zh' ? "无法分析位置。" : "Unable to analyze location.");
};
