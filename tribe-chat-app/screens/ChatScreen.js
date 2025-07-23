import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MessageItem from '../components/MessageItem';
import MessageInputBar from '../components/MessageInputBar';
import useChatStore from '../store/chatStore';

const INITIAL_PADDING = 24; // Padding before keyboard is ever opened
const SMALL_PADDING = 4;    // Minimal gap after keyboard closes (adjust if needed)

const ChatScreen = () => {
  const { messages, fetchAndSetMessages } = useChatStore();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [hasOpenedKeyboard, setHasOpenedKeyboard] = useState(false);

  useEffect(() => {
    fetchAndSetMessages();

    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setHasOpenedKeyboard(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Calculate padding for input bar
  let bottomPadding;
  if (Platform.OS === 'ios') {
    bottomPadding = insets.bottom;
  } else if (keyboardVisible) {
    bottomPadding = 0;
  } else if (!hasOpenedKeyboard) {
    bottomPadding = INITIAL_PADDING;
  } else {
    bottomPadding = SMALL_PADDING;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            {messages.length === 0 ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 32 }} />
            ) : (
              <FlatList
                data={messages}
                keyExtractor={item => item.id || item.uuid}
                renderItem={({ item }) => <MessageItem message={item} />}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="always"
              />
            )}
          </View>
          <View style={[
            styles.inputBarWrapper,
            { paddingBottom: bottomPadding }
          ]}>
            <MessageInputBar />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingTop: 32,
  },
  list: {
    flex: 1,
    paddingHorizontal: 8,
  },
  inputBarWrapper: {
    backgroundColor: '#fff',
  },
});

export default ChatScreen;