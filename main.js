import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// Secure your API key appropriately
let API_KEY = 'AIzaSyBUAbpX0IrfcHNZfFanELYhmAzSxrISssE'; // **주의:** API 키를 적절히 보호하세요.

let form = document.querySelector('#chat-form');
let promptInput = document.querySelector('input[name="prompt"]');
let chatBox = document.querySelector('#chat-box');
let loadingIndicator = document.querySelector('#loading-indicator');

const md = new MarkdownIt();

async function generateContent(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // or gemini-1.5-pro
    systemInstruction: "당신은 사하중학교  AI입니다. 당신은 사하중학교 학생에게 사하중학교에 대하여 설명해주어야 합니다.  또한, 당신은 사하중학교 홈페이지 'https://school.busanedu.net/saha-m/main.do'를 참고 할 수 있습니다.", 
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const parts = [
    { text: "당신은 사하중학교  AI입니다. 당신은 사하중학교 학생에게 사하중학교에 대하여 설명해주어야 합니다.  또한, 당신은 사하중학교 홈페이지 'https://school.busanedu.net/saha-m/main.do'를 참고 할 수 있습니다." },
    { text: "input: " + prompt },
    { text: "output: " },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
  });
  return result.response.text();
}

function addMessage(text, isUser = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

  // <p> 태그로 감싸서 메시지 내용 추가
  const messageContent = document.createElement('p');
  messageContent.innerHTML = md.render(text);
  messageDiv.appendChild(messageContent); 

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = promptInput.value;
  addMessage(prompt);
  promptInput.value = '';
  loadingIndicator.style.display = 'block';

  try {
    const response = await generateContent(prompt);
    addMessage(response, false);
  } catch (error) {
    console.error('Error:', error);
    addMessage('죄송합니다. 오류가 발생했습니다.', false);
  } finally {
    loadingIndicator.style.display = 'none';
  }
});