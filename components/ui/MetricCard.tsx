import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

type MetricCardProps = {
  label: string;
  value: string | number;
  valueColor?: string;
};

export default function MetricCard({ label, value, valueColor = Colors.text }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    padding: Layout.spacing.large,
    borderRadius: Layout.borderRadius,
    minWidth: 150,
    borderWidth: Layout.borderWidth,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});
