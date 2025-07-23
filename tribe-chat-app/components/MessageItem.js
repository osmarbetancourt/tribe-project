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
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';
import ReactionRow from './ReactionRow';

// Renders a single message in the chat.
// Add showHeader prop to control avatar/name/time/edited rendering
const MessageItem = ({ message, showHeader = true, reducedMargin = false }) => {
  const [modalVisible, setModalVisible] = useState(false);

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
  // Find image from attachments if not present in image/imageUrl
  let image = message.image || message.imageUrl || undefined;
  let imageWidth = 120;
  let imageHeight = 120;
  if (!image && Array.isArray(message.attachments)) {
    const imgAttachment = message.attachments.find(att => att.type === 'image' && att.url);
    if (imgAttachment) {
      image = imgAttachment.url;
      imageWidth = imgAttachment.width || 120;
      imageHeight = imgAttachment.height || 120;
    }
  }
  // Show edited indicator if updatedAt > sentAt
  const sentAt = Number(message.sentAt);
  const updatedAt = Number(message.updatedAt);
  const edited = (!isNaN(sentAt) && !isNaN(updatedAt) && updatedAt > sentAt);

  // Determine if this is a message from 'you'
  const isYou = message.participant?.uuid === 'you';
  const containerStyle = [
    styles.container,
    isYou ? styles.rightContainer : styles.leftContainer,
    reducedMargin ? { marginVertical: 0.5 } : {},
  ];

  return (
    <View style={containerStyle}>
      {showHeader ? (
        <View style={styles.header}>
          <Avatar uri={avatar} name={name} />
          <View style={styles.headerText}> 
            <Text style={styles.name}>{name}</Text>
          </View>
        </View>
      ) : null}
      {/* Always show time below header */}
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.text}>{text}</Text>
      {image && (
        <>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={{ uri: image }} style={[styles.image, { width: imageWidth, height: imageHeight }]} />
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity style={{ flex: 1, width: '100%' }} onPress={() => setModalVisible(false)}>
                <Image source={{ uri: image }} style={{ width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 12, alignSelf: 'center' }} />
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}
      {reactions && reactions.length > 0 && (
        <View style={{ minHeight: 32, marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <ReactionRow reactions={reactions} />
        </View>
      )}
      {/* Show edited indicator at the bottom if edited */}
      {edited && <Text style={styles.edited}>(edited)</Text>}
    </View>
  );
};
export default MessageItem;

