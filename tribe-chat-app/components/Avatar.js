// Shows participant avatar.

import React, { useState } from 'react';
import { Image } from 'react-native';

const getFallbackAvatarUrl = (name) => {
  const safeName = name ? encodeURIComponent(name) : 'User';
  return `https://ui-avatars.com/api/?name=${safeName}&background=cccccc&color=222222&size=64`;
};

const Avatar = ({ uri, name }) => {
  const [error, setError] = useState(false);
  // If uri is missing or error, use ui-avatars fallback
  const source = !uri || error ? { uri: getFallbackAvatarUrl(name) } : { uri };
  return (
    <Image
      source={source}
      style={{ width: 32, height: 32, borderRadius: 16 }}
      onError={() => setError(true)}
    />
  );
};

export default Avatar;
