import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS, FONT_SIZE } from '../../../shared/theme.js';
import HomeScreen    from '../screens/HomeScreen';
import ScoresScreen  from '../screens/ScoresScreen';
import NewsScreen    from '../screens/NewsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ChatScreen    from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:     '🏠',
  Scores:   '🏆',
  News:     '📰',
  Schedule: '📅',
  Chat:     '🤖',
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:   { backgroundColor: COLORS.secondary },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: COLORS.secondary,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor:   COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 20 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabelStyle: { fontSize: FONT_SIZE.xs },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ title: 'Sports Hub' }} />
      <Tab.Screen name="Scores"   component={ScoresScreen}   />
      <Tab.Screen name="News"     component={NewsScreen}     />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Chat"     component={ChatScreen}     options={{ title: 'AI Assistant' }} />
    </Tab.Navigator>
  );
}
