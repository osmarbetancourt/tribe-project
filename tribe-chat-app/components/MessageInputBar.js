// Input bar for sending new messages.
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { sendMessage } from '../utils/api';
import useChatStore from '../store/chatStore';

const MessageInputBar = () => {
  const [input, setInput] = useState('');
  const { fetchAndSetMessages, participants } = useChatStore();
  const [sending, setSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [sendError, setSendError] = useState('');

  // Detect @mention trigger and filter participants
  React.useEffect(() => {
    const match = input.match(/@([\w ]*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1].toLowerCase());
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  }, [input]);

  const filteredParticipants = showMentions
    ? participants.filter(p => p.name && p.name.toLowerCase().includes(mentionQuery))
    : [];

  const handleMentionSelect = (name) => {
    // Replace last @mention with selected name wrapped in delimiters for precise highlighting
    setInput(prev => prev.replace(/@([\w ]*)$/, `@[[${name}]] `));
    setShowMentions(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    setSendError('');
    try {
      await sendMessage(input.trim());
      setInput('');
      await fetchAndSetMessages(); // Refresh messages after sending
    } catch (err) {
      setSendError(err.message || 'Failed to send message.');
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, position: 'relative' }}>
        <Autocomplete
          data={showMentions ? filteredParticipants : []}
          value={input}
          onChangeText={setInput}
          inputContainerStyle={styles.inputContainer}
          containerStyle={styles.autocompleteContainer}
          listContainerStyle={styles.listContainer}
          flatListProps={{
            keyExtractor: item => item.uuid,
            renderItem: ({ item }) => (
              <TouchableOpacity onPress={() => handleMentionSelect(item.name)} style={styles.mentionItem}>
                <Text style={styles.mentionText}>{item.name}</Text>
              </TouchableOpacity>
            ),
          }}
          placeholder="Type a message..."
          editable={!sending}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        {sendError ? (
          <Text style={styles.errorText}>{sendError}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.button, !input.trim() || sending ? { opacity: 0.5 } : {}]}
        onPress={handleSend}
        disabled={!input.trim() || sending}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  inputContainer: {
    flex: 1,
    height: 40,
    borderWidth: 0,
    backgroundColor: 'transparent',
    marginRight: 0,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  autocompleteContainer: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 2,
    maxHeight: 180,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mentionItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  mentionText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default MessageInputBar;
