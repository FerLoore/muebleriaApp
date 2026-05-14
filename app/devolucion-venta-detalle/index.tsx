import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import DevolucionVentaDetalleModal from '../../components/devolucion-venta-detalle/DevolucionVentaDetalleModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { DevolucionVentaDetalle, deleteDevolucionVentaDetalle, getDevolucionVentaDetalles } from '../../services/devolucionVentaDetalleService';

export default function DevolucionVentaDetalleScreen() {
  const [data, setData]         = useState<DevolucionVentaDetalle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalVisible, setModal]= useState(false);
  const [selected, setSelected] = useState<DevolucionVentaDetalle | null>(null);

  const fetch = async () => {
    setLoading(true);
    try { setData(await getDevolucionVentaDetalles()); }
    catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar los detalles.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: DevolucionVentaDetalle) => {
    try {
      await deleteDevolucionVentaDetalle(item.ID_DEVOLUCION_VENTA_DETALLE);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Detalle eliminado.' });
      fetch();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar.' }); }
  };

  const filtered = data.filter(d =>
    String(d.ID_DEVOLUCION_VENTA_DETALLE).includes(search) ||
    (d.ESTADO_DEVOLUCION_VENTA_DETALLE ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(d.ID_DEVOLUCION_VENTA ?? '').includes(search) ||
    String(d.ID_ARTICULO ?? '').includes(search)
  );

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View>
          <Text style={st.pageTitle}>Detalle Devolución Venta</Text>
          <Text style={st.pageSubtitle}>{data.length} registros</Text>
        </View>
        <TouchableOpacity style={st.btnNew} onPress={() => { setSelected(null); setModal(true); }}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={st.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        <View style={st.summaryCard}>
          <FontAwesome5 name="list-alt" size={13} color={Colors.primary} />
          <Text style={[st.summaryValue, { color: Colors.primary }]}>{data.length}</Text>
          <Text style={st.summaryLabel}>Total</Text>
        </View>
        <View style={[st.summaryCard, { flex: 2 }]}>
          <FontAwesome5 name="boxes" size={13} color="#7C3AED" />
          <Text style={[st.summaryValue, { color: '#7C3AED', fontSize: 14 }]}>
            {data.reduce((a, d) => a + (d.CANTIDAD_DEVOLUCION_VENTA_DETALLE ?? 0), 0)} uds
          </Text>
          <Text style={st.summaryLabel}>Cantidad Total</Text>
        </View>
      </View>

      <View style={st.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="Buscar por ID, estado o artículo…" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><FontAwesome5 name="times" size={12} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={st.empty}><FontAwesome5 name="list-alt" size={36} color={Colors.textMuted} /><Text style={st.emptyText}>Sin resultados</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_DEVOLUCION_VENTA_DETALLE)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={st.card}>
              <View style={[st.colorBar, { backgroundColor: Colors.primary }]} />
              <View style={st.cardContent}>
                <View style={st.cardRow}>
                  <View style={st.avatar}>
                    <Text style={st.avatarText}>#{item.ID_DEVOLUCION_VENTA_DETALLE}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={st.cardTitle}>Artículo ID: {item.ID_ARTICULO ?? '—'}</Text>
                    <Text style={st.cardSub}>Dev. Venta ID: {item.ID_DEVOLUCION_VENTA ?? '—'}</Text>
                  </View>
                  <View style={[st.badge, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={[st.badgeText, { color: '#7C3AED' }]}>{item.ESTADO_DEVOLUCION_VENTA_DETALLE ?? '—'}</Text>
                  </View>
                </View>
                <View style={st.chips}>
                  {item.CANTIDAD_DEVOLUCION_VENTA_DETALLE != null &&
                    <Chip icon="boxes" label={`Cant: ${item.CANTIDAD_DEVOLUCION_VENTA_DETALLE}`} />}
                </View>
                <View style={st.actions}>
                  <TouchableOpacity style={st.btnEdit} onPress={() => { setSelected(item); setModal(true); }}>
                    <FontAwesome5 name="pen" size={11} color={Colors.primary} /><Text style={st.btnEditText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.btnDelete} onPress={() => handleDelete(item)}>
                    <FontAwesome5 name="trash" size={11} color="#DC2626" /><Text style={st.btnDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
      <DevolucionVentaDetalleModal visible={modalVisible} onClose={() => setModal(false)} item={selected} onSaved={() => { setModal(false); fetch(); }} />
    </View>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
    <FontAwesome5 name={icon} size={9} color={Colors.textMuted} />
    <Text style={{ fontSize: 10, color: Colors.textMuted, fontWeight: '500' }} numberOfLines={1}>{label}</Text>
  </View>;
}

const st = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.large },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Layout.spacing.medium },
  pageTitle:    { fontSize: 20, fontWeight: '700', color: Colors.text },
  pageSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btnNew:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnNewText:   { color: '#fff', fontWeight: '600', fontSize: 13 },
  summaryRow:   { flexDirection: 'row', gap: 10, marginBottom: Layout.spacing.medium },
  summaryCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  summaryLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  searchWrapper:{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: Layout.spacing.medium },
  searchInput:  { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
  empty:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText:    { fontSize: 13, color: Colors.textMuted },
  card:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  colorBar:     { width: 4 },
  cardContent:  { flex: 1, padding: 14 },
  cardRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar:       { backgroundColor: '#EDE9FE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, justifyContent: 'center', alignItems: 'center' },
  avatarText:   { fontSize: 11, fontWeight: '700', color: '#7C3AED' },
  cardTitle:    { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:      { fontSize: 11, color: Colors.textMuted },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  badgeText:    { fontSize: 10, fontWeight: '600' },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  actions:      { flexDirection: 'row', gap: 8 },
  btnEdit:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:  { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText:{ color: '#DC2626', fontWeight: '600', fontSize: 11 },
});
