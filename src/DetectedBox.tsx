import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LabelMap } from './types';
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  score: string;
  label: LabelMap['name'];
}

export const DetectedBox: React.FC<Props> = ({ x, y, width, height, score, label }) => {
  const color = label === 'With Helmet' ? '#00ffff' : '#f78f04';
  return (
    <View style={[styles.boundingBox, { width, height, left: x, top: y, borderColor: color }]}>
      <View
        style={{
          backgroundColor: color,
          transform: [{ translateY: height }],
        }}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.labelText}>{`${(parseFloat(score) * 100).toFixed(2)}%`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boundingBox: {
    position: 'absolute',
    borderWidth: 4,
    zIndex: 1,
  },
  labelText: {
    fontSize: 8,
    color: 'black',
    textAlign: 'center',
  },
});
