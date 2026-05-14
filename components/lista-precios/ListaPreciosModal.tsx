import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { ListaPrecios } from '../../services/listaPreciosService';

type Props = {
  visible: boolean;
  listaPrecios: ListaPrecios | null;
  onClose: () => void;
  onSave: (data: ListaPrecios) => void;
};

export default function ListaPreciosModal({ visible, listaPrecios, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [idMoneda, setIdMoneda] = useState('');

  useEffect(() => {
    if (listaPrecios) {
      setNombre(listaPrecios.NOMBRE_LISTA_PRECIOS || '');
      setFechaDesde(listaPrecios.FECHA_DESDE ? listaPrecios.FECHA_DESDE.split('T')[0] : '');
      setFechaHasta(listaPrecios.FECHA_HASTA ? listaPrecios.FECHA_HASTA.split('T')[0] : '');
      setIdMoneda(listaPrecios.ID_MONEDA ? listaPrecios.ID_MONEDA.toString() : '');
    } else {
      setNombre('');
      setFechaDesde('');
      setFechaHasta('');
      setIdMoneda('');
    }
  }, [listaPrecios, visible]);

  const handleSave = () => {
    if (!nombre.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El nombre es requerido'
      });
      return;
    }

    onSave({
      ID_LISTA_PRECIOS: listaPrecios?.ID_LISTA_PRECIOS,
      NOMBRE_LISTA_PRECIOS: nombre,
      FECHA_DESDE: fechaDesde || null,
      FECHA_HASTA: fechaHasta || null,
      ID_MONEDA: idMoneda ? parseInt(idMoneda) : null
    });
  };

  return (
    <Drawer 
      visible={visible} 
      onClose={onClose} 
      title={listaPrecios ? 'Editar Lista de Precios' : 'Nueva Lista de Precios'}
    >
      <View style={styles.formContainer}>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre de la Lista *</Text>
            <TextInput 
              style={styles.input} 
              value={nombre} 
              onChangeText={setNombre} 
              placeholder="Ej. Precios Mayoristas 2026"
            />
          </View>

          <View style={styles.row}>
            <DatePickerField
              label="Fecha Desde"
              value={fechaDesde}
              onChange={setFechaDesde}
              flex
            />
            <View style={{ width: 10 }} />
            <DatePickerField
              label="Fecha Hasta"
              value={fechaHasta}
              onChange={setFechaHasta}
              flex
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ID Moneda</Text>
            <TextInput 
              style={styles.input} 
              value={idMoneda} 
              onChangeText={setIdMoneda} 
              keyboardType="numeric"
              placeholder="Ej. 1"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
            <Text style={styles.btnSaveText}>Guardar Lista</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    display: 'flex',
  },
  scrollContent: {
    flex: 1,
    padding: Layout.spacing.large,
  },
  field: {
    marginBottom: Layout.spacing.large,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: Layout.borderWidth,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  footer: {
    padding: Layout.spacing.large,
    borderTopWidth: Layout.borderWidth,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: Layout.borderWidth,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  btnCancelText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  btnSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
