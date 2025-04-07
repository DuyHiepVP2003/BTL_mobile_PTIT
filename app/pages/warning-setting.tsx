import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type WarningType = {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  severity: 'high' | 'medium' | 'low';
};

export default function WarningSettingScreen() {
  const router = useRouter();
  const [masterToggle, setMasterToggle] = useState(true);
  const [warningTypes, setWarningTypes] = useState<WarningType[]>([
    {
      id: '1',
      title: 'Mưa lớn',
      description: 'Thông báo khi có dự báo mưa lớn trong khu vực của bạn',
      icon: 'rainy',
      enabled: true,
      severity: 'high'
    },
    {
      id: '2',
      title: 'Bão',
      description: 'Cảnh báo khi có bão đang hình thành hoặc di chuyển vào khu vực',
      icon: 'thunderstorm',
      enabled: true,
      severity: 'high'
    },
    {
      id: '3',
      title: 'Nhiệt độ cao',
      description: 'Thông báo khi nhiệt độ vượt quá 35°C',
      icon: 'sunny',
      enabled: true,
      severity: 'medium'
    },
    {
      id: '4',
      title: 'Nhiệt độ thấp',
      description: 'Thông báo khi nhiệt độ xuống dưới 10°C',
      icon: 'snow',
      enabled: false,
      severity: 'medium'
    },
    {
      id: '5',
      title: 'Chất lượng không khí',
      description: 'Thông báo khi chất lượng không khí ở mức nguy hiểm',
      icon: 'cloud',
      enabled: true,
      severity: 'medium'
    },
    {
      id: '6',
      title: 'Lũ lụt',
      description: 'Cảnh báo khi có nguy cơ lũ lụt trong khu vực',
      icon: 'water',
      enabled: true,
      severity: 'high'
    },
    {
      id: '7',
      title: 'Tầm nhìn thấp',
      description: 'Thông báo khi có sương mù hoặc tầm nhìn thấp',
      icon: 'eye-off',
      enabled: false,
      severity: 'low'
    }
  ]);

  const toggleWarning = (id: string) => {
    setWarningTypes(prevState => 
      prevState.map(warning => 
        warning.id === id 
          ? { ...warning, enabled: !warning.enabled } 
          : warning
      )
    );
  };

  const toggleAllWarnings = (value: boolean) => {
    setMasterToggle(value);
    setWarningTypes(prevState => 
      prevState.map(warning => ({ ...warning, enabled: value }))
    );
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  const getSeverityText = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'Nghiêm trọng';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Nhẹ';
      default:
        return '';
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt cảnh báo thời tiết</Text>
      </View>
      
      {/* Master Toggle */}
      <View style={styles.masterToggleContainer}>
        <View style={styles.masterToggleContent}>
          <View style={styles.masterToggleIconContainer}>
            <Ionicons name="notifications" size={24} color="#fff" />
          </View>
          <View style={styles.masterToggleTextContainer}>
            <Text style={styles.masterToggleTitle}>Nhận thông báo cảnh báo</Text>
            <Text style={styles.masterToggleDescription}>
              Bật để nhận thông báo khi có điều kiện thời tiết xấu
            </Text>
          </View>
        </View>
        <Switch
          value={masterToggle}
          onValueChange={toggleAllWarnings}
          trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : masterToggle ? '#FFFFFF' : '#F4F3F4'}
          ios_backgroundColor="#D1D1D6"
        />
      </View>
      
      {/* Warning Types */}
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Loại cảnh báo</Text>
        
        {warningTypes.map((warning) => (
          <View key={warning.id} style={styles.warningItem}>
            <View style={styles.warningItemContent}>
              <View style={[styles.warningIconContainer, { backgroundColor: getSeverityColor(warning.severity) }]}>
                <Ionicons name={warning.icon as any} size={20} color="#fff" />
              </View>
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTitle}>{warning.title}</Text>
                <Text style={styles.warningDescription}>{warning.description}</Text>
                <View style={styles.severityContainer}>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(warning.severity) }]}>
                    <Text style={styles.severityText}>{getSeverityText(warning.severity)}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Switch
              value={warning.enabled && masterToggle}
              onValueChange={() => toggleWarning(warning.id)}
              disabled={!masterToggle}
              trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : warning.enabled ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#D1D1D6"
            />
          </View>
        ))}
        
        {/* Additional Settings */}
        <Text style={styles.sectionTitle}>Tùy chọn thêm</Text>
        
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionItemContent}>
            <Ionicons name="location" size={20} color="#007AFF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Vị trí nhận cảnh báo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionItemContent}>
            <Ionicons name="time" size={20} color="#007AFF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Thời gian nhận thông báo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionItemContent}>
            <Ionicons name="volume-high" size={20} color="#007AFF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Âm thanh thông báo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cảnh báo thời tiết được cập nhật từ Trung tâm Dự báo Khí tượng Thủy văn Quốc gia
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  masterToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterToggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  masterToggleTextContainer: {
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  masterToggleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  warningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  warningItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  warningIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  warningDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  severityContainer: {
    flexDirection: 'row',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  }
});