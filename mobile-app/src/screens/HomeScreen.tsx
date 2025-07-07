import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useQuery } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, createStyles } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import StatsCard from '../components/StatsCard';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(theme);

  // Fetch recent posts
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery(
    'recentPosts',
    () => apiClient.getPosts({ limit: 5 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'dashboardAnalytics',
    () => apiClient.getPlatformAnalytics(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    ),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch connected platforms
  const { data: platformsData } = useQuery(
    'connectedPlatforms',
    () => apiClient.getConnectedPlatforms(),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPosts()]);
    setRefreshing(false);
  };

  const mockStats = {
    totalPosts: 45,
    scheduledPosts: 12,
    totalEngagement: 2847,
    averageEngagementRate: 4.2,
  };

  const quickActions = [
    {
      title: 'Create Post',
      icon: 'add-circle',
      color: theme.primary,
      onPress: () => navigation.navigate('CreatePost'),
    },
    {
      title: 'Schedule',
      icon: 'schedule',
      color: theme.secondary,
      onPress: () => navigation.navigate('Schedule'),
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      color: theme.info,
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      title: 'Posts',
      icon: 'post-add',
      color: theme.success,
      onPress: () => navigation.navigate('Posts'),
    },
  ];

  if (postsLoading && !postsData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner />
        <Text style={[styles.text, { marginTop: 16 }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={localStyles.header}>
        <View>
          <Text style={[styles.heading, { marginBottom: 4 }]}>
            Welcome back, {user?.name || 'User'}!
          </Text>
          <Text style={styles.textSecondary}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={localStyles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="person" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Quick Actions
        </Text>
        <View style={localStyles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[localStyles.quickActionCard, { borderColor: action.color }]}
              onPress={action.onPress}
            >
              <Icon name={action.icon} size={32} color={action.color} />
              <Text style={[styles.text, { marginTop: 8, fontSize: 12, textAlign: 'center' }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Overview */}
      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Overview
        </Text>
        <View style={localStyles.statsGrid}>
          <StatsCard
            title="Total Posts"
            value={mockStats.totalPosts.toString()}
            icon="post-add"
            color={theme.primary}
          />
          <StatsCard
            title="Scheduled"
            value={mockStats.scheduledPosts.toString()}
            icon="schedule"
            color={theme.secondary}
          />
          <StatsCard
            title="Engagement"
            value={mockStats.totalEngagement.toLocaleString()}
            icon="favorite"
            color={theme.error}
          />
          <StatsCard
            title="Avg. Rate"
            value={`${mockStats.averageEngagementRate}%`}
            icon="trending-up"
            color={theme.success}
          />
        </View>
      </View>

      {/* Recent Posts */}
      <View style={localStyles.section}>
        <View style={localStyles.sectionHeader}>
          <Text style={[styles.text, { fontSize: 18, fontWeight: '600' }]}>
            Recent Posts
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Posts')}>
            <Text style={[styles.text, { color: theme.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {postsData?.posts?.length > 0 ? (
          postsData.posts.slice(0, 3).map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
            />
          ))
        ) : (
          <View style={[styles.card, { alignItems: 'center', padding: 32 }]}>
            <Icon name="post-add" size={48} color={theme.textSecondary} />
            <Text style={[styles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
              No posts yet. Create your first post to get started!
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Text style={styles.buttonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Connected Platforms */}
      <View style={[localStyles.section, { marginBottom: 32 }]}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Connected Platforms
        </Text>
        <View style={localStyles.platformsContainer}>
          {['instagram', 'facebook', 'twitter', 'linkedin'].map((platform) => (
            <View key={platform} style={localStyles.platformChip}>
              <View
                style={[
                  localStyles.platformStatus,
                  { backgroundColor: Math.random() > 0.5 ? theme.success : theme.textSecondary },
                ]}
              />
              <Text style={[styles.text, { fontSize: 12, textTransform: 'capitalize' }]}>
                {platform}
              </Text>
            </View>
          ))}
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 48) / 4,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  platformStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});

export default HomeScreen; 