import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ListaPreciosModal from '../components/ListaPreciosModal';
import { getListasPrecios, createListaPrecios, updateListaPrecios, deleteListaPrecios, ListaPrecios } from '../services/listaPreciosService';

export default function ListaPreciosScreen() {
  const [data, setData] = useState<ListaPrecios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ListaPrecios | null>(null);

  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getListasPrecios();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: ListaPrecios) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    // Ideally add confirmation dialog here, but keeping it simple for the demo
    try {
      await deleteListaPrecios(id);
      Toast.show({
        type: 'success',
        text1: 'Eliminado',
        text2: 'El registro se ha eliminado correctamente.'
      });
      fetchData(); // reload
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error eliminando el registro'
      });
    }
  };

  const handleSave = async (item: ListaPrecios) => {
    try {
      if (item.ID_LISTA_PRECIOS) {
        await updateListaPrecios(item.ID_LISTA_PRECIOS, item);
      } else {
        await createListaPrecios(item);
      }
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Guardado',
        text2: 'El registro se ha guardado correctamente.'
      });
      fetchData();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error guardando el registro'
      });
    }
  };

  // Metrics calculation
  const total = data.length;
  const now = new Date();
  const vigentes = data.filter(d => {
    if (!d.FECHA_DESDE || !d.FECHA_HASTA) return false;
    const from = new Date(d.FECHA_DESDE);
    const to = new Date(d.FECHA_HASTA);
    return now >= from && now <= to;
  }).length;
  const expiradas = total - vigentes;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 15 }]}>
        <View>
          <Text style={styles.title}>Listas de Precios</Text>
          <Text style={styles.subtitle}>Gestión y seguimiento de listas de precios</Text>
        </View>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleCreateNew}>
          <FontAwesome5 name="plus" color="#fff" size={14} style={{ marginRight: 8 }} />
          <Text style={styles.btnPrimaryText}>Nueva Lista</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total listas</Text>
            <Text style={styles.metricValue}>{total}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Vigentes</Text>
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>{vigentes}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Expiradas</Text>
            <Text style={[styles.metricValue, { color: '#F44336' }]}>{expiradas}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#C8960C" style={{ marginTop: 50 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : isMobile ? (
          <ScrollView style={styles.list}>
            {data.map(item => <MobileCard key={item.ID_LISTA_PRECIOS} item={item} onEdit={handleEdit} onDelete={handleDelete} />)}
          </ScrollView>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Nombre</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Moneda</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Desde</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Hasta</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Estado</Text>
              <Text style={[styles.tableHeaderText, { width: 100, textAlign: 'center' }]}>Acciones</Text>
            </View>
            <ScrollView style={styles.tableBody}>
              {data.map(item => <DesktopRow key={item.ID_LISTA_PRECIOS} item={item} onEdit={handleEdit} onDelete={handleDelete} />)}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Modal */}
      <ListaPreciosModal
        visible={modalVisible}
        listaPrecios={editingItem}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

// Helper to determine status pill
const getStatus = (item: ListaPrecios) => {
  if (!item.FECHA_DESDE || !item.FECHA_HASTA) return { label: 'Indefinida', color: '#888', bg: '#eee' };
  const from = new Date(item.FECHA_DESDE);
  const to = new Date(item.FECHA_HASTA);
  const now = new Date();
  const isValid = now >= from && now <= to;
  return isValid 
    ? { label: 'Vigente', color: '#2e7d32', bg: '#e8f5e9' }
    : { label: 'Expirada', color: '#c62828', bg: '#ffebee' };
};

const MobileCard = ({ item, onEdit, onDelete }: { item: ListaPrecios, onEdit: (i: ListaPrecios)=>void, onDelete: (id: number)=>void }) => {
  const status = getStatus(item);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.NOMBRE_LISTA_PRECIOS}</Text>
        <View style={[styles.pill, { backgroundColor: status.bg }]}>
          <Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.cardText}>Moneda: {item.ID_MONEDA || 'N/A'}</Text>
      <Text style={styles.cardText}>Vigencia: {item.FECHA_DESDE ? item.FECHA_DESDE.split('T')[0] : '-'} a {item.FECHA_HASTA ? item.FECHA_HASTA.split('T')[0] : '-'}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}><FontAwesome5 name="pen" size={16} color="#0a7ea4" /></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => item.ID_LISTA_PRECIOS && onDelete(item.ID_LISTA_PRECIOS)}><FontAwesome5 name="trash" size={16} color="#D8000C" /></TouchableOpacity>
      </View>
    </View>
  );
};

const DesktopRow = ({ item, onEdit, onDelete }: { item: ListaPrecios, onEdit: (i: ListaPrecios)=>void, onDelete: (id: number)=>void }) => {
  const status = getStatus(item);
  return (
    <View style={styles.row}>
      <Text style={[styles.rowText, { flex: 2, fontWeight: '500' }]}>{item.NOMBRE_LISTA_PRECIOS}</Text>
      <Text style={[styles.rowText, { flex: 1 }]}>{item.ID_MONEDA || 'N/A'}</Text>
      <Text style={[styles.rowText, { flex: 1 }]}>{item.FECHA_DESDE ? item.FECHA_DESDE.split('T')[0] : '-'}</Text>
      <Text style={[styles.rowText, { flex: 1 }]}>{item.FECHA_HASTA ? item.FECHA_HASTA.split('T')[0] : '-'}</Text>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
        <View style={[styles.pill, { backgroundColor: status.bg }]}>
          <Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <View style={[styles.rowActions, { width: 100 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}><FontAwesome5 name="pen" size={16} color="#0a7ea4" /></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => item.ID_LISTA_PRECIOS && onDelete(item.ID_LISTA_PRECIOS)}><FontAwesome5 name="trash" size={16} color="#D8000C" /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: '#C8960C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsScroll: {
    gap: 15,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    minWidth: 150,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
  },
  errorText: {
    color: '#D8000C',
    textAlign: 'center',
    marginTop: 50,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderColor: '#eee',
    gap: 15,
  },
  table: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontWeight: '600',
    color: '#555',
    fontSize: 14,
  },
  tableBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 14,
    color: '#333',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconBtn: {
    padding: 5,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
