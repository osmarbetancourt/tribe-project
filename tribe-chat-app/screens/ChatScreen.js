// Main chat screen. Will display the list of messages and input bar.
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MessageItem from '../components/MessageItem';
import MessageInputBar from '../components/MessageInputBar';

const mockMessages = [
  {
    id: '1',
    text: 'Hello, world!',
    participant: { name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    time: '10:00 AM',
    reactions: ['👍', '😂'],
    image: null,
    edited: false,
  },
  {
    id: '2',
    text: 'Hi Alice!',
    participant: { name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    time: '10:01 AM',
    reactions: ['❤️'],
    image: 'https://placekitten.com/200/200',
    edited: true,
  },
];

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockMessages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        style={styles.list}
      />
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
