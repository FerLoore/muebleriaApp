import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonIcon?: string;
  onButtonPress?: () => void;
};

export default function PageHeader({ title, subtitle, buttonText, buttonIcon, onButtonPress }: PageHeaderProps) {
  return (
    <View style={[styles.header, Layout.isMobile && styles.headerMobile]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.btnPrimary} onPress={onButtonPress}>
          {buttonIcon && (
            <FontAwesome5 name={buttonIcon} color="#fff" size={14} style={{ marginRight: 8 }} />
          )}
          <Text style={styles.btnPrimaryText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.large,
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Layout.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
