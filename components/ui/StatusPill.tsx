import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusPillProps = {
  label: string;
  colorText: string;
  colorBg: string;
};

export default function StatusPill({ label, colorText, colorBg }: StatusPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: colorBg }]}>
      <Text style={[styles.pillText, { color: colorText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
