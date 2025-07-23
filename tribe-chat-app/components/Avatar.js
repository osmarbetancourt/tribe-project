// Shows participant avatar.

import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

// Avatar appearance constants
const AVATAR_BG = 'cccccc';
const AVATAR_COLOR = '222222';
const AVATAR_SIZE = 64;

const getFallbackAvatarUrl = (name, bg = AVATAR_BG, color = AVATAR_COLOR, size = AVATAR_SIZE) => {
  const safeName = name ? encodeURIComponent(name) : 'User';
  return `https://ui-avatars.com/api/?name=${safeName}&background=${bg}&color=${color}&size=${size}`;
};

const Avatar = ({ uri, name, bg = AVATAR_BG, color = AVATAR_COLOR, size = AVATAR_SIZE }) => {
  const [error, setError] = useState(false);
  // If uri is missing or error, use ui-avatars fallback
  const source = !uri || error ? { uri: getFallbackAvatarUrl(name, bg, color, size) } : { uri };
  return (
    <Image
      source={source}
      style={styles.avatar}
      onError={() => setError(true)}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default Avatar;
