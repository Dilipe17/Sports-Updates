import React from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../../shared/theme.js';
import AppNavigator from './navigation/AppNavigator';
import FloatingChat from './components/FloatingChat';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Wrapper lets FloatingChat overlay absolutely above all screens */}
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          <AppNavigator />
        </NavigationContainer>

        {/* AI chat FAB + Modal — visible on every screen */}
        <FloatingChat />
      </View>
    </SafeAreaProvider>
  );
}
