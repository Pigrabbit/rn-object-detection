# rn-helmet-detector

카메라를 이용해 사진을 찍고, 사진 속 인물이 헬멧을 착용했는지를 detection하는 mobile application 입니다.

React Native를 이용하여 Android, iOS에서 모두 실행 가능합니다.

## Data Preparation

**Bike Helmet Dataset** 의 764장의 이미지와 PascalVOC format의 annotation을 사용했습니다.

Dataset은 [kaggle](https://www.kaggle.com/andrewmvd/helmet-detection) 을 통해 download 또는 import 할 수 있습니다.

## Training 

모바일 기기에서 추론시키기 위해 작고 빠른 *SSD MobileNet V2 320x320*을 선택했습니다.

COCO 2017 dataset으로 pre-trained된 weight를 이용해 initialize하는 transfer learning 방법을 이용했습니다.

## Exporting the model

tensorflowjs converter를 이용하면 training된 model을 json과 binary형태로 변환시킬 수 있습니다.

이 파일들을 React Native 프로젝트의 정적 파일로 넣어두고 빌드할 수도 있고, 저장소(github, s3) 등에 올려두고 Application에서 load할 수도 있습니다.

## Inference

React Native Applicatoin에서 훈련된 model을 load하고 inference 하기 위해서는 몇몇 패키지를 추가해야 합니다.

- [@tensorflow/tfjs](https://www.npmjs.com/package/@tensorflow/tfjs)
- [@tensoflow/tfjs-react-native](https://www.npmjs.com/package/@tensorflow/tfjs-react-native)
- expo-gl
- expo-gl-cpp
- expo-camera
- react-native-fs
- async-storage

expo를 이용하지 않는 React Native 프로젝트의 경우 추가로 [react-native-unimodule](https://docs.expo.io/bare/installing-unimodules/) 의 설치가 필요합니다.

## Blog Post

프로젝트에 대한 더 자세한 설명은 아래 블로그 포스트를 참조해주세요.

[deploying-deep-learning-model-with-react-native](https://pigrabbit.github.io/deploying-deep-learning-model-with-react-native)
