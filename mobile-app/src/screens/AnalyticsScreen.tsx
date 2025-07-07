import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, createStyles } from '../context/ThemeContext';
import { apiClient } from '../services/api';
import StatsCard from '../components/StatsCard';

const AnalyticsScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { data: analyticsData } = useQuery(
    'analytics',
    () => apiClient.getPlatformAnalytics(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    ),
    { staleTime: 10 * 60 * 1000 }
  );

  const mockData = {
    totalViews: 12543,
    totalLikes: 2847,
    totalComments: 485,
    engagementRate: 4.2,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={localStyles.header}>
        <Text style={styles.heading}>Analytics</Text>
      </View>

      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Last 30 Days
        </Text>
        <View style={localStyles.statsGrid}>
          <StatsCard
            title="Views"
            value={mockData.totalViews.toLocaleString()}
            icon="visibility"
            color={theme.primary}
          />
          <StatsCard
            title="Likes"
            value={mockData.totalLikes.toLocaleString()}
            icon="favorite"
            color={theme.error}
          />
          <StatsCard
            title="Comments"
            value={mockData.totalComments.toLocaleString()}
            icon="comment"
            color={theme.info}
          />
          <StatsCard
            title="Engagement"
            value={`${mockData.engagementRate}%`}
            icon="trending-up"
            color={theme.success}
          />
        </View>
      </View>

      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Platform Performance
        </Text>
        <View style={[styles.card, { alignItems: 'center', padding: 32 }]}>
          <Icon name="bar-chart" size={48} color={theme.textSecondary} />
          <Text style={[styles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
            Detailed charts coming soon
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 20,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default AnalyticsScreen; 