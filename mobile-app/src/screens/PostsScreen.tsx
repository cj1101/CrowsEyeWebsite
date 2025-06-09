import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery, useQueryClient } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, createStyles } from '../context/ThemeContext';
import { apiClient, Post } from '../services/api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const PostsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const queryClient = useQueryClient();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Drafts', value: 'draft' },
  ];

  const { data, isLoading, refetch } = useQuery(
    ['posts', selectedFilter],
    () => apiClient.getPosts({
      status: selectedFilter === 'all' ? undefined : selectedFilter,
      limit: 50,
    }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  );

  const renderEmptyState = () => (
    <View style={localStyles.emptyState}>
      <Icon name="post-add" size={64} color={theme.textSecondary} />
      <Text style={[styles.text, localStyles.emptyTitle]}>
        {selectedFilter === 'all' ? 'No posts yet' : `No ${selectedFilter} posts`}
      </Text>
      <Text style={[styles.textSecondary, localStyles.emptySubtitle]}>
        Create your first post to get started with social media management.
      </Text>
      <TouchableOpacity
        style={[styles.button, localStyles.createButton]}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.buttonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner />
        <Text style={[styles.text, { marginTop: 16 }]}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={localStyles.header}>
        <Text style={styles.heading}>Posts</Text>
        <TouchableOpacity
          style={localStyles.createPostButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={localStyles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              localStyles.filterButton,
              {
                backgroundColor: selectedFilter === filter.value
                  ? theme.primary
                  : theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.text,
                {
                  color: selectedFilter === filter.value
                    ? '#ffffff'
                    : theme.text,
                  fontSize: 14,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts List */}
      <FlatList
        data={data?.posts || []}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          data?.posts?.length === 0 ? localStyles.emptyContainer : undefined
        }
      />
    </View>
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
  createPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    paddingHorizontal: 32,
  },
});

export default PostsScreen; 