// Main chat screen. Will display the list of messages and input bar.
import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import MessageItem from '../components/MessageItem';
import MessageInputBar from '../components/MessageInputBar';
import useChatStore from '../store/chatStore';

const ChatScreen = () => {
  const { messages, fetchAndSetMessages } = useChatStore();

  useEffect(() => {
    fetchAndSetMessages();
  }, []);

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id || item.uuid}
          renderItem={({ item }) => <MessageItem message={item} />}
          style={styles.list}
        />
      )}
      <MessageInputBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 32,
  },
  list: {
    flex: 1,
    paddingHorizontal: 8,
  },
});

export default ChatScreen;
