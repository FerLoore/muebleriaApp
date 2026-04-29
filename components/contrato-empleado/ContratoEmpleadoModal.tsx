import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Drawer from '../ui/Drawer';
import { Layout } from '../../constants/layout';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ContratoEmpleadoModal({ visible, onClose }: Props) {
  return (
    <Drawer 
      visible={visible} 
      onClose={onClose} 
      title="Gestionar ContratoEmpleado"
    >
      <View style={styles.container}>
        <Text>Contenido de ContratoEmpleado</Text>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.large,
  }
});
