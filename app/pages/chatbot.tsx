import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  read?: boolean;
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn',
      isUser: false,
      timestamp: 'Livechat 02:10 PM'
    },
    {
      id: '2',
      text: 'Welcome to LiveChat\nTôi ở đây để hỗ trợ bạn. Hãy cho tôi thông tin để tôi đưa ra phương án cho bạn nhé',
      isUser: false,
      timestamp: 'Livechat 02:10 PM'
    },
    {
      id: '3',
      text: 'Chào bạn',
      isUser: true,
      timestamp: 'Visitor 02:12 PM',
      read: true
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: `Visitor ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        read: false
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Cảm ơn bạn đã liên hệ. Tôi có thể giúp gì cho bạn về thông tin thời tiết?',
          isUser: false,
          timestamp: `Livechat ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
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
          <Text style={styles.headerTitle}>Nhắn với BOT</Text>
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
          <Ionicons name="chatbubbles" size={24} color="white" />
        </View>
        <View style={styles.botTextContainer}>
          <Text style={styles.botName}>Chatbot</Text>
          <Text style={styles.botDescription}>Hỗ trợ thời tiết cho bạn</Text>
        </View>
      </View>
      
      {/* Chat Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageWrapper}>
            <Text style={styles.timestamp}>{msg.timestamp}</Text>
            <View style={[
              styles.messageBubble, 
              msg.isUser ? styles.userBubble : styles.botBubble
            ]}>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
            {msg.isUser && msg.read && (
              <Text style={styles.readStatus}>Read</Text>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn"
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={message.trim() ? "#0066FF" : "#999"} 
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
    backgroundColor: '#0066FF',
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
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#0066FF',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  readStatus: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
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
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
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