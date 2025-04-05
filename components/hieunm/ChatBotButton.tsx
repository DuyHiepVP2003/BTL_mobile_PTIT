import React from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  useAnimatedGestureHandler,
  runOnJS
} from 'react-native-reanimated'
import {
  PanGestureHandler,
  GestureHandlerRootView
} from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'

interface ChatBotButtonProps {
  bottom?: number
  right?: number
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export const ChatBotButton = ({
  bottom = 160,
  right = 30
}: ChatBotButtonProps) => {
  const router = useRouter()
  const scale = useSharedValue(1)
  const pressed = useSharedValue(false)

  // Position values
  const x = useSharedValue(SCREEN_WIDTH - right - 30)
  const y = useSharedValue(SCREEN_HEIGHT - bottom - 30)

  const handlePress = () => {
    // Only trigger press action if not being dragged
    if (pressed.value) {
      // Animate the button when pressed
      scale.value = withSequence(
        withSpring(1.2, { damping: 2 }),
        withSpring(1, { damping: 20 })
      )

      // Navigate to chatbot screen
      console.log('Chatbot button pressed')
      router.push('/pages/chatbot')
    }
  }

  const resetPressed = () => {
    pressed.value = false
  }

  // Gesture handler for dragging
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      pressed.value = true
      ctx.startX = x.value
      ctx.startY = y.value
    },
    onActive: (event, ctx) => {
      x.value = ctx.startX + event.translationX
      y.value = ctx.startY + event.translationY
    },
    onEnd: () => {
      // Snap to edges if needed
      const buttonSize = 60
      const padding = 20

      // Snap to left or right edge
      if (x.value < SCREEN_WIDTH / 2) {
        x.value = withSpring(padding)
      } else {
        x.value = withSpring(SCREEN_WIDTH - buttonSize - padding)
      }

      // Ensure button stays within screen bounds for y-axis
      if (y.value < padding) {
        y.value = withSpring(padding)
      } else if (y.value > SCREEN_HEIGHT - buttonSize - padding) {
        y.value = withSpring(SCREEN_HEIGHT - buttonSize - padding)
      }

      // Reset pressed state using runOnJS
      runOnJS(resetPressed)()
    }
  })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { scale: scale.value }
      ]
    }
  })

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.container, animatedStyle]}>
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
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  rootView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none'
  },
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000
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
    borderColor: '#E8F0FE'
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
    borderColor: 'white'
  },
  label: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A6FA5'
  }
})
