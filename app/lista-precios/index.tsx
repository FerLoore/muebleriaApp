import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import StatusPill from '../../components/ui/StatusPill';
import DataTable, { ColumnDef } from '../../components/ui/DataTable';
import ListaPreciosModal from '../../components/lista-precios/ListaPreciosModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { getListasPrecios, createListaPrecios, updateListaPrecios, deleteListaPrecios, ListaPrecios } from '../../services/listaPreciosService';

export default function ListaPreciosScreen() {
  const [data, setData] = useState<ListaPrecios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ListaPrecios | null>(null);

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

  const handleDelete = async (item: ListaPrecios) => {
    if (!item.ID_LISTA_PRECIOS) return;
    try {
      await deleteListaPrecios(item.ID_LISTA_PRECIOS);
      Toast.show({
        type: 'success',
        text1: 'Eliminado',
        text2: 'El registro se ha eliminado correctamente.'
      });
      fetchData();
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

  const total = data.length;
  const now = new Date();
  const vigentes = data.filter(d => {
    if (!d.FECHA_DESDE || !d.FECHA_HASTA) return false;
    const from = new Date(d.FECHA_DESDE);
    const to = new Date(d.FECHA_HASTA);
    return now >= from && now <= to;
  }).length;
  const expiradas = total - vigentes;

  const getStatus = (item: ListaPrecios) => {
    if (!item.FECHA_DESDE || !item.FECHA_HASTA) return { label: 'Indefinida', colorText: Colors.status.defaultText, colorBg: Colors.status.defaultBg };
    const from = new Date(item.FECHA_DESDE);
    const to = new Date(item.FECHA_HASTA);
    const isValid = now >= from && now <= to;
    return isValid 
      ? { label: 'Vigente', colorText: Colors.status.activeText, colorBg: Colors.status.activeBg }
      : { label: 'Expirada', colorText: Colors.status.inactiveText, colorBg: Colors.status.inactiveBg };
  };

  const columns: ColumnDef<ListaPrecios>[] = [
    { key: 'NOMBRE_LISTA_PRECIOS', header: 'Nombre', flex: 2 },
    { key: 'ID_MONEDA', header: 'Moneda', flex: 1, renderCell: (item) => <Text style={{fontSize: 14}}>{item.ID_MONEDA || 'N/A'}</Text> },
    { key: 'FECHA_DESDE', header: 'Desde', flex: 1, renderCell: (item) => <Text style={{fontSize: 14}}>{item.FECHA_DESDE ? item.FECHA_DESDE.split('T')[0] : '-'}</Text> },
    { key: 'FECHA_HASTA', header: 'Hasta', flex: 1, renderCell: (item) => <Text style={{fontSize: 14}}>{item.FECHA_HASTA ? item.FECHA_HASTA.split('T')[0] : '-'}</Text> },
    { key: 'estado', header: 'Estado', flex: 1, renderCell: (item) => {
      const status = getStatus(item);
      return <StatusPill label={status.label} colorText={status.colorText} colorBg={status.colorBg} />;
    }}
  ];

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Listas de Precios" 
        subtitle="Gestión y seguimiento de listas de precios"
        buttonText="Nueva Lista"
        buttonIcon="plus"
        onButtonPress={handleCreateNew}
      />

      <View style={styles.metricsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
          <MetricCard label="Total listas" value={total} />
          <MetricCard label="Vigentes" value={vigentes} valueColor={Colors.success} />
          <MetricCard label="Expiradas" value={expiradas} valueColor={Colors.danger} />
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <DataTable<ListaPrecios> 
            data={data}
            columns={columns}
            keyExtractor={(item) => item.ID_LISTA_PRECIOS ? item.ID_LISTA_PRECIOS.toString() : Math.random().toString()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderMobileCard={(item, actions) => {
              const status = getStatus(item);
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.NOMBRE_LISTA_PRECIOS}</Text>
                    <StatusPill label={status.label} colorText={status.colorText} colorBg={status.colorBg} />
                  </View>
                  <Text style={styles.cardText}>Moneda: {item.ID_MONEDA || 'N/A'}</Text>
                  <Text style={styles.cardText}>Vigencia: {item.FECHA_DESDE ? item.FECHA_DESDE.split('T')[0] : '-'} a {item.FECHA_HASTA ? item.FECHA_HASTA.split('T')[0] : '-'}</Text>
                  <View style={styles.cardActions}>
                    {actions}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      <ListaPreciosModal
        visible={modalVisible}
        listaPrecios={editingItem}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.large,
  },
  metricsContainer: {
    marginBottom: Layout.spacing.large,
  },
  metricsScroll: {
    gap: Layout.spacing.medium,
  },
  contentContainer: {
    flex: 1,
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 50,
  },
  // Replicated classes from DataTable for mobile card rendering injected from top level
  card: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: Layout.borderRadius,
    marginBottom: 10,
    borderWidth: Layout.borderWidth,
    borderColor: Colors.border,
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
    color: Colors.text,
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: Layout.borderWidth,
    borderColor: '#eee',
    gap: 15,
  },
});
