// Shows participant avatar.
import React from 'react';
import { Image } from 'react-native';

const Avatar = ({ uri }) => {
  return (
    <Image source={{ uri }} style={{ width: 32, height: 32, borderRadius: 16 }} />
  );
};

export default Avatar;
