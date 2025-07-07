import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { useTheme, createStyles } from '../context/ThemeContext';
import { apiClient, CreatePostData } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CreatePostScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [formData, setFormData] = useState<Partial<CreatePostData>>({
    caption: '',
    platforms: [],
    customInstructions: '',
    formatting: {
      verticalOptimization: false,
      captionOverlay: false,
      overlayPosition: 'center',
      overlayFontSize: 'medium',
      aspectRatio: 'original',
    },
    isRecurring: false,
    recurringPattern: 'daily',
  });

  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [isScheduled, setIsScheduled] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platforms = [
    { label: 'Instagram', value: 'instagram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Twitter', value: 'twitter' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'TikTok', value: 'tiktok' },
    { label: 'YouTube', value: 'youtube' },
  ];

  const tones = [
    'professional',
    'casual',
    'friendly',
    'formal',
    'humorous',
    'inspiring',
  ];

  const selectMedia = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 0.8,
        includeBase64: false,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          setSelectedMedia(response.assets[0]);
        }
      }
    );
  };

  const togglePlatform = (platform: string) => {
    const platforms = formData.platforms || [];
    if (platforms.includes(platform)) {
      setFormData({
        ...formData,
        platforms: platforms.filter(p => p !== platform),
      });
    } else {
      setFormData({
        ...formData,
        platforms: [...platforms, platform],
      });
    }
  };

  const generateCaption = async () => {
    if (!selectedMedia || !formData.platforms?.length) {
      Alert.alert('Error', 'Please select media and platforms first');
      return;
    }

    setIsGeneratingCaption(true);
    try {
      const response = await apiClient.generateCaption({
        platforms: formData.platforms,
        tone: 'friendly', // Could be made selectable
        customInstructions: formData.customInstructions || '',
        includeHashtags: true,
      });
      
      setFormData({
        ...formData,
        caption: response.caption,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate caption');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMedia || !formData.platforms?.length || !formData.caption) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData: CreatePostData = {
        mediaId: selectedMedia.uri, // In real app, you'd upload media first
        caption: formData.caption,
        platforms: formData.platforms,
        customInstructions: formData.customInstructions,
        formatting: formData.formatting,
        scheduledTime: isScheduled ? scheduledDate.toISOString() : undefined,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.recurringPattern,
      };

      await apiClient.createPost(postData);
      
      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Media
        </Text>
        
        {selectedMedia ? (
          <View style={localStyles.mediaContainer}>
            <FastImage
              source={{ uri: selectedMedia.uri }}
              style={localStyles.selectedMedia}
              resizeMode={FastImage.resizeMode.cover}
            />
            <TouchableOpacity
              style={localStyles.changeMediaButton}
              onPress={selectMedia}
            >
              <Text style={[styles.text, { color: theme.primary }]}>Change Media</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={localStyles.mediaPicker} onPress={selectMedia}>
            <Icon name="add-photo-alternate" size={48} color={theme.textSecondary} />
            <Text style={[styles.textSecondary, { marginTop: 8 }]}>
              Tap to select photo or video
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Platforms
        </Text>
        <View style={localStyles.platformsGrid}>
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.value}
              style={[
                localStyles.platformButton,
                {
                  backgroundColor: formData.platforms?.includes(platform.value)
                    ? theme.primary
                    : theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => togglePlatform(platform.value)}
            >
              <Text
                style={[
                  styles.text,
                  {
                    color: formData.platforms?.includes(platform.value)
                      ? '#ffffff'
                      : theme.text,
                    fontSize: 14,
                  },
                ]}
              >
                {platform.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={localStyles.section}>
        <View style={localStyles.captionHeader}>
          <Text style={[styles.text, { fontSize: 18, fontWeight: '600' }]}>
            Caption
          </Text>
          <TouchableOpacity
            style={localStyles.aiButton}
            onPress={generateCaption}
            disabled={isGeneratingCaption}
          >
            {isGeneratingCaption ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <Icon name="auto-awesome" size={16} color="#ffffff" />
                <Text style={localStyles.aiButtonText}>AI Generate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.input, localStyles.captionInput]}
          multiline
          numberOfLines={4}
          placeholder="Write your caption here..."
          placeholderTextColor={theme.textSecondary}
          value={formData.caption}
          onChangeText={(text) => setFormData({ ...formData, caption: text })}
        />
      </View>

      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          AI Instructions (Optional)
        </Text>
        <TextInput
          style={[styles.input, localStyles.instructionsInput]}
          multiline
          numberOfLines={3}
          placeholder="Tell AI how to optimize your content..."
          placeholderTextColor={theme.textSecondary}
          value={formData.customInstructions}
          onChangeText={(text) => setFormData({ ...formData, customInstructions: text })}
        />
      </View>

      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Scheduling
        </Text>
        
        <View style={localStyles.switchRow}>
          <Text style={styles.text}>Schedule for later</Text>
          <Switch
            value={isScheduled}
            onValueChange={setIsScheduled}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#ffffff"
          />
        </View>

        {isScheduled && (
          <TouchableOpacity
            style={localStyles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="schedule" size={20} color={theme.primary} />
            <Text style={[styles.text, { marginLeft: 8 }]}>
              {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setScheduledDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      <View style={localStyles.section}>
        <TouchableOpacity
          style={[
            styles.button,
            localStyles.submitButton,
            { opacity: isSubmitting ? 0.6 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <LoadingSpinner size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              {isScheduled ? 'Schedule Post' : 'Create Post'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  mediaContainer: {
    alignItems: 'center',
  },
  selectedMedia: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  changeMediaButton: {
    padding: 8,
  },
  mediaPicker: {
    height: 200,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  captionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  instructionsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default CreatePostScreen; 