import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OpenWeatherMapService } from '@/services/api/openWeatherMapService'
import { GeminiService } from '@/services/api/geminiService'
import { useWeather } from '@/hooks/useWeatherCard'

// API key cho Google Gemini
const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'

type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  read?: boolean
  isLoading?: boolean
}

export default function ChatbotScreen() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn',
      isUser: false,
      timestamp: `Chatbot ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    },
    {
      id: '2',
      text: 'Tôi là chatbot thời tiết. Tôi có thể cung cấp thông tin về thời tiết hiện tại, dự báo, và các thông tin khác liên quan đến thời tiết. Bạn cần tìm hiểu thông tin gì?',
      isUser: false,
      timestamp: `Chatbot ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
  ])

  // Sử dụng useWeather hook để lấy dữ liệu thời tiết hiện tại
  const { weatherData, loading: weatherLoading } = useWeather()

  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // Khởi tạo Gemini Service
  const geminiService = useRef(new GeminiService(GEMINI_API_KEY))

  // Tự động cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Hàm phân tích liệu câu hỏi có liên quan đến thành phố cụ thể không
  const extractCityFromQuestion = (text: string): string | null => {
    const lowerText = text.toLowerCase()
    const cityPattern = /(?:ở|tại|của|ở|in)\s+([A-Za-z\s]+)(?:\?|$|,|\s)/i
    const match = text.match(cityPattern)

    if (match && match[1]) {
      return match[1].trim()
    }

    return null
  }

  // Xử lý gửi tin nhắn và lấy phản hồi từ Gemini
  const handleSend = async () => {
    if (message.trim()) {
      // Thêm tin nhắn của người dùng vào danh sách
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: `Bạn ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        read: false
      }

      // Tin nhắn "đang nhập" từ bot
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: `Chatbot ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        isLoading: true
      }

      // Cập nhật UI với tin nhắn người dùng và trạng thái loading
      setMessages((prev) => [...prev, newUserMessage, loadingMessage])
      setMessage('')
      setIsTyping(true)

      try {
        // Gửi tin nhắn tới Gemini API với dữ liệu thời tiết hiện tại
        const response = await geminiService.current.generateResponse(
          message,
          weatherData
        )

        // Thay thế tin nhắn "đang nhập" bằng tin nhắn thực tế
        const botResponse: Message = {
          id: (Date.now() + 2).toString(),
          text: response,
          isUser: false,
          timestamp: `Chatbot ${new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}`
        }

        // Cập nhật UI với phản hồi từ bot
        setMessages((prev) =>
          prev.filter((msg) => !msg.isLoading).concat(botResponse)
        )
      } catch (error) {
        console.error('Error getting response from Gemini:', error)

        // Xử lý lỗi
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          text: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.',
          isUser: false,
          timestamp: `Chatbot ${new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}`
        }

        // Cập nhật UI với tin nhắn lỗi
        setMessages((prev) =>
          prev.filter((msg) => !msg.isLoading).concat(errorMessage)
        )
      } finally {
        setIsTyping(false)
      }
    }
  }

  // Các câu gợi ý để người dùng có thể chọn
  const suggestions = [
    'Thời tiết Hà Nội hôm nay?',
    'Thời tiết ở TP.HCM?',
    'Nên mặc gì hôm nay?',
    'Có mưa không?',
    'Giải thích hiện tượng El Niño?'
  ]

  const handleSuggestionPress = (text: string) => {
    setMessage(text)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botIconContainer}>
            <Ionicons name="cloudy" size={24} color="white" />
          </View>
          <Text style={styles.headerTitle}>Chatbot Thời tiết</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView ref={scrollViewRef} style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.isUser ? styles.userMessageWrapper : styles.botMessageWrapper
            ]}
          >
            <Text style={styles.timestamp}>{msg.timestamp}</Text>
            <View
              style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.botBubble
              ]}
            >
              {msg.isLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    msg.isUser ? styles.userMessageText : styles.botMessageText
                  ]}
                >
                  {msg.text}
                </Text>
              )}
            </View>
            {msg.isUser && msg.read && (
              <Text style={styles.readStatus}>Read</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Suggestions */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập câu hỏi về thời tiết..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!message.trim() || isTyping}
        >
          <Ionicons
            name="send"
            size={24}
            color={message.trim() && !isTyping ? '#0066FF' : '#999'}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerDots: {
    fontSize: 18,
    marginRight: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  headerRight: {
    flexDirection: 'row'
  },
  headerButton: {
    marginLeft: 16
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  botIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  botTextContainer: {
    flex: 1
  },
  botName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  botDescription: {
    fontSize: 14,
    color: '#666'
  },
  messagesContainer: {
    flex: 1,
    padding: 16
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%'
  },
  userMessageWrapper: {
    alignSelf: 'flex-end'
  },
  botMessageWrapper: {
    alignSelf: 'flex-start'
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
    minHeight: 40,
    justifyContent: 'center'
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  userBubble: {
    backgroundColor: '#0066FF'
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  userMessageText: {
    color: '#FFFFFF'
  },
  botMessageText: {
    color: '#333333'
  },
  readStatus: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  suggestionsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  suggestionButton: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4
  },
  suggestionText: {
    color: '#333333',
    fontSize: 13
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333'
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  }
})
