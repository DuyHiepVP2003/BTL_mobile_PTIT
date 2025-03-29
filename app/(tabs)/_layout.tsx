import { Tabs } from 'expo-router'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

// Add proper type definition for the CustomTabBar props
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme()

  return (
    <View
      style={[
        styles.tabBar,
        Platform.OS === 'ios' ? styles.tabBarIOS : styles.tabBarAndroid
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <Animated.View
            key={index}
            style={[styles.tabButton, isFocused && styles.tabButtonActive]}
          >
            <HapticTab onPress={onPress}>
              <View
                style={[
                  styles.tabIconContainer,
                  isFocused && styles.tabIconActive
                ]}
              >
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: true,
                    color: isFocused
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].tabIconDefault,
                    size: 28
                  })}
              </View>
            </HapticTab>
          </Animated.View>
        )
      })}
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="detail"
        options={{
          title: 'Hieu',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cloud.fill" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="music-recomment"
        options={{
          title: 'Hiep',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="music.note" color={color} />
          )
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: 'red',
    margin: 10,
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabBarIOS: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  tabBarAndroid: {
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  tabBarDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)'
  },
  tabButton: {
    padding: 8,
    flex: 1,
    alignItems: 'center'
  },
  tabButtonActive: {
    transform: [{ translateY: -5 }]
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20
  },
  tabIconActive: {
    backgroundColor: 'rgba(120, 120, 255, 0.2)'
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  }
})
