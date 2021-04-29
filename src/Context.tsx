import * as tf from '@tensorflow/tfjs';

interface DetectedObject {
  bbox: number[];
  class: number;
  label: string;
  score: string;
}

type AppState = {
  imageUri: string | null;
  isInferencing: boolean;
  isReadyToCapture: boolean;
  model: tf.GraphModel | null;
  detectionObjects: DetectedObject[];
  predictedResult: {
    boxes: number[][][];
    scores: number[][];
    classes: number[];
  };
};
const initialState: AppState = {
  imageUri: null,
  isInferencing: false,
  isReadyToCapture: false,
  model: null,
  detectionObjects: [],
  predictedResult: {
    boxes: [[[]]],
    scores: [[]],
    classes: [],
  },
};

interface LoadTFModelAction {
  type: 'load/tf-model';
  payload: {model: tf.GraphModel};
}

interface RefreshImageAction {
  type: 'refresh/taken-image';
}

interface ShootButtonPressAction {
  type: 'press/shoot-button';
}

interface ImageTakenAction {
  type: 'take/image';
  payload: {
    imageUri: string;
  };
}

interface StartInferenceAction {
  type: 'start/inference';
}

interface EndInferenceAction {
  type: 'end/inference';
}

interface SetPredictedResultAction {
  type: 'set/predicted-result';
  payload: {
    boxes: number[][][];
    scores: number[][];
    classes: number[];
  };
}

interface ConvertToBoundingBoxAction {
  type: 'convert/bounding-box';
  payload: {
    detectionObjects: DetectedObject[];
  };
}

type AppContextAction =
  | LoadTFModelAction
  | RefreshImageAction
  | ShootButtonPressAction
  | ImageTakenAction
  | StartInferenceAction
  | EndInferenceAction
  | SetPredictedResultAction
  | ConvertToBoundingBoxAction;

const appReducer = (
  state = initialState,
  action: AppContextAction,
): AppState => {
  switch (action.type) {
    case 'load/tf-model':
      return {
        ...state,
        model: action.payload.model,
      };
    case 'refresh/taken-image':
      return {
        ...state,
        imageUri: null,
        detectionObjects: [],
        predictedResult: {
          boxes: [[[]]],
          scores: [[]],
          classes: [],
        },
      };
    case 'press/shoot-button':
      return {
        ...state,
        isReadyToCapture: false,
      };
    case 'take/image':
      return {
        ...state,
        isReadyToCapture: true,
        imageUri: action.payload.imageUri,
      };
    case 'start/inference':
      return {
        ...state,
        isInferencing: true,
      };
    case 'end/inference':
      return {
        ...state,
        isInferencing: false,
      };
    case 'set/predicted-result':
      return {
        ...state,
        predictedResult: {...action.payload},
      };
    case 'convert/bounding-box':
      return {
        ...state,
        detectionObjects: action.payload.detectionObjects,
      };
    default:
      return state;
  }
};
