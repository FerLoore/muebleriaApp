import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import SeguimientoEnvioModal from '../../components/seguimiento-envio/SeguimientoEnvioModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { SeguimientoEnvio, deleteSeguimientoEnvio, getSeguimientosEnvio } from '../../services/seguimientoEnvioService';

const ESTADO_COLOR: Record<string, string> = { P: '#9CA3AF', T: '#3B82F6', E: '#F59E0B', D: '#059669' };
const ESTADO_LABEL: Record<string, string> = { P: 'Pendiente', T: 'En Tránsito', E: 'En Entrega', D: 'Entregado' };
const ESTADO_ICON: Record<string, string>  = { P: 'clock', T: 'truck', E: 'box-open', D: 'check-circle' };

export default function SeguimientoEnvioScreen() {
  const [data, setData]         = useState<SeguimientoEnvio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalVisible, setModal]= useState(false);
  const [selected, setSelected] = useState<SeguimientoEnvio | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getSeguimientosEnvio()); }
    catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar seguimientos.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (item: SeguimientoEnvio) => {
    try {
      await deleteSeguimientoEnvio(item.ID_SEGUIMIENTO_ENVIO);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Seguimiento eliminado.' });
      fetchData();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar.' }); }
  };

  const filtered = data.filter(d =>
    String(d.ID_SEGUIMIENTO_ENVIO).includes(search) ||
    (d.DESCRIPCION_SEGUIMIENTO_ENVIO ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.UBICACION_SEGUIMIENTO_ENVIO  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.ESTADO_SEGUIMIENTO_ENVIO     ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setSelected(null); setModal(true); };
  const openEdit   = (item: SeguimientoEnvio) => { setSelected(item); setModal(true); };

  const countByEstado = (e: string) => data.filter(d => d.ESTADO_SEGUIMIENTO_ENVIO === e).length;

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View>
          <Text style={st.pageTitle}>Seguimiento Envío</Text>
          <Text style={st.pageSubtitle}>{data.length} registros</Text>
        </View>
        <TouchableOpacity style={st.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={st.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        {['T', 'E', 'D'].map(est => (
          <View key={est} style={st.summaryCard}>
            <FontAwesome5 name={ESTADO_ICON[est]} size={13} color={ESTADO_COLOR[est]} />
            <Text style={[st.summaryValue, { color: ESTADO_COLOR[est] }]}>{countByEstado(est)}</Text>
            <Text style={st.summaryLabel}>{ESTADO_LABEL[est]}</Text>
          </View>
        ))}
      </View>

      <View style={st.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="Buscar por descripción, ubicación o estado…" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><FontAwesome5 name="times" size={12} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={st.empty}><FontAwesome5 name="route" size={36} color={Colors.textMuted} /><Text style={st.emptyText}>Sin resultados</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_SEGUIMIENTO_ENVIO)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const est = item.ESTADO_SEGUIMIENTO_ENVIO ?? 'P';
            const color = ESTADO_COLOR[est] ?? '#9CA3AF';
            const icon  = ESTADO_ICON[est]  ?? 'circle';
            return (
              <View style={st.card}>
                <View style={[st.colorBar, { backgroundColor: color }]} />
                <View style={st.cardContent}>
                  <View style={st.cardRow}>
                    <View style={[st.avatar, { backgroundColor: color + '20' }]}>
                      <FontAwesome5 name={icon} size={14} color={color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={st.cardTitle} numberOfLines={1}>
                        {item.DESCRIPCION_SEGUIMIENTO_ENVIO ?? `Seguimiento #${item.ID_SEGUIMIENTO_ENVIO}`}
                      </Text>
                      <Text style={st.cardSub}>ID: {item.ID_SEGUIMIENTO_ENVIO}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: color + '20' }]}>
                      <Text style={[st.badgeText, { color }]}>{ESTADO_LABEL[est] ?? est}</Text>
                    </View>
                  </View>
                  <View style={st.chips}>
                    {!!item.FECHA_HORA_SEGUIMIENTO_ENVIO  && <Chip icon="calendar-alt"   label={item.FECHA_HORA_SEGUIMIENTO_ENVIO} />}
                    {!!item.UBICACION_SEGUIMIENTO_ENVIO   && <Chip icon="map-marker-alt" label={item.UBICACION_SEGUIMIENTO_ENVIO} />}
                    {item.ID_ENTREGA != null               && <Chip icon="box"            label={`Entrega: ${item.ID_ENTREGA}`} />}
                  </View>
                  <View style={st.actions}>
                    <TouchableOpacity style={st.btnEdit} onPress={() => openEdit(item)}>
                      <FontAwesome5 name="pen" size={11} color={Colors.primary} /><Text style={st.btnEditText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={st.btnDelete} onPress={() => handleDelete(item)}>
                      <FontAwesome5 name="trash" size={11} color="#DC2626" /><Text style={st.btnDeleteText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <SeguimientoEnvioModal visible={modalVisible} onClose={() => setModal(false)} item={selected} onSaved={() => { setModal(false); fetchData(); }} />
    </View>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 220 }}>
      <FontAwesome5 name={icon} size={9} color={Colors.textMuted} />
      <Text style={{ fontSize: 10, color: Colors.textMuted, fontWeight: '500' }} numberOfLines={1}>{label}</Text>
    </View>
  );
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
  avatar:       { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTitle:    { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:      { fontSize: 11, color: Colors.textMuted },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  badgeText:    { fontSize: 10, fontWeight: '600' },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions:      { flexDirection: 'row', gap: 8 },
  btnEdit:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:  { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText:{ color: '#DC2626', fontWeight: '600', fontSize: 11 },
});
