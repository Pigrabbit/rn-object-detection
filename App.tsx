/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs';
import {
  bundleResourceIO,
  decodeJpeg,
  fetch,
} from '@tensorflow/tfjs-react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {CameraContainer} from './src/CameraContainer';
import {DetectedObject} from './src/Context';
import {ControlPanel} from './src/ControlPanel';
import {DetectedBox} from './src/DetectedBox';
import {Header} from './src/Header';

declare const global: {HermesInternal: null | {}};

const modelJSON = require('./assets/model_v3/model.json');
const modelWeights = [
  require('./assets/model_v3/group1-shard1of5.bin'),
  require('./assets/model_v3/group1-shard2of5.bin'),
  require('./assets/model_v3/group1-shard3of5.bin'),
  require('./assets/model_v3/group1-shard4of5.bin'),
  require('./assets/model_v3/group1-shard5of5.bin'),
];

const threshold = 0.5;
const classesDir = {
  1: {
    name: 'With Helmet',
    id: 1,
  },
  2: {
    name: 'Without Helmet',
    id: 2,
  },
};
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth;

const App = () => {
  const [predictedResult, setPredictedResult] = useState<{
    boxes: number[][][];
    scores: number[][];
    classes: Int32Array;
  }>({boxes: [[[]]], scores: [[]], classes: new Int32Array()});
  const [detectionObjects, setDetectionObjects] = useState<
    {
      bbox: number[];
      class: number;
      label: string;
      score: string;
    }[]
  >([]);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);
  const [isInferencing, setIsInferencing] = useState(false);
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  const cameraRef = useRef();

  const inference = useCallback(
    async (imageTensor: tf.Tensor3D) => {
      if (!model) return;
      if (!imageTensor || isInferencing) return;
      try {
        tf.engine().startScope();
        console.log('inference begin');
        const startTime = new Date().getTime();

        const predictions: tf.Tensor<tf.Rank>[] = (await model.executeAsync(
          imageTensor.transpose([0, 1, 2]).expandDims(),
        )) as tf.Tensor<tf.Rank>[];

        const endTime = new Date().getTime();
        console.log(`inference end, ETC: ${endTime - startTime}ms`);

        const boxes = predictions[5].arraySync() as number[][][];
        const scores = predictions[1].arraySync() as number[][];
        const classes = predictions[0].dataSync() as Int32Array;

        setPredictedResult({boxes, scores, classes});
      } catch (error) {
        Alert.alert('', error, [{text: 'close', onPress: () => null}]);
      } finally {
        tf.engine().endScope();
        setIsInferencing(false);
      }
    },
    [isInferencing, model],
  );

  const onRefreshButtonPress = () => {
    setImageUri(null);
    setDetectionObjects([]);
    setPredictedResult({
      boxes: [[[]]],
      scores: [[]],
      classes: new Int32Array(),
    });
  };

  const onShootButtonPress = async () => {
    if (
      cameraRef.current &&
      cameraRef.current.getStatus() === 'READY' &&
      isReadyToCapture
    ) {
      setIsReadyToCapture(false);
      const data = await cameraRef.current.takePictureAsync({
        width: 1080,
        quality: 0.8,
        fixOrientation: true,
      });
      setIsReadyToCapture(true);
      setImageUri(data.uri);
    }
  };

  const onInferenceButtonPress = async () => {
    if (!imageUri) return;
    setIsInferencing(true);

    const response = await fetch(imageUri, {}, {isBinary: true});
    const imageDataArrayBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(imageDataArrayBuffer);
    const imageTensor = decodeJpeg(imageData);
    await inference(imageTensor);
  };

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await loadGraphModel(
          bundleResourceIO(modelJSON, modelWeights),
        );
        setModel(loadedModel);
      } catch (error) {
        Alert.alert('', error, [{text: 'close', onPress: () => null}]);
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (!predictedResult || !predictedResult.scores) return;

    const {boxes, scores, classes} = predictedResult;
    const currentDetectionObjects: DetectedObject[] = [];

    scores[0].forEach((score, idx) => {
      if (score > threshold) {
        console.log('above threshold', score);
        const bbox = [];
        const minY = boxes[0][idx][0] * imageWidth;
        const minX = boxes[0][idx][1] * imageWidth;
        const maxY = boxes[0][idx][2] * imageWidth;
        const maxX = boxes[0][idx][3] * imageWidth;
        bbox[0] = minX;
        bbox[1] = minY;
        bbox[2] = maxX - minX;
        bbox[3] = maxY - minY;

        currentDetectionObjects.push({
          class: classes[idx],
          label: classesDir[classes[idx]].name,
          score: score.toFixed(4),
          bbox: bbox,
        });
      }
    });

    console.log(currentDetectionObjects); // []
    setDetectionObjects(currentDetectionObjects);
  }, [predictedResult]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.body}>
          {imageUri === null && (
            <CameraContainer
              ref={cameraRef}
              onCameraReady={() => setIsReadyToCapture(true)}
            />
          )}
          {imageUri !== null && (
            <View style={styles.imageContainer}>
              {detectionObjects &&
                detectionObjects.map((obj, idx) => (
                  <DetectedBox
                    key={idx}
                    x={obj.bbox[0]}
                    y={obj.bbox[1]}
                    width={obj.bbox[2]}
                    height={obj.bbox[3]}
                    score={obj.score}
                    label={obj.label}
                  />
                ))}
              <Image source={{uri: imageUri}} style={styles.image} />
            </View>
          )}
          <ControlPanel
            imageUri={imageUri}
            isInferencing={isInferencing}
            model={model}
            onRefreshButtonPress={onRefreshButtonPress}
            onShootButtonPress={onShootButtonPress}
            onInferenceButtonPress={onInferenceButtonPress}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flex: 1,
  },
  body: {
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    justifyContent: 'center',
  },
  image: {
    width: imageWidth,
    height: imageWidth,
  },
});

export default App;
