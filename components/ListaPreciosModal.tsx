import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Dimensions, ScrollView, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ListaPrecios } from '../services/listaPreciosService';

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
  
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

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

  const formContent = (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{listaPrecios ? 'Editar Lista de Precios' : 'Nueva Lista de Precios'}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <FontAwesome5 name="times" size={20} color="#666" />
        </TouchableOpacity>
      </View>

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
          <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Fecha Desde</Text>
            <TextInput 
              style={styles.input} 
              value={fechaDesde} 
              onChangeText={setFechaDesde} 
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Fecha Hasta</Text>
            <TextInput 
              style={styles.input} 
              value={fechaHasta} 
              onChangeText={setFechaHasta} 
              placeholder="YYYY-MM-DD"
            />
          </View>
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
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={isMobile ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, isMobile ? styles.mobileModal : styles.desktopDrawer]}>
          {formContent}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  modalContent: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  desktopDrawer: {
    width: 420,
    height: '100%',
    borderLeftWidth: 0.5,
    borderColor: '#ddd',
  },
  mobileModal: {
    width: '100%',
    height: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignSelf: 'flex-end',
  },
  formContainer: {
    flex: 1,
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  footer: {
    padding: 20,
    borderTopWidth: 0.5,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  btnCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  btnSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#C8960C',
    borderRadius: 6,
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
