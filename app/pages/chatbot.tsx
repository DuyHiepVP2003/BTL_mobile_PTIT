import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenWeatherMapService } from '@/services/api/openWeatherMapService';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  read?: boolean;
  isLoading?: boolean;
};

// Các câu trả lời về thời tiết
const WEATHER_RESPONSES = {
  GREETING: 'Xin chào! Tôi là chatbot thời tiết. Tôi có thể cung cấp thông tin về thời tiết hiện tại, dự báo, và các thông tin khác liên quan đến thời tiết. Bạn cần tìm hiểu thông tin gì?',
  HELP: 'Tôi có thể giúp bạn:\n• Thời tiết hiện tại (Hà Nội thế nào?)\n• Dự báo thời tiết (Thời tiết ngày mai?)\n• Thông tin về các hiện tượng thời tiết\n• Gợi ý trang phục theo thời tiết\n• Thông báo thời tiết xấu',
  FALLBACK: 'Tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về thời tiết hiện tại, dự báo, hoặc gõ "trợ giúp" để xem các lựa chọn.',
  LOADING: 'Đang tìm thông tin thời tiết cho bạn...',
  ERROR: 'Xin lỗi, tôi không thể lấy thông tin thời tiết lúc này. Vui lòng thử lại sau.',
  WEATHER_ADVICE: {
    HOT: 'Trời nóng, bạn nên mặc quần áo thoáng mát, mang theo nước và tránh ra ngoài vào giờ nắng gắt.',
    COLD: 'Trời lạnh, bạn nên mặc áo ấm, đội mũ và đeo găng tay khi ra ngoài.',
    RAIN: 'Trời đang có mưa, bạn nên mang theo ô hoặc áo mưa khi ra ngoài.',
    STORM: 'Cảnh báo có bão/giông, bạn nên ở trong nhà và tránh đi ra ngoài nếu không cần thiết.'
  }
};

