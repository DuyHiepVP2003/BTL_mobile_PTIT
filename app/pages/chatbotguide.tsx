import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatBotGuideScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

  const guideSteps = [
    {
      id: 1,
      title: 'Bắt đầu cuộc trò chuyện',
      description:
        'Nhấn vào biểu tượng chatbot ở góc màn hình để bắt đầu cuộc trò chuyện mới.',
      icon: 'chatbubbles-outline'
    },
    {
      id: 2,
      title: 'Hỏi về thời tiết',
      description:
        'Bạn có thể hỏi về thời tiết hiện tại hoặc dự báo cho một địa điểm cụ thể.',
      icon: 'partly-sunny-outline',
      examples: [
        'Thời tiết ở Hà Nội hôm nay thế nào?',
        'Ngày mai trời có mưa không?'
      ]
    },
    {
      id: 3,
      title: 'Tìm kiếm địa điểm',
      description:
        'Bạn có thể tìm kiếm thông tin thời tiết cho bất kỳ thành phố nào.',
      icon: 'search-outline',
      examples: ['Thời tiết ở Đà Nẵng', 'Nhiệt độ ở Hồ Chí Minh']
    },
    {
      id: 4,
      title: 'Xem dự báo nhiều ngày',
      description: 'Bạn có thể yêu cầu dự báo thời tiết cho nhiều ngày tới.',
      icon: 'calendar-outline',
      examples: [
        'Dự báo thời tiết 5 ngày tới ở Hà Nội',
        'Thời tiết cuối tuần này thế nào?'
      ]
    },
    {
      id: 5,
      title: 'Thông tin chi tiết',
      description:
        'Bạn có thể hỏi về các thông số cụ thể như độ ẩm, tốc độ gió, chỉ số UV...',
      icon: 'information-circle-outline',
      examples: ['Độ ẩm hiện tại là bao nhiêu?', 'Tốc độ gió ở Hà Nội']
    }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hướng dẫn sử dụng Chatbot</Text>
      </View>

      {/* Introduction */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.introContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={48} color="#4A6FA5" />
          </View>
          <Text style={styles.introTitle}>
            Chào mừng đến với Weather Chatbot!
          </Text>
          <Text style={styles.introText}>
            Chatbot của chúng tôi giúp bạn dễ dàng truy cập thông tin thời tiết
            bằng cách trò chuyện tự nhiên. Dưới đây là một số cách để tận dụng
            tối đa trải nghiệm chatbot.
          </Text>
        </View>

        {/* Guide Steps */}
        {guideSteps.map((step) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Ionicons
                  name={step.icon as IoniconsName}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>

            {step.examples && (
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Ví dụ:</Text>
                {step.examples.map((example, index) => (
                  <View key={index} style={styles.exampleItem}>
                    <Ionicons
                      name="chatbox-outline"
                      size={16}
                      color="#4A6FA5"
                    />
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Mẹo hữu ích</Text>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Sử dụng câu ngắn gọn và rõ ràng để có kết quả tốt nhất.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Bạn có thể hỏi lại nếu cần thêm thông tin chi tiết.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Chatbot liên tục được cải thiện, hãy thử lại nếu không nhận được
              câu trả lời mong muốn.
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/pages/chatbot')}
        >
          <Text style={styles.startButtonText}>Bắt đầu trò chuyện</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8
  },
  scrollView: {
    flex: 1
  },
  introContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center'
  },
  introText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  stepContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A6FA5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22
  },
  examplesContainer: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  tipsContainer: {
    backgroundColor: '#FFF9E6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700'
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20
  },
  startButton: {
    backgroundColor: '#4A6FA5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24
  },
  footerText: {
    fontSize: 12,
    color: '#999'
  }
})
