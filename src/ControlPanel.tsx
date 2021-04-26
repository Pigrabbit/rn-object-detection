import React from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;

interface Props {
  imageUri: string | null;
  isInferencing: boolean;
  onRefreshButtonPress: () => void;
  onShootButtonPress: () => void;
  onInferenceButtonPress: () => void;
  model: unknown;
}

export const ControlPanel: React.FC<Props> = ({
  imageUri,
  onRefreshButtonPress,
  onShootButtonPress,
  onInferenceButtonPress,
  model,
  isInferencing,
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});