// Các từ khóa để nhận diện câu hỏi
const WEATHER_KEYWORDS = {
  CURRENT: ['thời tiết hiện tại', 'thời tiết hôm nay', 'hiện tại', 'bây giờ', 'hôm nay', 'thế nào'],
  FORECAST: ['dự báo', 'ngày mai', 'tuần này', 'tuần sau', 'dự báo thời tiết'],
  ADVICE: ['nên mặc', 'trang phục', 'quần áo', 'nên mang', 'nên đem', 'nên chuẩn bị'],
  WARNING: ['cảnh báo', 'nguy hiểm', 'bão', 'lụt', 'ngập', 'mưa lớn', 'thiên tai'],
  GREETING: ['xin chào', 'chào', 'hi', 'hello', 'hey', 'alo'],
  HELP: ['trợ giúp', 'giúp đỡ', 'giúp', 'help', 'hướng dẫn', 'bạn có thể làm gì']
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn',
      isUser: false,
      timestamp: `Chatbot ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
    },
    {
      id: '2',
      text: 'Tôi là chatbot thời tiết. Tôi có thể cung cấp thông tin về thời tiết hiện tại, dự báo, và các thông tin khác liên quan đến thời tiết. Bạn cần tìm hiểu thông tin gì?',
      isUser: false,
      timestamp: `Chatbot ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const weatherService = new OpenWeatherMapService();
  const [savedCity, setSavedCity] = useState('Hanoi,vn');

  // Lấy thành phố đã lưu
  useEffect(() => {
    const getCity = async () => {
      const city = await AsyncStorage.getItem('lastCity');
      if (city) setSavedCity(city);
    };
    getCity();
  }, []);

  // Tự động cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Hàm phân tích nội dung tin nhắn để xác định câu hỏi
  const analyzeMessage = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Kiểm tra lời chào
    if (WEATHER_KEYWORDS.GREETING.some(keyword => lowerText.includes(keyword))) {
      return 'GREETING';
    }

    // Kiểm tra yêu cầu trợ giúp
    if (WEATHER_KEYWORDS.HELP.some(keyword => lowerText.includes(keyword))) {
      return 'HELP';
    }

    // Kiểm tra thời tiết hiện tại
    if (WEATHER_KEYWORDS.CURRENT.some(keyword => lowerText.includes(keyword))) {
      // Tìm kiếm thành phố trong câu hỏi
      const cityPattern = /(?:ở|tại|của|ở|in)\s+([A-Za-z\s]+)(?:\?|$|,|\s)/i;
      const match = text.match(cityPattern);
      if (match && match[1]) {
        return `CURRENT:${match[1].trim()}`;
      }
      return 'CURRENT';
    }

    // Kiểm tra dự báo thời tiết
    if (WEATHER_KEYWORDS.FORECAST.some(keyword => lowerText.includes(keyword))) {
      const cityPattern = /(?:ở|tại|của|ở|in)\s+([A-Za-z\s]+)(?:\?|$|,|\s)/i;
      const match = text.match(cityPattern);
      if (match && match[1]) {
        return `FORECAST:${match[1].trim()}`;
      }
      return 'FORECAST';
    }

    // Kiểm tra yêu cầu tư vấn trang phục
    if (WEATHER_KEYWORDS.ADVICE.some(keyword => lowerText.includes(keyword))) {
      return 'ADVICE';
    }

    // Kiểm tra về cảnh báo thời tiết
    if (WEATHER_KEYWORDS.WARNING.some(keyword => lowerText.includes(keyword))) {
      return 'WARNING';
    }

    // Nếu không xác định được ý định
    return 'UNKNOWN';
  };

  // Hàm lấy dữ liệu thời tiết hiện tại
  const getCurrentWeather = async (city: string = savedCity): Promise<string> => {
    try {
      const weatherData = await weatherService.getCurrentWeather(city);
      
      // Format thông tin thời tiết để hiển thị
      const temp = Math.round(weatherData.temperature);
      const condition = weatherService.translateCondition(weatherData.condition);
      const humidity = weatherData.humidity;
      const windSpeed = weatherData.windSpeed;
      
      // Tạo câu trả lời
      let response = `📍 Thời tiết tại ${weatherData.location}, ${weatherData.country}:\n`;
      response += `🌡️ Nhiệt độ: ${temp}°C\n`;
      response += `🌤️ Thời tiết: ${condition}\n`;
      response += `💧 Độ ẩm: ${humidity}%\n`;
      response += `💨 Gió: ${windSpeed} km/h\n`;
      
      // Thêm thông tin về mưa nếu có
      if (weatherData.rain && weatherData.rain > 0) {
        response += `🌧️ Lượng mưa: ${weatherData.rain} mm\n`;
      }
      
      // Thêm lời khuyên về thời tiết
      if (temp > 30) {
        response += `\n${WEATHER_RESPONSES.WEATHER_ADVICE.HOT}`;
      } else if (temp < 15) {
        response += `\n${WEATHER_RESPONSES.WEATHER_ADVICE.COLD}`;
      }
      
      if (weatherData.conditionMain?.toLowerCase().includes('rain')) {
        response += `\n${WEATHER_RESPONSES.WEATHER_ADVICE.RAIN}`;
      }
      
      if (weatherData.conditionMain?.toLowerCase().includes('storm') || 
          weatherData.conditionMain?.toLowerCase().includes('thunder')) {
        response += `\n${WEATHER_RESPONSES.WEATHER_ADVICE.STORM}`;
      }
      
      // Lưu thành phố đã tìm kiếm
      if (city !== savedCity) {
        await AsyncStorage.setItem('lastCity', city);
        setSavedCity(city);
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching weather:", error);
      return WEATHER_RESPONSES.ERROR;
    }
  };

  // Xử lý phản hồi từ chatbot dựa trên tin nhắn người dùng
  const getBotResponse = async (userMessage: string): Promise<string> => {
    const intent = analyzeMessage(userMessage);
    
    switch(intent) {
      case 'GREETING':
        return WEATHER_RESPONSES.GREETING;
        
      case 'HELP':
        return WEATHER_RESPONSES.HELP;
        
      case 'CURRENT':
        return await getCurrentWeather();
        
      case 'FORECAST':
        return "Chức năng dự báo đang được phát triển. Hiện tại tôi chỉ có thể cung cấp thông tin thời tiết hiện tại.";
        
      case 'ADVICE':
        // Lấy thời tiết hiện tại để đưa ra lời khuyên
        try {
          const weatherData = await weatherService.getCurrentWeather(savedCity);
          const temp = weatherData.temperature;
          
          if (temp > 30) {
            return WEATHER_RESPONSES.WEATHER_ADVICE.HOT;
          } else if (temp < 15) {
            return WEATHER_RESPONSES.WEATHER_ADVICE.COLD;
          } else {
            return "Thời tiết khá dễ chịu. Bạn có thể mặc quần áo thông thường.";
          }
        } catch {
          return "Tôi cần biết thời tiết hiện tại để đưa ra lời khuyên về trang phục. Vui lòng hỏi lại sau.";
        }
        
      case 'WARNING':
        return "Hiện tại không có cảnh báo thời tiết nguy hiểm nào trong khu vực của bạn.";
        
      default:
        // Xử lý khi có thông tin thành phố
        if (intent.startsWith('CURRENT:')) {
          const city = intent.split(':')[1];
          return await getCurrentWeather(city);
        }
        
        if (intent.startsWith('FORECAST:')) {
          return "Chức năng dự báo đang được phát triển. Hiện tại tôi chỉ có thể cung cấp thông tin thời tiết hiện tại.";
        }
        
        return WEATHER_RESPONSES.FALLBACK;
    }
  };

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (message.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: `Bạn ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        read: false
      };
      
      // Tin nhắn "đang nhập" từ bot
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: `Chatbot ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        isLoading: true
      };
      
      setMessages(prev => [...prev, newUserMessage, loadingMessage]);
      setMessage('');
      setIsTyping(true);
      
      try {
        // Xử lý phản hồi từ bot
        const botText = await getBotResponse(message);
        
        // Thay thế tin nhắn "đang nhập" bằng tin nhắn thực tế
        const botResponse: Message = {
          id: (Date.now() + 2).toString(),
          text: botText,
          isUser: false,
          timestamp: `Chatbot ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        };
        
        setMessages(prev => 
          prev.filter(msg => !msg.isLoading).concat(botResponse)
        );
      } catch (error) {
        // Xử lý lỗi
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          text: WEATHER_RESPONSES.ERROR,
          isUser: false,
          timestamp: `Chatbot ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        };
        
        setMessages(prev => 
          prev.filter(msg => !msg.isLoading).concat(errorMessage)
        );
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Các câu gợi ý để người dùng có thể chọn
  const suggestions = [
    "Thời tiết Hà Nội hôm nay?",
    "Thời tiết ở TP.HCM?",
    "Nên mặc gì hôm nay?",
    "Có mưa không?",
    "Trợ giúp"
  ];

  const handleSuggestionPress = (text: string) => {
    setMessage(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerDots}>•••</Text>
          <Text style={styles.headerTitle}>Chatbot Thời tiết</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bot Info */}
      <View style={styles.botInfo}>
        <View style={styles.botIconContainer}>
          <Ionicons name="cloudy" size={24} color="white" />
        </View>
        <View style={styles.botTextContainer}>
          <Text style={styles.botName}>Weatherbot</Text>
          <Text style={styles.botDescription}>Hỗ trợ thông tin thời tiết 24/7</Text>
        </View>
      </View>
      
      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageWrapper,
              msg.isUser ? styles.userMessageWrapper : styles.botMessageWrapper
            ]}
          >
            <Text style={styles.timestamp}>{msg.timestamp}</Text>
            <View style={[
              styles.messageBubble, 
              msg.isUser ? styles.userBubble : styles.botBubble
            ]}>
              {msg.isLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text style={[
                  styles.messageText,
                  msg.isUser ? styles.userMessageText : styles.botMessageText
                ]}>
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
          placeholder="Nhập tin nhắn về thời tiết"
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
            color={(message.trim() && !isTyping) ? "#0066FF" : "#999"} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDots: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  botIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botTextContainer: {
    flex: 1,
  },
  botName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  botDescription: {
    fontSize: 14,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  botMessageWrapper: {
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
    minHeight: 40,
    justifyContent: 'center',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userBubble: {
    backgroundColor: '#0066FF',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#333333',
  },
  readStatus: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  suggestionsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  suggestionButton: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  suggestionText: {
    color: '#333333',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});