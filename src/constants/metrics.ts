import { Dimensions } from 'react-native';
import { LabelMap } from '../types';

export const modelJSON = require('../assets/model_v3/model.json');
export const modelWeights = [
  require('../assets/model_v3/group1-shard1of5.bin'),
  require('../assets/model_v3/group1-shard2of5.bin'),
  require('../assets/model_v3/group1-shard3of5.bin'),
  require('../assets/model_v3/group1-shard4of5.bin'),
  require('../assets/model_v3/group1-shard5of5.bin'),
];

export const threshold = 0.5;
export const classesDir: Record<number, LabelMap> = {
  1: {
    name: 'With Helmet',
    id: 1,
  },
  2: {
    name: 'Without Helmet',
    id: 2,
  },
};

export const windowWidth = Dimensions.get('window').width;
