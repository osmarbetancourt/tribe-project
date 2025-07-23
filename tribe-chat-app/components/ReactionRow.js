// Shows reactions below a message.
import React from 'react';
import PropTypes from 'prop-types';
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

ReactionRow.propTypes = {
  reactions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        uuid: PropTypes.string,
      }),
      PropTypes.string,
      PropTypes.number,
    ])
  ),
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
