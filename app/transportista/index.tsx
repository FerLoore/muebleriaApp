import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import TransportistaModal from '../../components/transportista/TransportistaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Transportista, deleteTransportista, getTransportistas } from '../../services/transportistaService';

export default function TransportistaScreen() {
  const [data, setData]         = useState<Transportista[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalVisible, setModal]= useState(false);
  const [selected, setSelected] = useState<Transportista | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getTransportistas()); }
    catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar transportistas.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (item: Transportista) => {
    try {
      await deleteTransportista(item.ID_TRANSPORTISTA);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.NOMBRE_TRANSPORTISTA}" eliminado.` });
      fetchData();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar.' }); }
  };

  const filtered = data.filter(d =>
    (d.NOMBRE_TRANSPORTISTA     ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.APELLIDOS_TRANSPORTISTA  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.DPI_TRANSPORTISTA        ?? '').includes(search) ||
    (d.LICENCIA_TRANSPORTISTA   ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.TIPO_LIC_TRANSPORTISTA   ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setSelected(null); setModal(true); };
  const openEdit   = (item: Transportista) => { setSelected(item); setModal(true); };

  const activos   = data.filter(d => d.ESTADO_TRANSPORTISTA === 'A').length;
  const inactivos = data.length - activos;

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View>
          <Text style={st.pageTitle}>Transportistas</Text>
          <Text style={st.pageSubtitle}>{data.length} registros</Text>
        </View>
        <TouchableOpacity style={st.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={st.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        <View style={st.summaryCard}>
          <FontAwesome5 name="id-badge" size={13} color="#059669" />
          <Text style={[st.summaryValue, { color: '#059669' }]}>{activos}</Text>
          <Text style={st.summaryLabel}>Activos</Text>
        </View>
        <View style={st.summaryCard}>
          <FontAwesome5 name="user-times" size={13} color="#9CA3AF" />
          <Text style={[st.summaryValue, { color: '#9CA3AF' }]}>{inactivos}</Text>
          <Text style={st.summaryLabel}>Inactivos</Text>
        </View>
      </View>

      <View style={st.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="Buscar por nombre, DPI, licencia…" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><FontAwesome5 name="times" size={12} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={st.empty}><FontAwesome5 name="id-badge" size={36} color={Colors.textMuted} /><Text style={st.emptyText}>Sin resultados</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_TRANSPORTISTA)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isActive = item.ESTADO_TRANSPORTISTA === 'A';
            const stateColor = isActive ? '#059669' : '#9CA3AF';
            return (
              <View style={st.card}>
                <View style={[st.colorBar, { backgroundColor: stateColor }]} />
                <View style={st.cardContent}>
                  <View style={st.cardRow}>
                    <View style={st.avatar}>
                      <Text style={st.avatarText}>{(item.NOMBRE_TRANSPORTISTA ?? '?')[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={st.cardTitle} numberOfLines={1}>
                        {item.NOMBRE_TRANSPORTISTA ?? '—'} {item.APELLIDOS_TRANSPORTISTA ?? ''}
                      </Text>
                      <Text style={st.cardSub}>DPI: {item.DPI_TRANSPORTISTA ?? '—'}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: isActive ? '#F0FDF4' : '#F3F4F6' }]}>
                      <Text style={[st.badgeText, { color: stateColor }]}>{isActive ? 'Activo' : 'Inactivo'}</Text>
                    </View>
                  </View>
                  <View style={st.chips}>
                    {!!item.LICENCIA_TRANSPORTISTA && <Chip icon="id-card" label={`Lic: ${item.LICENCIA_TRANSPORTISTA}`} />}
                    {!!item.TIPO_LIC_TRANSPORTISTA && <Chip icon="certificate" label={`Tipo ${item.TIPO_LIC_TRANSPORTISTA}`} />}
                    {item.ID_EMPLEADO != null       && <Chip icon="user" label={`Empleado: ${item.ID_EMPLEADO}`} />}
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

      <TransportistaModal visible={modalVisible} onClose={() => setModal(false)} item={selected} onSaved={() => { setModal(false); fetchData(); }} />
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
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  badgeText:    { fontSize: 10, fontWeight: '600' },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions:      { flexDirection: 'row', gap: 8 },
  btnEdit:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:  { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText:{ color: '#DC2626', fontWeight: '600', fontSize: 11 },
});
