import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth;

interface Props {
  onCameraReady: () => void;
}

export const CameraContainer = React.forwardRef<RNCamera, Props>(({ onCameraReady }, ref) => {
  return (
    <View style={styles.cameraContainer}>
      <RNCamera
        ref={ref}
        ratio={'1:1'}
        style={{ width: imageWidth, height: imageWidth }}
        flashMode={'off'}
        useNativeZoom={true}
        captureAudio={false}
        playSoundOnCapture={false}
        onCameraReady={onCameraReady}
        androidCameraPermissionOptions={{
          title: 'Access to camera',
          message: 'Allow this app to access camera to take photo',
          buttonPositive: 'accept',
          buttonNegative: 'deny',
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  cameraContainer: {
    justifyContent: 'center',
  },
});
