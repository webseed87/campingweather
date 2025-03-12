import React from "react";
import { View, StyleSheet } from "react-native";

const TabBarBackground = () => {
  return <View style={styles.background} />;
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "transparent", // Set background to transparent
  },
});

export default TabBarBackground;
