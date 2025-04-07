import React from 'react'
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export const ButtonControl = () => {
  const router = useRouter()

  type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

  const handleClickSunMoon = () => {
    router.push('/pages/sunandmoon')
  }

  const handleWarning = () => {
    router.push('/pages/bad-weather')
  }

  const handleClickChatBotGuide = () => {
    router.push('/pages/chatbotguide')
  }

  const handleClickSettingWarning = () => {
    router.push('/pages/warning-setting')
  }

  const buttons = [
    {
      title: 'Thông tin về mặt trời và mặt trăng',
      icon: 'information-circle-outline',
      onPress: handleClickSunMoon
    },
    {
      title: 'Cảnh báo thời tiết xấu hôm nay',
      icon: 'warning-outline',
      onPress: handleWarning
    },
    {
      title: 'Hướng dẫn sử dụng chatbot',
      icon: 'help-circle-outline',
      onPress: handleClickChatBotGuide
    },
    {
      title: 'Cài đặt thông báo cảnh báo',
      icon: 'notifications-outline',
      onPress: handleClickSettingWarning
    }
  ]

  return (
    <ScrollView style={styles.functionContainer}>
      <View style={styles.buttonGrid}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={styles.functionButton}
            onPress={button.onPress}
          >
            <Ionicons
              name={button.icon as IoniconsName}
              size={24}
              color="#000"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>{button.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  functionContainer: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  functionButton: {
    backgroundColor: '#e8e3f5',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    width: '48%',
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  buttonIcon: {
    marginBottom: 10
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  }
})
