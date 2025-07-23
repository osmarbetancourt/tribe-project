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
  Text,
  Modal,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MessageItem from '../components/MessageItem';
import MessageInputBar from '../components/MessageInputBar';
import Avatar from '../components/Avatar';
import DateSeparator from '../components/DateSeparator';
import useChatStore from '../store/chatStore';

const PADDING_BEFORE_KEYBOARD_OPEN = 24; // Padding before keyboard is ever opened
const PADDING_AFTER_KEYBOARD_CLOSE = 4;  // Minimal gap after keyboard closes (adjust if needed)

const ChatScreen = () => {
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);
  const [firstVisibleUuid, setFirstVisibleUuid] = useState(null);
  const { messages, fetchAndSetMessages, loadOlderMessages } = useChatStore();
  const flatListRef = React.useRef(null);
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [hasOpenedKeyboard, setHasOpenedKeyboard] = useState(false);
  // State for participant sheet
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantSheet, setShowParticipantSheet] = useState(false);

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
    bottomPadding = PADDING_BEFORE_KEYBOARD_OPEN;
  } else {
    bottomPadding = PADDING_AFTER_KEYBOARD_CLOSE;
  }

  // Ref to track scroll retry count for FlatList
  const scrollRetryCountRef = React.useRef(0);
  const MAX_SCROLL_RETRIES = 3;

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
                  // Retry scrolling after a short delay, with bounds and retry limit
                  if (
                    typeof index === 'number' &&
                    index >= 0 &&
                    index < messages.length &&
                    scrollRetryCountRef.current < MAX_SCROLL_RETRIES
                  ) {
                    scrollRetryCountRef.current += 1;
                    setTimeout(() => {
                      if (flatListRef.current) {
                        flatListRef.current.scrollToIndex({ index, animated: false });
                      }
                    }, 100);
                  } else {
                    scrollRetryCountRef.current = 0; // Reset after giving up
                  }
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
                  return (
                    <MessageItem
                      message={item}
                      onParticipantPress={participant => {
                        setSelectedParticipant(participant);
                        setShowParticipantSheet(true);
                      }}
                    />
                  );
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
          {/* Participant details bottom sheet/modal */}
          <Modal
            visible={showParticipantSheet}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowParticipantSheet(false)}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                {selectedParticipant && (
                  <>
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                      <Avatar uri={selectedParticipant.avatar} name={selectedParticipant.name} />
                      <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>{selectedParticipant.name}</Text>
                    </View>
                    {/* Add more participant details here if available */}
                  </>
                )}
                <TouchableOpacity onPress={() => setShowParticipantSheet(false)}>
                  <Text style={{ color: '#007AFF', marginTop: 16, textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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