export interface DetectedObject {
  bbox: number[];
  class: number;
  label: 'With Helmet' | 'Without Helmet';
  score: string;
}

export interface Prediction {
  boxes: number[][][];
  scores: number[][];
  classes: Int32Array;
}

export interface LabelMap {
  name: 'With Helmet' | 'Without Helmet';
  id: number;
}
