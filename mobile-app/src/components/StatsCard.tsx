import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, createStyles } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.card, localStyles.container]}>
      <View style={localStyles.header}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={localStyles.value}>{value}</Text>
      <Text style={[styles.textSecondary, localStyles.title]}>{title}</Text>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    width: (width - 48) / 2,
    marginHorizontal: 0,
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StatsCard; 