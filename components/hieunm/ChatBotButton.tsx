import React from 'react'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence } from 'react-native-reanimated'

export const ChatBotButton = () => {
  const scale = useSharedValue(1)
  
  const handlePress = () => {
    // Animate the button when pressed
    scale.value = withSequence(
      withSpring(1.2, { damping: 2 }),
      withSpring(1, { damping: 20 })
    )
    
    // Add your chatbot opening logic here
    console.log('Opening chatbot')
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubbles-outline" size={28} color="#4A6FA5" />
      </TouchableOpacity>
      <View style={styles.pulseCircle} />
      <Text style={styles.label}>Chat</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  chatbotButton: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#E8F0FE',
  },
  pulseCircle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    top: 10,
    right: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  label: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A6FA5',
  }
})