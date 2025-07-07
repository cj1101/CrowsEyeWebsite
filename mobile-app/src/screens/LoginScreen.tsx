import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme, createStyles } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { login, register } = useAuth();
  const styles = createStyles(theme);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLoginMode && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={localStyles.scrollContainer}>
        <View style={localStyles.content}>
          <Text style={[styles.heading, localStyles.title]}>
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </Text>
          
          <Text style={[styles.textSecondary, localStyles.subtitle]}>
            {isLoginMode 
              ? 'Sign in to continue managing your social media'
              : 'Join Crow\'s Eye to get started'
            }
          </Text>

          <View style={localStyles.form}>
            {!isLoginMode && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[
                styles.button,
                localStyles.submitButton,
                { opacity: isLoading ? 0.6 : 1 },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={localStyles.footer}>
            <Text style={styles.textSecondary}>
              {isLoginMode ? 'Don\'t have an account?' : 'Already have an account?'}
            </Text>
            <TouchableOpacity
              style={localStyles.switchButton}
              onPress={() => setIsLoginMode(!isLoginMode)}
            >
              <Text style={[styles.text, { color: theme.primary, fontWeight: '600' }]}>
                {isLoginMode ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={localStyles.guestButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={[styles.textSecondary, { textAlign: 'center' }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchButton: {
    marginLeft: 8,
  },
  guestButton: {
    padding: 16,
  },
});

export default LoginScreen; 