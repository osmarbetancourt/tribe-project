import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatScreen from './screens/ChatScreen';

/**
 * Renders the main application component, providing safe area context for the ChatScreen.
 * Ensures that the ChatScreen is displayed within device-specific safe area boundaries.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ChatScreen />
    </SafeAreaProvider>
  );
}
