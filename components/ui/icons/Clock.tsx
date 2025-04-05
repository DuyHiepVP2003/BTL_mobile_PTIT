import React from 'react'
import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

export default function Clock() {
  return (
    <View>
      <Svg width={59} height={27} viewBox="0 0 59 27" fill="none">
        <Path
          d="M57.0117 1L29.8299 24.4083"
          stroke="#885FFC"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M1.99902 24.4084L29.4568 24.4084"
          stroke="#828282"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M25.2988 10.7988L29.8326 24.4075"
          stroke="#E0E0E0"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  )
}
