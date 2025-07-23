import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Text
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MessageItem from '../components/MessageItem';
import MessageInputBar from '../components/MessageInputBar';
// DateSeparator component for rendering date separators in chat


const DateSeparator = ({ date }) => (
  <View style={[separatorStyles.separatorContainer, { marginTop: 16 }]}> {/* Add top margin for clarity */}
    <View style={separatorStyles.separatorLine} />
    <Text style={separatorStyles.separatorText}>{date}</Text>
    <View style={separatorStyles.separatorLine} />
  </View>
);

const separatorStyles = StyleSheet.create({
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  separatorText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
import useChatStore from '../store/chatStore';

const INITIAL_PADDING = 24; // Padding before keyboard is ever opened
const SMALL_PADDING = 4;    // Minimal gap after keyboard closes (adjust if needed)

const ChatScreen = () => {
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);
  const [firstVisibleUuid, setFirstVisibleUuid] = useState(null);
  const { messages, fetchAndSetMessages, loadOlderMessages } = useChatStore();
  const flatListRef = React.useRef(null);
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
                onScrollToIndexFailed={({ index, highestMeasuredFrameIndex, averageItemLength }) => {
                  // Retry scrolling after a short delay
                  setTimeout(() => {
                    if (flatListRef.current) {
                      flatListRef.current.scrollToIndex({ index, animated: false });
                    }
                  }, 100);
                }}
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id || item.uuid || item.date}
                renderItem={({ item, index }) => {
                  // Only show separator if not the first item
                  if (item.type === 'date-separator' && index !== 0) {
                    return <DateSeparator date={item.date} />;
                  }
                  if (item.type === 'date-separator') {
                    // Don't render separator before the first message
                    return null;
                  }
                  return <MessageItem message={item} />;
                }}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="always"
                onScroll={event => {
                  const { contentOffset } = event.nativeEvent;
                  if (contentOffset.y <= 0 && messages.length > 0) {
                    // Track the first visible message before loading older
                    setFirstVisibleUuid(messages[0].uuid || messages[0].id);
                    loadOlderMessages();
                  }
                }}
                onContentSizeChange={() => {
                  // After older messages are loaded, scroll to the previously first visible message
                  if (firstVisibleUuid && flatListRef.current) {
                    const idx = messages.findIndex(m => (m.uuid || m.id) === firstVisibleUuid);
                    if (idx !== -1) {
                      flatListRef.current.scrollToIndex({ index: idx, animated: false });
                      setFirstVisibleUuid(null);
                    }
                  }
                  // Scroll to bottom only once after initial hydration
                  if (!hasScrolledInitially && flatListRef.current && messages.length > 0) {
                    setTimeout(() => {
                      flatListRef.current.scrollToEnd({ animated: false });
                      setHasScrolledInitially(true);
                    }, 150);
                  }
                }}
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