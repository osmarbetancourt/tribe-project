// Shows reactions below a message.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReactionRow = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;
  return (
    <View style={styles.row}>
      {reactions.map((r, idx) => (
        <View key={r.uuid || idx} style={styles.bubble}>
          <Text style={styles.emoji}>{typeof r === 'object' ? r.value : r}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  bubble: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  emoji: {
    fontSize: 16,
  },
});

export default ReactionRow;
