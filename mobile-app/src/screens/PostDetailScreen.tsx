import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { format } from 'date-fns';
import { useTheme, createStyles } from '../context/ThemeContext';
import { apiClient } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PostDetailScreen = ({ route, navigation }: any) => {
  const { postId } = route.params;
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery(
    ['post', postId],
    () => apiClient.getPost(postId),
    { staleTime: 5 * 60 * 1000 }
  );

  const deleteMutation = useMutation(
    () => apiClient.deletePost(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        navigation.goBack();
      },
    }
  );

  const publishMutation = useMutation(
    () => apiClient.publishPost(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', postId]);
        queryClient.invalidateQueries('posts');
      },
    }
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const handlePublish = () => {
    Alert.alert(
      'Publish Post',
      'Are you sure you want to publish this post now?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Publish', onPress: () => publishMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.text}>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={localStyles.header}>
        <View style={localStyles.statusBadge}>
          <Text style={[localStyles.statusText, { color: theme.primary }]}>
            {post.status.toUpperCase()}
          </Text>
        </View>
        <View style={localStyles.actions}>
          <TouchableOpacity
            style={localStyles.actionButton}
            onPress={() => {/* Edit functionality */}}
          >
            <Icon name="edit" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.actionButton}
            onPress={handleDelete}
          >
            <Icon name="delete" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {post.mediaUrl && (
        <FastImage
          source={{ uri: post.mediaUrl }}
          style={localStyles.media}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}

      <View style={localStyles.content}>
        <Text style={[styles.text, localStyles.caption]}>
          {post.caption}
        </Text>

        <View style={localStyles.platforms}>
          {post.platforms.map((platform, index) => (
            <View key={index} style={localStyles.platformTag}>
              <Text style={localStyles.platformText}>{platform}</Text>
            </View>
          ))}
        </View>

        {post.scheduledTime && (
          <View style={localStyles.scheduleInfo}>
            <Icon name="schedule" size={20} color={theme.textSecondary} />
            <Text style={[styles.textSecondary, { marginLeft: 8 }]}>
              Scheduled for {format(new Date(post.scheduledTime), 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
        )}

        {post.analytics && (
          <View style={localStyles.analytics}>
            <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
              Performance
            </Text>
            <View style={localStyles.analyticsGrid}>
              <View style={localStyles.analyticItem}>
                <Icon name="visibility" size={24} color={theme.primary} />
                <Text style={localStyles.analyticValue}>{post.analytics.views}</Text>
                <Text style={styles.textSecondary}>Views</Text>
              </View>
              <View style={localStyles.analyticItem}>
                <Icon name="favorite" size={24} color={theme.error} />
                <Text style={localStyles.analyticValue}>{post.analytics.likes}</Text>
                <Text style={styles.textSecondary}>Likes</Text>
              </View>
              <View style={localStyles.analyticItem}>
                <Icon name="comment" size={24} color={theme.info} />
                <Text style={localStyles.analyticValue}>{post.analytics.comments}</Text>
                <Text style={styles.textSecondary}>Comments</Text>
              </View>
              <View style={localStyles.analyticItem}>
                <Icon name="share" size={24} color={theme.success} />
                <Text style={localStyles.analyticValue}>{post.analytics.shares}</Text>
                <Text style={styles.textSecondary}>Shares</Text>
              </View>
            </View>
          </View>
        )}

        {post.status === 'draft' && (
          <TouchableOpacity
            style={[styles.button, localStyles.publishButton]}
            onPress={handlePublish}
            disabled={publishMutation.isLoading}
          >
            {publishMutation.isLoading ? (
              <LoadingSpinner size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Publish Now</Text>
            )}
          </TouchableOpacity>
        )}
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
  },
  statusBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  media: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  caption: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  platforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  platformTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  platformText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  analytics: {
    marginBottom: 24,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginVertical: 4,
  },
  publishButton: {
    marginTop: 16,
  },
});

export default PostDetailScreen; 