import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import NominaModal from '../../components/nomina/NominaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Nomina, deleteNomina, getNominas } from '../../services/nominaService';

function estadoConfig(estado: string | null) {
  switch (estado) {
    case 'ACTIVA':  return { label: 'Activa',  color: '#059669', bg: '#ECFDF5', bar: '#10B981' };
    case 'CERRADA': return { label: 'Cerrada', color: '#2563EB', bg: '#EFF6FF', bar: '#3B82F6' };
    case 'PAGADA':  return { label: 'Pagada',  color: '#7C3AED', bg: '#F5F3FF', bar: '#8B5CF6' };
    default:        return { label: estado ?? '—', color: '#6B7280', bg: '#F3F4F6', bar: '#D1D5DB' };
  }
}
function fmt(iso: string | null) { return iso ? iso.split('T')[0] : '—'; }
function fmtQ(v: number | null) { return v != null ? v.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' }) : '—'; }

export default function NominaScreen() {
  const [data, setData]         = useState<Nomina[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalVisible, setModal]= useState(false);
  const [selected, setSelected] = useState<Nomina | null>(null);

  const fetch = async () => {
    setLoading(true);
    try { setData(await getNominas()); }
    catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar nóminas.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: Nomina) => {
    try {
      await deleteNomina(item.ID_NOMINA);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Nómina eliminada.' });
      fetch();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar.' }); }
  };

  const filtered = data.filter(d =>
    (d.PERIODO_NOMINA ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.ESTADO_NOMINA ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(d.ID_NOMINA).includes(search)
  );

  const totalNeto = data.reduce((a, d) => a + (d.TOTAL_NETO_NOMINA ?? 0), 0);

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View>
          <Text style={st.pageTitle}>Nóminas</Text>
          <Text style={st.pageSubtitle}>{data.length} registros</Text>
        </View>
        <TouchableOpacity style={st.btnNew} onPress={() => { setSelected(null); setModal(true); }}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={st.btnNewText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        <View style={st.summaryCard}>
          <FontAwesome5 name="file-alt" size={13} color={Colors.primary} />
          <Text style={[st.summaryValue, { color: Colors.primary }]}>{data.length}</Text>
          <Text style={st.summaryLabel}>Total</Text>
        </View>
        <View style={st.summaryCard}>
          <FontAwesome5 name="check-circle" size={13} color="#059669" />
          <Text style={[st.summaryValue, { color: '#059669' }]}>{data.filter(d => d.ESTADO_NOMINA === 'PAGADA').length}</Text>
          <Text style={st.summaryLabel}>Pagadas</Text>
        </View>
        <View style={[st.summaryCard, { flex: 2 }]}>
          <FontAwesome5 name="dollar-sign" size={13} color="#7C3AED" />
          <Text style={[st.summaryValue, { color: '#7C3AED', fontSize: 12 }]}>{fmtQ(totalNeto)}</Text>
          <Text style={st.summaryLabel}>Neto Total</Text>
        </View>
      </View>

      <View style={st.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="Buscar por período o estado…" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><FontAwesome5 name="times" size={12} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={st.empty}><FontAwesome5 name="file-alt" size={36} color={Colors.textMuted} /><Text style={st.emptyText}>Sin resultados</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_NOMINA)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const cfg = estadoConfig(item.ESTADO_NOMINA);
            return (
              <View style={st.card}>
                <View style={[st.colorBar, { backgroundColor: cfg.bar }]} />
                <View style={st.cardContent}>
                  <View style={st.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.cardTitle}>{item.PERIODO_NOMINA ?? '—'}</Text>
                      <Text style={st.cardSub}>Pago: {fmt(item.FECHA_PAGO_NOMINA)} · ID: {item.ID_NOMINA}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[st.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FontAwesome5 name="money-bill-wave" size={11} color="#7C3AED" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#7C3AED' }}>{fmtQ(item.TOTAL_NETO_NOMINA)}</Text>
                  </View>
                  <View style={st.chips}>
                    {item.TOTAL_BRUTO_NOMINA != null && <Chip icon="money-bill" label={`Bruto: ${fmtQ(item.TOTAL_BRUTO_NOMINA)}`} />}
                    {item.TOTAL_DESCUENTOS_NOMINA != null && <Chip icon="minus-circle" label={`Desc: ${fmtQ(item.TOTAL_DESCUENTOS_NOMINA)}`} />}
                    {item.ID_SUCURSAL != null && <Chip icon="building" label={`Suc: ${item.ID_SUCURSAL}`} />}
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
      <NominaModal visible={modalVisible} onClose={() => setModal(false)} item={selected} onSaved={() => { setModal(false); fetch(); }} />
    </View>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 220 }}>
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
  cardRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
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
