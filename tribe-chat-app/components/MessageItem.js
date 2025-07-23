// ...existing code...
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';
import ReactionRow from './ReactionRow';

/**
 * Extracts the participant's name, avatar URL, and a flag indicating if the participant is the current user from a message object.
 * @param {Object} message - The message object containing participant information.
 * @return {Object} An object with `name`, `avatar`, and `isYou` properties.
 */
function extractParticipantInfo(message) {
  return {
    name: message.participant?.name || 'Unknown',
    avatar: message.participant?.avatar || undefined,
    isYou: message.participant?.uuid === 'you',
  };
}

/**
 * Extracts and formats the timestamp from a message object.
 * @param {Object} message - The message object containing possible timestamp fields.
 * @return {string} The localized time string if a valid timestamp is found, the raw value as a string if invalid, or an empty string if no timestamp exists.
 */
function extractTimestamp(message) {
  let rawTime = message.sentAt || message.time || message.createdAt || message.timestamp || '';
  if (rawTime) {
    const date = new Date(Number(rawTime));
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString();
    } else {
      return String(rawTime);
    }
  }
  return '';
}

/**
 * Extracts the text content from a message object.
 * If the text content is an object, returns its JSON string representation.
 * @param {Object} message - The message object containing text or content fields.
 * @return {string} The extracted text content as a string.
 */
function extractTextContent(message) {
  let text = message.text || message.content || '';
  if (typeof text === 'object') {
    return JSON.stringify(text);
  }
  return text;
}

/**
 * Extracts image URL and dimensions from a message object.
 * @param {object} message - The message object containing possible image data.
 * @return {{image: string|undefined, imageWidth: number, imageHeight: number}} An object with the image URL (if found), width, and height.
 */
function extractImageInfo(message) {
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
  return { image, imageWidth, imageHeight };
}

/**
 * Determines whether a message has been edited by comparing its sent and updated timestamps.
 * @param {Object} message - The message object containing `sentAt` and `updatedAt` fields.
 * @return {boolean} True if the message was edited after being sent; otherwise, false.
 */
function isMessageEdited(message) {
  const sentAt = Number(message.sentAt);
  const updatedAt = Number(message.updatedAt);
  return (!isNaN(sentAt) && !isNaN(updatedAt) && updatedAt > sentAt);
}

const MessageItem = ({ message, showHeader = true, reducedMargin = false, onParticipantPress }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { name, avatar, isYou } = extractParticipantInfo(message);
  const time = extractTimestamp(message);
  const text = extractTextContent(message);
  const reactions = message.reactions || message.reaction || [];
  const { image, imageWidth, imageHeight } = extractImageInfo(message);
  const edited = isMessageEdited(message);

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
            <TouchableOpacity onPress={() => onParticipantPress && onParticipantPress(message.participant)}>
              <Text style={styles.name}>{name}</Text>
            </TouchableOpacity>
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
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={styles.modalImageContainer} onPress={() => setModalVisible(false)}>
                <Image source={{ uri: image }} style={styles.modalImage} />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    width: '100%',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 12,
    alignSelf: 'center',
  },
});

export default MessageItem;

