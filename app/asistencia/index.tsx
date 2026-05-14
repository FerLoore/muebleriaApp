import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import AsistenciaModal from '../../components/asistencia/AsistenciaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Asistencia, deleteAsistencia, getAsistencias } from '../../services/asistenciaService';

function estadoConfig(estado: string | null) {
  switch (estado?.toUpperCase()) {
    case 'PRESENTE':  return { label: 'Presente',  color: '#059669', bg: '#ECFDF5', bar: '#10B981' };
    case 'AUSENTE':   return { label: 'Ausente',   color: '#DC2626', bg: '#FEF2F2', bar: '#EF4444' };
    case 'TARDANZA':  return { label: 'Tardanza',  color: '#D97706', bg: '#FEF3C7', bar: '#F59E0B' };
    case 'PERMISO':   return { label: 'Permiso',   color: '#2563EB', bg: '#EFF6FF', bar: '#3B82F6' };
    default:          return { label: estado ?? '—', color: '#6B7280', bg: '#F3F4F6', bar: '#D1D5DB' };
  }
}
function fmt(iso: string | null) { return iso ? iso.split('T')[0] : '—'; }
function fmtHora(iso: string | null) {
  if (!iso) return '—';
  const t = iso.includes('T') ? iso.split('T')[1] : iso;
  return t.substring(0, 5);
}

export default function AsistenciaScreen() {
  const [data, setData]         = useState<Asistencia[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalVisible, setModal]= useState(false);
  const [selected, setSelected] = useState<Asistencia | null>(null);

  const fetch = async () => {
    setLoading(true);
    try { setData(await getAsistencias()); }
    catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar asistencias.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: Asistencia) => {
    try {
      await deleteAsistencia(item.ID_ASISTENCIA);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Asistencia eliminada.' });
      fetch();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar.' }); }
  };

  const filtered = data.filter(d =>
    String(d.ID_ASISTENCIA).includes(search) ||
    String(d.ID_EMPLEADO ?? '').includes(search) ||
    (d.ESTADO_ASISTENCIA ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.FECHA_ASISTENCIA ?? '').includes(search)
  );

  const presentes = data.filter(d => d.ESTADO_ASISTENCIA?.toUpperCase() === 'PRESENTE').length;
  const ausentes  = data.filter(d => d.ESTADO_ASISTENCIA?.toUpperCase() === 'AUSENTE').length;
  const totalHorasExtra = data.reduce((a, d) => a + (d.HORAS_EXTR_ASISTENCIA ?? 0), 0);

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View>
          <Text style={st.pageTitle}>Asistencia</Text>
          <Text style={st.pageSubtitle}>{data.length} registros</Text>
        </View>
        <TouchableOpacity style={st.btnNew} onPress={() => { setSelected(null); setModal(true); }}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={st.btnNewText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        <View style={st.summaryCard}>
          <FontAwesome5 name="user-check" size={13} color="#059669" />
          <Text style={[st.summaryValue, { color: '#059669' }]}>{presentes}</Text>
          <Text style={st.summaryLabel}>Presentes</Text>
        </View>
        <View style={st.summaryCard}>
          <FontAwesome5 name="user-times" size={13} color="#DC2626" />
          <Text style={[st.summaryValue, { color: '#DC2626' }]}>{ausentes}</Text>
          <Text style={st.summaryLabel}>Ausentes</Text>
        </View>
        <View style={st.summaryCard}>
          <FontAwesome5 name="clock" size={13} color="#D97706" />
          <Text style={[st.summaryValue, { color: '#D97706' }]}>{totalHorasExtra.toFixed(1)}</Text>
          <Text style={st.summaryLabel}>H. Extra</Text>
        </View>
      </View>

      <View style={st.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="Buscar por empleado, estado o fecha…" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><FontAwesome5 name="times" size={12} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={st.empty}><FontAwesome5 name="calendar-times" size={36} color={Colors.textMuted} /><Text style={st.emptyText}>Sin resultados</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_ASISTENCIA)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const cfg = estadoConfig(item.ESTADO_ASISTENCIA);
            return (
              <View style={st.card}>
                <View style={[st.colorBar, { backgroundColor: cfg.bar }]} />
                <View style={st.cardContent}>
                  <View style={st.cardRow}>
                    <View style={st.avatar}>
                      <FontAwesome5 name="user" size={14} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={st.cardTitle}>Empleado ID: {item.ID_EMPLEADO ?? '—'}</Text>
                      <Text style={st.cardSub}>{fmt(item.FECHA_ASISTENCIA)} · Asistencia #{item.ID_ASISTENCIA}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[st.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <View style={st.chips}>
                    {!!item.HORA_IN_ASISTENCIA && <Chip icon="sign-in-alt" label={`Entrada: ${fmtHora(item.HORA_IN_ASISTENCIA)}`} />}
                    {!!item.HORA_SAL_ASISTENCIA && <Chip icon="sign-out-alt" label={`Salida: ${fmtHora(item.HORA_SAL_ASISTENCIA)}`} />}
                    {item.HORAS_TRABAJO_ASISTENCIA != null && <Chip icon="business-time" label={`Trabajo: ${item.HORAS_TRABAJO_ASISTENCIA}h`} />}
                    {item.HORAS_EXTR_ASISTENCIA != null && item.HORAS_EXTR_ASISTENCIA > 0 &&
                      <Chip icon="plus" label={`Extra: ${item.HORAS_EXTR_ASISTENCIA}h`} />}
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
            );
          }}
        />
      )}
      <AsistenciaModal visible={modalVisible} onClose={() => setModal(false)} item={selected} onSaved={() => { setModal(false); fetch(); }} />
    </View>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 200 }}>
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
  avatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center' },
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
