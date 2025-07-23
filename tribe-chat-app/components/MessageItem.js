const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '85%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 1,
    overflow: 'hidden', // Prevent content from overflowing
  },
  rightContainer: {
    backgroundColor: '#e6f7ff', // Light blue for 'you'
    alignSelf: 'flex-end',
  },
  leftContainer: {
    backgroundColor: '#fff', // Default for others
    alignSelf: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    flexWrap: 'nowrap',
    flexShrink: 1,
  },
  headerText: {
    marginLeft: 8,
    minWidth: 0,
    flexShrink: 1,
    flexDirection: 'column',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  edited: {
    fontSize: 12,
    color: '#e67e22',
    marginLeft: 0,
  },
  text: {
    fontSize: 16,
    marginBottom: 12, // More space below text for reactions
    flexWrap: 'wrap',
    wordBreak: 'break-word',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginVertical: 6,
    alignSelf: 'center',
  },
});
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import ReactionRow from './ReactionRow';

// Renders a single message in the chat.
const MessageItem = ({ message }) => {

  // Use enriched participant info
  const name = message.participant?.name || 'Unknown';
  const avatar = message.participant?.avatar || undefined;
  let rawTime = message.sentAt || message.time || message.createdAt || message.timestamp || '';
  let time = '';
  if (rawTime) {
    const date = new Date(Number(rawTime));
    if (!isNaN(date.getTime())) {
      time = date.toLocaleTimeString();
    } else {
      time = String(rawTime);
    }
  }
  let text = message.text || message.content || '';
  if (typeof text === 'object') {
    text = JSON.stringify(text);
  }
  const reactions = message.reactions || message.reaction || [];
  const image = message.image || message.imageUrl || undefined;
  // Show edited indicator if updatedAt > sentAt
  const sentAt = Number(message.sentAt);
  const updatedAt = Number(message.updatedAt);
  const edited = (!isNaN(sentAt) && !isNaN(updatedAt) && updatedAt > sentAt);

  // Determine if this is a message from 'you'
  const isYou = message.participant?.uuid === 'you';
  const containerStyle = [
    styles.container,
    isYou ? styles.rightContainer : styles.leftContainer
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.header}>
        <Avatar uri={avatar} name={name} />
        <View style={styles.headerText}> 
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.time}>{time}</Text>
          {edited && <Text style={styles.edited}>(edited)</Text>}
        </View>
      </View>
      <Text style={styles.text}>{text}</Text>
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
      <View style={{ minHeight: 32, marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        <ReactionRow reactions={reactions} />
      </View>
    </View>
  );
};
export default MessageItem;

