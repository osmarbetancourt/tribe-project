// Renders a single message in the chat.
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import ReactionRow from './ReactionRow';

const MessageItem = ({ message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={message.participant.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{message.participant.name}</Text>
          <Text style={styles.time}>{message.time}</Text>
        </View>
        {message.edited && <Text style={styles.edited}>(edited)</Text>}
      </View>
      <Text style={styles.text}>{message.text}</Text>
      {message.image && (
        <Image source={{ uri: message.image }} style={styles.image} />
      )}
      <ReactionRow reactions={message.reactions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {
    marginLeft: 8,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  edited: {
    fontSize: 12,
    color: '#e67e22',
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginVertical: 6,
  },
});

export default MessageItem;
