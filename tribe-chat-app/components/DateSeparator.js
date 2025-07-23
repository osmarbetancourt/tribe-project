import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const DateSeparator = ({ date }) => (
  <View
    style={separatorStyles.separatorContainer}
    accessibilityRole="text"
    accessibilityLabel={`Date separator: ${date}`}
  >
    <View style={separatorStyles.separatorLine} />
    <Text style={separatorStyles.separatorText}>{date}</Text>
    <View style={separatorStyles.separatorLine} />
  </View>
);

DateSeparator.propTypes = {
  date: PropTypes.string.isRequired,
};

const separatorStyles = StyleSheet.create({
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  separatorText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DateSeparator;
