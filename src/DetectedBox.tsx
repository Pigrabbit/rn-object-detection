import React from 'react';
import {Text, View} from 'react-native';
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  score: string;
  label: string;
}
export const DetectedBox: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  score,
  label,
}) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderColor: label === 'With Helmet' ? '#00ffff' : '#f78f04',
        borderWidth: 4,
        zIndex: 1,
      }}>
      <View
        style={{
          backgroundColor: label === 'With Helmet' ? '#00ffff' : '#f78f04',
          transform: [{translateY: height}],
        }}>
        <Text style={{fontSize: 8, color: 'black', textAlign: 'center'}}>
          {label}
        </Text>
        <Text style={{fontSize: 8, color: 'black', textAlign: 'center'}}>{`${(
          parseFloat(score) * 100
        ).toFixed(2)}%`}</Text>
      </View>
    </View>
  );
};
