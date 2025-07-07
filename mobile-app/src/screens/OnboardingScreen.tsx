import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme, createStyles } from '../context/ThemeContext';

const OnboardingScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, localStyles.container]}>
      <View style={localStyles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={localStyles.logo}
          resizeMode="contain"
        />
        
        <Text style={[styles.heading, localStyles.title]}>
          Welcome to Crow's Eye
        </Text>
        
        <Text style={[styles.textSecondary, localStyles.subtitle]}>
          AI-powered social media management for creators and businesses
        </Text>
        
        <View style={localStyles.features}>
          <View style={localStyles.feature}>
            <Text style={localStyles.featureIcon}>🤖</Text>
            <Text style={styles.text}>AI Content Generation</Text>
          </View>
          <View style={localStyles.feature}>
            <Text style={localStyles.featureIcon}>📅</Text>
            <Text style={styles.text}>Smart Scheduling</Text>
          </View>
          <View style={localStyles.feature}>
            <Text style={localStyles.featureIcon}>📊</Text>
            <Text style={styles.text}>Analytics & Insights</Text>
          </View>
          <View style={localStyles.feature}>
            <Text style={localStyles.featureIcon}>🔗</Text>
            <Text style={styles.text}>Multi-Platform Publishing</Text>
          </View>
        </View>
      </View>
      
      <View style={localStyles.buttons}>
        <TouchableOpacity
          style={[styles.button, localStyles.primaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={localStyles.secondaryButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={[styles.text, { color: theme.primary }]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 48,
  },
  features: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  buttons: {
    paddingBottom: 32,
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
});

export default OnboardingScreen; 