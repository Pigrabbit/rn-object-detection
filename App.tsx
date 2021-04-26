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
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {CameraContainer} from './src/CameraContainer';
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
    boxes: unknown;
    scores: unknown;
    classes: unknown;
  }>({boxes: null, scores: null, classes: null});
  const [detectionObjects, setDetectionObjects] = useState<
    {
      bbox: number[];
      class: number;
      label: string;
      score: string;
    }[]
  >([]);
  const [imageUri, setImageUri] = useState(null);
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);
  const [isInferencing, setIsInferencing] = useState(false);
  const [model, setModel] = useState<unknown>();

  const cameraRef = useRef();

  const inference = useCallback(
    async (imageTensor: tf.Tensor3D) => {
      if (!model) return;
      if (!imageTensor || isInferencing) return;
      try {
        tf.engine().startScope();
        console.log('inference begin');
        const startTime = new Date().getTime();

        const predictions: tf.Tensor<tf.Rank>[] = await model.executeAsync(
          imageTensor.transpose([0, 1, 2]).expandDims(),
        );

        const endTime = new Date().getTime();
        console.log(`inference end, ETC: ${endTime - startTime}ms`);

        const boxes = predictions[5].arraySync();
        const scores = predictions[1].arraySync();
        const classes = predictions[0].dataSync();

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
      boxes: null,
      scores: null,
      classes: null,
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
    // console.log(scores);
    // console.log(classes);
    // console.log(boxes);
    const currentDetectionObjects = [];

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
          <View style={styles.controlPanel}>
            <View style={styles.buttonList}>
              <Button
                title={'refresh'}
                disabled={!imageUri}
                onPress={onRefreshButtonPress}
              />
              <Button
                title={'shoot'}
                disabled={!!imageUri || !model}
                onPress={onShootButtonPress}
              />
              {isInferencing ? (
                <ActivityIndicator size={'large'} />
              ) : (
                <Button
                  title={'infer'}
                  disabled={!imageUri || isInferencing}
                  onPress={onInferenceButtonPress}
                />
              )}
            </View>
          </View>
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
  header: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
  body: {
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    justifyContent: 'center',
  },
  cameraContainer: {
    justifyContent: 'center',
  },
  image: {
    width: imageWidth,
    height: imageWidth,
  },
  controlPanel: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: windowWidth,
    paddingHorizontal: 24,
  },
  spinnerContainer: {
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
});

export default App;
