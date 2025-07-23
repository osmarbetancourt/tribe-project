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
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import ReactionRow from './ReactionRow';

// Renders a single message in the chat.
const MessageItem = ({ message }) => {

  // Fallbacks for API data
  const name = message.participant?.name || message.sender?.name || message.senderName || 'Unknown';
  const avatar = message.participant?.avatar || message.sender?.avatar || message.avatar || undefined;
  const time = message.time || message.createdAt || message.timestamp || '';
  // If text is an object or array, stringify it for safe rendering
  let text = message.text || message.content || '';
  if (typeof text === 'object') {
    text = JSON.stringify(text);
  }
  const reactions = message.reactions || message.reaction || [];
  const image = message.image || message.imageUrl || undefined;
  const edited = message.edited || message.isEdited || false;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        {edited && <Text style={styles.edited}>(edited)</Text>}
      </View>
      <Text style={styles.text}>{text}</Text>
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
      <ReactionRow reactions={reactions} />
    </View>
  );
};

export default MessageItem;

