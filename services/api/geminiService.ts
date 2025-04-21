import { GoogleGenerativeAI } from '@google/generative-ai'

// Khởi tạo API với API key
export class GeminiService {
  private genAI: GoogleGenerativeAI
  private model: any
  private SYSTEM_PROMPT: string = `Bạn là trợ lý chatbot thời tiết thông minh. 
  Bạn chỉ trả lời các câu hỏi liên quan đến thời tiết, khí tượng, các hiện tượng khí hậu và môi trường.
  Nếu người dùng hỏi các câu hỏi không liên quan đến thời tiết, hãy lịch sự từ chối và đề nghị họ hỏi về thời tiết.
  Đảm bảo câu trả lời ngắn gọn, có tính giáo dục và thân thiện.
  Hãy sử dụng tiếng Việt trong các câu trả lời.
  Khi đề cập đến dữ liệu thời tiết, hãy đề cập đến thời tiết ĐƯỢC CUNG CẤP trong tham số nhưng đừng đề cập đến việc dữ liệu được cung cấp.
  Nếu người dùng hỏi về thời tiết ở một địa điểm cụ thể, hãy cung cấp thông tin thời tiết cho địa điểm đó.`

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Sử dụng gemini-1.5-flash hoặc gemini-1.0-pro
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    })
  }

  async generateResponse(
    userMessage: string,
    weatherData?: any
  ): Promise<string> {
    try {
      // Tạo prompt kết hợp giữa system prompt, user message và dữ liệu thời tiết
      let fullPrompt = `${this.SYSTEM_PROMPT}\n\n${userMessage}`

      // Thêm dữ liệu thời tiết vào prompt nếu có
      //   if (weatherData) {
      //     fullPrompt += `\n\nDữ liệu thời tiết hiện tại:\n${JSON.stringify(
      //       weatherData,
      //       null,
      //       2
      //     )}`
      //   }

      // Sử dụng cấu trúc API đơn giản hơn theo mẫu curl
      const result = await this.model.generateContent({
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ]
      })

      const response = result.response.text()
      return response
    } catch (error) {
      console.error('Error generating response from Gemini:', error)
      return 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.'
    }
  }

  // Phương thức thay thế sử dụng chat history
  async generateResponseWithHistory(
    userMessage: string,
    weatherData?: any,
    chatHistory: Array<{ role: string; text: string }> = []
  ): Promise<string> {
    try {
      // Chuẩn bị tin nhắn với dữ liệu thời tiết
      let currentMessage = userMessage
      if (weatherData) {
        currentMessage += `\n\nDữ liệu thời tiết hiện tại:\n${JSON.stringify(
          weatherData,
          null,
          2
        )}`
      }

      // Tạo mảng parts cho API
      const parts = []

      // Thêm system prompt vào đầu
      parts.push({ text: this.SYSTEM_PROMPT + '\n\n' })

      // Thêm lịch sử chat nếu có
      for (const entry of chatHistory) {
        const prefix = entry.role === 'user' ? 'Người dùng: ' : 'Chatbot: '
        parts.push({ text: prefix + entry.text + '\n' })
      }

      // Thêm tin nhắn hiện tại
      parts.push({ text: 'Người dùng: ' + currentMessage })

      // Gọi API với format đơn giản
      const result = await this.model.generateContent({
        contents: [{ parts }]
      })

      return result.response.text()
    } catch (error) {
      console.error('Error generating response from Gemini:', error)
      return 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.'
    }
  }

  // Phương thức đơn giản nhất có thể, tuân theo cách gọi API trong curl example
  async generateSimpleResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })

      return result.response.text()
    } catch (error) {
      console.error('Error in simple Gemini API call:', error)
      return 'Xin lỗi, có lỗi khi gọi API. Vui lòng thử lại sau.'
    }
  }
}
