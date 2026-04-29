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
        <TouchableOpacity style={styles.btnPrimary} onPress={onButtonPress} activeOpacity={0.8}>
          <View style={styles.iconBox}>
            <FontAwesome5 name={buttonIcon || 'plus'} color="#fff" size={10} />
          </View>
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
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: Colors.text,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
});
