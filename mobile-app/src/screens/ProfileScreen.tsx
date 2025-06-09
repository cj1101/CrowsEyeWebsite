import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, createStyles } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }: any) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const styles = createStyles(theme);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          await logout();
          navigation.navigate('Onboarding');
        }},
      ]
    );
  };

  const menuItems = [
    { title: 'Connected Platforms', icon: 'link', onPress: () => {} },
    { title: 'Notifications', icon: 'notifications', onPress: () => {} },
    { title: 'Privacy & Security', icon: 'security', onPress: () => {} },
    { title: 'Help & Support', icon: 'help', onPress: () => {} },
    { title: 'About', icon: 'info', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={localStyles.header}>
        <Text style={styles.heading}>Profile</Text>
      </View>

      {user && (
        <View style={[styles.card, localStyles.userInfo]}>
          <View style={localStyles.avatar}>
            <Icon name="person" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.text, { fontSize: 20, fontWeight: '600' }]}>
            {user.name}
          </Text>
          <Text style={styles.textSecondary}>{user.email}</Text>
          {user.subscription && (
            <View style={localStyles.subscriptionBadge}>
              <Text style={localStyles.subscriptionText}>
                {user.subscription.plan.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={localStyles.section}>
        <Text style={[styles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
          Settings
        </Text>
        
        <View style={localStyles.settingItem}>
          <View style={localStyles.settingLeft}>
            <Icon name="dark-mode" size={24} color={theme.text} />
            <Text style={[styles.text, { marginLeft: 12 }]}>Dark Mode</Text>
          </View>
          <TouchableOpacity onPress={toggleTheme}>
            <Text style={[styles.text, { color: theme.primary }]}>
              {isDark ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={localStyles.settingItem}
            onPress={item.onPress}
          >
            <View style={localStyles.settingLeft}>
              <Icon name={item.icon} size={24} color={theme.text} />
              <Text style={[styles.text, { marginLeft: 12 }]}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {user && (
        <View style={localStyles.section}>
          <TouchableOpacity
            style={[localStyles.logoutButton, { borderColor: theme.error }]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color={theme.error} />
            <Text style={[styles.text, { color: theme.error, marginLeft: 8 }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 20,
  },
  userInfo: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  subscriptionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
  },
});

export default ProfileScreen; 