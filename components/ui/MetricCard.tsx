import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout } from '../../constants/layout';

type MetricCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  backgroundColor?: string;
  labelColor?: string;
  valueColor?: string;
  subtextColor?: string;
};

export default function MetricCard({
  label,
  value,
  subtext,
  backgroundColor = '#fff',
  labelColor = '#888',
  valueColor = '#1a1a1a',
  subtextColor = '#aaa',
}: MetricCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      {subtext ? (
        <Text style={[styles.subtext, { color: subtextColor }]}>{subtext}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Layout.spacing.large,
    borderRadius: 14,
    minWidth: 170,
    marginRight: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontWeight: '500',
  },
  value: {
    fontSize: 32,
    fontWeight: '500',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 12,
  },
});
