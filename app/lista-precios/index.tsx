import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import Svg, { Rect, Path, Line } from 'react-native-svg';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import StatusPill from '../../components/ui/StatusPill';
import DataTable, { ColumnDef } from '../../components/ui/DataTable';
import ListaPreciosModal from '../../components/lista-precios/ListaPreciosModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { getListasPrecios, createListaPrecios, updateListaPrecios, deleteListaPrecios, ListaPrecios } from '../../services/listaPreciosService';

// Ícono de lista (SVG) para columna Nombre
const ListIcon = () => (
  <View style={styles.nameIconBox}>
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Line x1="8" y1="6" x2="21" y2="6" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="8" y1="12" x2="21" y2="12" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="8" y1="18" x2="21" y2="18" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="3" y1="6" x2="3.01" y2="6" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="3" y1="12" x2="3.01" y2="12" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="3" y1="18" x2="3.01" y2="18" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  </View>
);

// Badge de moneda con punto dorado
const MonedaBadge = ({ id }: { id?: number | null }) => (
  <View style={styles.monedaBadge}>
    <View style={styles.monedaDot} />
    <Text style={styles.monedaText}>{id ? `GTQ` : 'N/A'}</Text>
  </View>
);

export default function ListaPreciosScreen() {
  const [data, setData] = useState<ListaPrecios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ListaPrecios | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getListasPrecios();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => { setEditingItem(null); setModalVisible(true); };
  const handleEdit = (item: ListaPrecios) => { setEditingItem(item); setModalVisible(true); };

  const handleDelete = async (item: ListaPrecios) => {
    if (!item.ID_LISTA_PRECIOS) return;
    try {
      await deleteListaPrecios(item.ID_LISTA_PRECIOS);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Registro eliminado correctamente.' });
      fetchData();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error eliminando el registro' });
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
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Registro guardado correctamente.' });
      fetchData();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error guardando el registro' });
    }
  };

  const now = new Date();
  const total = data.length;
  const vigentes = data.filter(d => {
    if (!d.FECHA_DESDE || !d.FECHA_HASTA) return false;
    return now >= new Date(d.FECHA_DESDE) && now <= new Date(d.FECHA_HASTA);
  }).length;
  const expiradas = total - vigentes;

  const getStatus = (item: ListaPrecios) => {
    if (!item.FECHA_DESDE || !item.FECHA_HASTA)
      return { label: 'Indefinida', colorText: Colors.status.defaultText, colorBg: Colors.status.defaultBg };
    const isValid = now >= new Date(item.FECHA_DESDE) && now <= new Date(item.FECHA_HASTA);
    return isValid
      ? { label: 'Vigente', colorText: Colors.status.activeText, colorBg: Colors.status.activeBg }
      : { label: 'Expirada', colorText: Colors.status.inactiveText, colorBg: Colors.status.inactiveBg };
  };

  const columns: ColumnDef<ListaPrecios>[] = [
    {
      key: 'NOMBRE_LISTA_PRECIOS', header: 'Nombre', flex: 2,
      renderCell: (item) => (
        <View style={styles.nameCell}>
          <ListIcon />
          <View>
            <Text style={styles.nameCellTitle}>{item.NOMBRE_LISTA_PRECIOS}</Text>
            <Text style={styles.nameCellId}>#{`LP-${String(item.ID_LISTA_PRECIOS ?? 0).padStart(3, '0')}`}</Text>
          </View>
        </View>
      )
    },
    {
      key: 'ID_MONEDA', header: 'Moneda', flex: 1,
      renderCell: (item) => <MonedaBadge id={item.ID_MONEDA} />
    },
    {
      key: 'FECHA_DESDE', header: 'Desde', flex: 1,
      renderCell: (item) => <Text style={styles.dateText}>{item.FECHA_DESDE ? item.FECHA_DESDE.split('T')[0] : '—'}</Text>
    },
    {
      key: 'FECHA_HASTA', header: 'Hasta', flex: 1,
      renderCell: (item) => <Text style={styles.dateText}>{item.FECHA_HASTA ? item.FECHA_HASTA.split('T')[0] : '—'}</Text>
    },
    {
      key: 'estado', header: 'Estado', flex: 1,
      renderCell: (item) => {
        const s = getStatus(item);
        return <StatusPill label={s.label} colorText={s.colorText} colorBg={s.colorBg} />;
      }
    },
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

      {/* Métricas con colores distintos */}
      <View style={styles.metricsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <MetricCard
            label="Total Listas"
            value={total}
            subtext="registros en sistema"
            backgroundColor="#1a1a1a"
            labelColor="rgba(255,255,255,0.5)"
            valueColor="#fff"
            subtextColor="rgba(255,255,255,0.35)"
          />
          <MetricCard
            label="Vigentes"
            value={vigentes}
            subtext="● activas ahora"
            backgroundColor={Colors.success}
            labelColor="rgba(255,255,255,0.7)"
            valueColor="#fff"
            subtextColor="rgba(255,255,255,0.6)"
          />
          <MetricCard
            label="Expiradas"
            value={expiradas}
            subtext="fuera de vigencia"
            backgroundColor={Colors.card}
            labelColor="#888"
            valueColor={Colors.danger}
            subtextColor="#ccc"
          />
        </ScrollView>
      </View>

      {/* Tabla */}
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <DataTable<ListaPrecios>
            data={data}
            columns={columns}
            keyExtractor={(item) => item.ID_LISTA_PRECIOS?.toString() ?? Math.random().toString()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            totalCount={total}
            renderMobileCard={(item, actions) => {
              const s = getStatus(item);
              return (
                <View style={styles.mobileCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={styles.nameCell}>
                      <ListIcon />
                      <View>
                        <Text style={styles.nameCellTitle}>{item.NOMBRE_LISTA_PRECIOS}</Text>
                        <Text style={styles.nameCellId}>#{`LP-${String(item.ID_LISTA_PRECIOS ?? 0).padStart(3, '0')}`}</Text>
                      </View>
                    </View>
                    <StatusPill label={s.label} colorText={s.colorText} colorBg={s.colorBg} />
                  </View>
                  <View style={styles.mobileCardRow}>
                    <MonedaBadge id={item.ID_MONEDA} />
                    <Text style={styles.dateText}>
                      {item.FECHA_DESDE ? item.FECHA_DESDE.split('T')[0] : '—'}  →  {item.FECHA_HASTA ? item.FECHA_HASTA.split('T')[0] : '—'}
                    </Text>
                  </View>
                  <View style={styles.mobileCardActions}>{actions}</View>
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
  contentContainer: {
    flex: 1,
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 50,
  },
  // Name cell
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameIconBox: {
    width: 34,
    height: 34,
    backgroundColor: Colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameCellTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  nameCellId: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  // Moneda badge
  monedaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 6,
  },
  monedaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  monedaText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  // Mobile card
  mobileCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  mobileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mobileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  mobileCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderColor: Colors.borderLight,
    gap: 8,
  },
});
