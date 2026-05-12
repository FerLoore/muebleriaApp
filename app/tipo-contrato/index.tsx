import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import TipoContratoModal from '../../components/tipo-contrato/TipoContratoModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { TipoContrato, deleteTipoContrato, getTiposContrato } from '../../services/tipoContratoService';

export default function TipoContratoScreen() {
  const [data, setData]         = useState<TipoContrato[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalVisible, setModal]= useState(false);
  const [selected, setSelected] = useState<TipoContrato | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getTiposContrato()); }
    catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar tipos de contrato.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (item: TipoContrato) => {
    try {
      await deleteTipoContrato(item.ID_TIPO_CONTRATO);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.NOMBRE_TIPO_CONTRATO}" eliminado.` });
      fetchData();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar.' }); }
  };

  const filtered = data.filter(d =>
    (d.CODIGO_TIPO_CONTRATO  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.NOMBRE_TIPO_CONTRATO  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.PRESTACIONES_TIPO_CONTRATO ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setSelected(null); setModal(true); };
  const openEdit   = (item: TipoContrato) => { setSelected(item); setModal(true); };

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View>
          <Text style={st.pageTitle}>Tipo de Contrato</Text>
          <Text style={st.pageSubtitle}>{data.length} registros</Text>
        </View>
        <TouchableOpacity style={st.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={st.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        <View style={st.summaryCard}>
          <FontAwesome5 name="file-contract" size={13} color={Colors.primary} />
          <Text style={[st.summaryValue, { color: Colors.primary }]}>{data.length}</Text>
          <Text style={st.summaryLabel}>Total</Text>
        </View>
        <View style={st.summaryCard}>
          <FontAwesome5 name="clock" size={13} color="#3B82F6" />
          <Text style={[st.summaryValue, { color: '#3B82F6' }]}>
            {data.filter(d => d.DURACION_TIPO_CONTRATO != null).length}
          </Text>
          <Text style={st.summaryLabel}>Con Duración</Text>
        </View>
        <View style={st.summaryCard}>
          <FontAwesome5 name="star" size={13} color="#059669" />
          <Text style={[st.summaryValue, { color: '#059669' }]}>
            {data.filter(d => !!d.PRESTACIONES_TIPO_CONTRATO).length}
          </Text>
          <Text style={st.summaryLabel}>Con Prestaciones</Text>
        </View>
      </View>

      <View style={st.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="Buscar por código, nombre o prestaciones…" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><FontAwesome5 name="times" size={12} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={st.empty}><FontAwesome5 name="file-contract" size={36} color={Colors.textMuted} /><Text style={st.emptyText}>Sin resultados</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_TIPO_CONTRATO)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={st.card}>
              <View style={[st.colorBar, { backgroundColor: Colors.primary }]} />
              <View style={st.cardContent}>
                <View style={st.cardRow}>
                  <View style={st.avatar}>
                    <Text style={st.avatarText}>{(item.CODIGO_TIPO_CONTRATO ?? '?')[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={st.cardTitle} numberOfLines={1}>{item.NOMBRE_TIPO_CONTRATO ?? '—'}</Text>
                    <Text style={st.cardSub}>Código: {item.CODIGO_TIPO_CONTRATO ?? '—'}</Text>
                  </View>
                  {item.DURACION_TIPO_CONTRATO != null && (
                    <View style={st.badge}>
                      <Text style={st.badgeText}>{item.DURACION_TIPO_CONTRATO} meses</Text>
                    </View>
                  )}
                </View>
                <View style={st.chips}>
                  {!!item.HORA_EXTRA_TIPO_CONTRATO    && <Chip icon="business-time" label={`Hora extra: ${item.HORA_EXTRA_TIPO_CONTRATO}`} />}
                  {!!item.PRESTACIONES_TIPO_CONTRATO  && <Chip icon="star" label={item.PRESTACIONES_TIPO_CONTRATO} />}
                </View>
                {!!item.OBSERVACIONES_TIPO_CONTRATO && (
                  <Text style={st.obs} numberOfLines={2}>{item.OBSERVACIONES_TIPO_CONTRATO}</Text>
                )}
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
          )}
        />
      )}

      <TipoContratoModal visible={modalVisible} onClose={() => setModal(false)} item={selected} onSaved={() => { setModal(false); fetchData(); }} />
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
  avatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center' },
  avatarText:   { fontSize: 15, fontWeight: '700', color: Colors.primary },
  cardTitle:    { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:      { fontSize: 11, color: Colors.textMuted },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8, backgroundColor: '#EFF6FF' },
  badgeText:    { fontSize: 10, fontWeight: '600', color: Colors.primary },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  obs:          { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 8, backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8 },
  actions:      { flexDirection: 'row', gap: 8 },
  btnEdit:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:  { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText:{ color: '#DC2626', fontWeight: '600', fontSize: 11 },
});
