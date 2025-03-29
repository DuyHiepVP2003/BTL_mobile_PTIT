import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, Stack } from 'expo-router'

export default function SunAndMoonScreen() {
  const router = useRouter()

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Thông tin về mặt trời và mặt trăng
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Sun Information */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="sunny" size={28} color="#FF9500" />
              <Text style={styles.cardTitle}>Mặt trời</Text>
            </View>

            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Bình minh</Text>
                <Text style={styles.timeValue}>05:42</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Hoàng hôn</Text>
                <Text style={styles.timeValue}>18:15</Text>
              </View>
            </View>

            <View style={styles.sunChart}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.chartImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Moon Information */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="moon" size={28} color="#8E8E93" />
              <Text style={styles.cardTitle}>Mặt trăng</Text>
            </View>

            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Trăng lên</Text>
                <Text style={styles.timeValue}>19:22</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Trăng lặn</Text>
                <Text style={styles.timeValue}>06:45</Text>
              </View>
            </View>

            <View style={styles.moonPhaseContainer}>
              <Text style={styles.phaseLabel}>Pha trăng hiện tại</Text>
              <View style={styles.phaseInfo}>
                <Image
                  source={require('../../../assets/images/icon.png')}
                  style={styles.moonImage}
                  resizeMode="contain"
                />
                <Text style={styles.phaseText}>Trăng tròn (100%)</Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Thông tin thêm</Text>
            <Text style={styles.infoText}>
              Thời gian ban ngày: 12 giờ 33 phút{'\n'}
              Chỉ số UV cao nhất: 10 (Rất cao){'\n'}
              Thời gian có ánh sáng: 13 giờ 05 phút
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  content: {
    flex: 1,
    padding: 16
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333'
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  timeItem: {
    alignItems: 'center'
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  sunChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartImage: {
    width: '100%',
    height: '100%'
  },
  moonPhaseContainer: {
    alignItems: 'center',
    marginTop: 10
  },
  phaseLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  moonImage: {
    width: 60,
    height: 60,
    marginRight: 16
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333'
  },
  infoText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444'
  }
})
