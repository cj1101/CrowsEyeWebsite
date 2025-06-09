import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, createStyles } from '../context/ThemeContext';
import { apiClient } from '../services/api';

const ScheduleScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: scheduleData } = useQuery(
    'schedules',
    () => apiClient.getSchedules(),
    { staleTime: 5 * 60 * 1000 }
  );

  return (
    <ScrollView style={styles.container}>
      <View style={localStyles.header}>
        <Text style={styles.heading}>Schedule</Text>
        <TouchableOpacity style={localStyles.addButton}>
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={localStyles.calendarSection}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Upcoming Posts
        </Text>
        
        {/* Calendar view would go here */}
        <View style={[styles.card, { alignItems: 'center', padding: 32 }]}>
          <Icon name="calendar-today" size={48} color={theme.textSecondary} />
          <Text style={[styles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
            Calendar view coming soon
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarSection: {
    padding: 16,
  },
});

export default ScheduleScreen; 