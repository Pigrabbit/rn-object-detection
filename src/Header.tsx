import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export const Header = () => (
  <View style={styles.header}>
    <Text style={styles.title}>Helmet detection</Text>
    <Text style={styles.description}>done by react native</Text>
  </View>
);

const styles = StyleSheet.create({
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
});
