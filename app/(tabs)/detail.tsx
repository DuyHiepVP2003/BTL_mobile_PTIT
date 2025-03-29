import { StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WeatherCard } from '@/components/hieunm/WeatherCard'
import { ButtonControl } from '@/components/hieunm/ButtonControl'
import { ChatBotButton } from '@/components/hieunm/ChatBotButton'

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Weather Card */}
      <WeatherCard />

      {/* Function Buttons */}
      <ButtonControl />
      
      {/* Chatbot Button */}
      <ChatBotButton />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff'
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute'
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8
  }
})
