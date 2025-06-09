import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { format } from 'date-fns';
import { useTheme, createStyles } from '../context/ThemeContext';
import { Post } from '../services/api';

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return theme.success;
      case 'scheduled':
        return theme.info;
      case 'draft':
        return theme.warning;
      case 'failed':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return 'check-circle';
      case 'scheduled':
        return 'schedule';
      case 'draft':
        return 'edit';
      case 'failed':
        return 'error';
      default:
        return 'help';
    }
  };

  return (
    <TouchableOpacity style={[styles.card, localStyles.container]} onPress={onPress}>
      <View style={localStyles.header}>
        <View style={localStyles.statusContainer}>
          <Icon
            name={getStatusIcon(post.status)}
            size={16}
            color={getStatusColor(post.status)}
          />
          <Text style={[localStyles.statusText, { color: getStatusColor(post.status) }]}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.textSecondary}>
          {format(new Date(post.createdAt), 'MMM d, yyyy')}
        </Text>
      </View>

      <View style={localStyles.content}>
        {post.mediaUrl && (
          <FastImage
            source={{ uri: post.mediaUrl }}
            style={localStyles.media}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <View style={localStyles.textContent}>
          <Text style={styles.text} numberOfLines={2}>
            {post.caption || 'No caption'}
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
              <Icon name="schedule" size={14} color={theme.textSecondary} />
              <Text style={[styles.textSecondary, { fontSize: 12, marginLeft: 4 }]}>
                {format(new Date(post.scheduledTime), 'MMM d, h:mm a')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {post.analytics && (
        <View style={localStyles.analytics}>
          <View style={localStyles.analytic}>
            <Icon name="visibility" size={14} color={theme.textSecondary} />
            <Text style={localStyles.analyticText}>{post.analytics.views}</Text>
          </View>
          <View style={localStyles.analytic}>
            <Icon name="favorite" size={14} color={theme.textSecondary} />
            <Text style={localStyles.analyticText}>{post.analytics.likes}</Text>
          </View>
          <View style={localStyles.analytic}>
            <Icon name="comment" size={14} color={theme.textSecondary} />
            <Text style={localStyles.analyticText}>{post.analytics.comments}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flexDirection: 'row',
  },
  media: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  platforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  platformTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  platformText: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '500',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  analytics: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  analytic: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  analyticText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
});

export default PostCard; 