import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import UbicacionBodegaModal from '../../components/ubicacion-bodega/UbicacionBodegaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  UbicacionBodega,
  deleteUbicacionBodega,
  getUbicacionesBodega,
} from '../../services/ubicacionBodegaService';
 
export default function UbicacionBodegaScreen() {
  const [ubicaciones, setUbicaciones]   = useState<UbicacionBodega[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<UbicacionBodega | null>(null);
 
  const fetchUbicaciones = async () => {
    setLoading(true);
    try {
      const data = await getUbicacionesBodega();
      setUbicaciones(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar las ubicaciones.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchUbicaciones(); }, []);
 
  const handleDelete = async (item: UbicacionBodega) => {
    try {
      await deleteUbicacionBodega(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Ubicación eliminada correctamente.' });
      fetchUbicaciones();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la ubicación.' });
    }
  };
 
  const filtered = ubicaciones.filter(u =>
    (u.PASILLO  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.RACK     ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.NIVEL    ?? '').toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (u: UbicacionBodega) => { setSelected(u); setModalVisible(true); };
 
  const getLabel = (u: UbicacionBodega) =>
    [u.PASILLO, u.RACK, u.NIVEL, u.POSICION].filter(Boolean).join(' – ') || `Ubicación #${u.ID}`;
 
  return (
    <View style={styles.container}>
 
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Ubicaciones de Bodega</Text>
          <Text style={styles.pageSubtitle}>{ubicaciones.length} registros</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
 
      <View style={styles.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por pasillo, rack o nivel…"
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <FontAwesome5 name="times" size={12} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
 
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="warehouse" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.colorBar, { backgroundColor: Colors.primary }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{getLabel(item)}</Text>
                    <Text style={styles.cardSub}>ID Bodega: {item.ID ?? '—'}</Text>
                  </View>
                  {item.CAPACIDAD !== null && (
                    <View style={styles.capacidadBadge}>
                      <FontAwesome5 name="cubes" size={9} color={Colors.primary} />
                      <Text style={styles.capacidadText}>{item.CAPACIDAD}</Text>
                    </View>
                  )}
                </View>
 
                <View style={styles.chips}>
                  {!!item.PASILLO  && <InfoChip icon="grip-lines-vertical" label={`Pasillo: ${item.PASILLO}`} />}
                  {!!item.RACK     && <InfoChip icon="server"              label={`Rack: ${item.RACK}`} />}
                  {!!item.NIVEL    && <InfoChip icon="layer-group"         label={`Nivel: ${item.NIVEL}`} />}
                  {!!item.POSICION && <InfoChip icon="map-pin"             label={`Pos: ${item.POSICION}`} />}
                </View>
 
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}>
                    <FontAwesome5 name="pen" size={11} color={Colors.primary} />
                    <Text style={styles.btnEditText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item)}>
                    <FontAwesome5 name="trash" size={11} color="#DC2626" />
                    <Text style={styles.btnDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
 
      <UbicacionBodegaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        ubicacion={selected}
        onSaved={() => { setModalVisible(false); fetchUbicaciones(); }}
      />
 
    </View>
  );
}
 
function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={chip.wrap}>
      <FontAwesome5 name={icon} size={9} color={Colors.textMuted} />
      <Text style={chip.text}>{label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
});
 
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.large },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Layout.spacing.medium },
  pageTitle:      { fontSize: 20, fontWeight: '700', color: Colors.text },
  pageSubtitle:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btnNew:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnNewText:     { color: '#fff', fontWeight: '600', fontSize: 13 },
  searchWrapper:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: Layout.spacing.medium },
  searchInput:    { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
  emptyState:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText:      { fontSize: 13, color: Colors.textMuted },
  card:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  colorBar:       { width: 4 },
  cardContent:    { flex: 1, padding: 14 },
  cardRow:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle:      { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:        { fontSize: 11, color: Colors.textMuted },
  capacidadBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  capacidadText:  { fontSize: 10, fontWeight: '600', color: Colors.primary },
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions:        { flexDirection: 'row', gap: 8 },
  btnEdit:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:    { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText:  { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});