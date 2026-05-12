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
import BodegaModal from '../../components/bodegas/BodegasModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  Bodega,
  deleteBodega,
  getBodegas,
} from '../../services/bodegasService';
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function tipoIcon(tipo: string | null): string {
  switch (tipo) {
    case 'PRINCIPAL':    return 'warehouse';
    case 'SECUNDARIA':   return 'building';
    case 'TRANSITO':     return 'truck';
    case 'CONSIGNACION': return 'handshake';
    default:             return 'warehouse';
  }
}
 
function tipoLabel(tipo: string | null): string {
  const map: Record<string, string> = {
    PRINCIPAL:    'Principal',
    SECUNDARIA:   'Secundaria',
    TRANSITO:     'Tránsito',
    CONSIGNACION: 'Consignación',
  };
  return tipo ? (map[tipo] ?? tipo) : '—';
}
 
// ─── Componente principal ─────────────────────────────────────────────────────
 
export default function BodegasScreen() {
  const [bodegas, setBodegas]           = useState<Bodega[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<Bodega | null>(null);
 
  const fetchBodegas = async () => {
    setLoading(true);
    try {
      const data = await getBodegas();
      setBodegas(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar las bodegas.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchBodegas(); }, []);
 
  const handleDelete = async (item: Bodega) => {
    try {
      await deleteBodega(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.NOMBRE}" fue eliminada.` });
      fetchBodegas();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la bodega.' });
    }
  };
 
  const filtered = bodegas.filter(b =>
    (b.NOMBRE  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.CODIGO  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.TIPO    ?? '').toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (b: Bodega) => { setSelected(b); setModalVisible(true); };
 
  // Conteos rápidos para el resumen
  const activas  = bodegas.filter(b => b.ESTADO === 'A').length;
  const inactivas = bodegas.length - activas;
 
  return (
    <View style={styles.container}>
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Bodegas</Text>
          <Text style={styles.pageSubtitle}>{bodegas.length} registros</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
 
      {/* ── Resumen rápido ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="check-circle" size={14} color="#059669" />
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{activas}</Text>
          <Text style={styles.summaryLabel}>Activas</Text>
        </View>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="times-circle" size={14} color="#9CA3AF" />
          <Text style={[styles.summaryValue, { color: '#9CA3AF' }]}>{inactivas}</Text>
          <Text style={styles.summaryLabel}>Inactivas</Text>
        </View>
      </View>
 
      {/* ── Buscador ── */}
      <View style={styles.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, código o tipo…"
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
 
      {/* ── Contenido ── */}
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
              {/* Barra lateral según estado */}
              <View style={[
                styles.colorBar,
                { backgroundColor: item.ESTADO === 'A' ? Colors.primary : '#D1D5DB' }
              ]} />
 
              <View style={styles.cardContent}>
                {/* Fila superior */}
                <View style={styles.cardRow}>
                  <View style={styles.iconWrap}>
                    <FontAwesome5 name={tipoIcon(item.TIPO)} size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.cardNombre} numberOfLines={1}>{item.NOMBRE ?? '—'}</Text>
                    <Text style={styles.cardCodigo}>{item.CODIGO ?? '—'}</Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { backgroundColor: item.ESTADO === 'A' ? '#FFF8E7' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.estadoText,
                      { color: item.ESTADO === 'A' ? Colors.primary : '#9CA3AF' }
                    ]}>
                      {item.ESTADO === 'A' ? 'Activa' : 'Inactiva'}
                    </Text>
                  </View>
                </View>
 
                {/* Chips informativos */}
                <View style={styles.chips}>
                  {!!item.TIPO && (
                    <InfoChip icon={tipoIcon(item.TIPO)} label={tipoLabel(item.TIPO)} />
                  )}
                  {!!item.DIRECCION && (
                    <InfoChip icon="map-marker-alt" label={item.DIRECCION} />
                  )}
                  {item.ID_SUCURSAL !== null && (
                    <InfoChip icon="building" label={`Sucursal: ${item.ID_SUCURSAL}`} />
                  )}
                </View>
 
                {/* Acciones */}
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
 
      {/* ── Modal ── */}
      <BodegaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        bodega={selected}
        onSaved={() => { setModalVisible(false); fetchBodegas(); }}
      />
 
    </View>
  );
}
 
// ─── Chip auxiliar ────────────────────────────────────────────────────────────
 
function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={chip.wrap}>
      <FontAwesome5 name={icon} size={9} color={Colors.textMuted} />
      <Text style={chip.text} numberOfLines={1}>{label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 200 },
  text: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
});
 
// ─── Estilos ──────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.large },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Layout.spacing.medium },
  pageTitle:    { fontSize: 20, fontWeight: '700', color: Colors.text },
  pageSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btnNew:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnNewText:   { color: '#fff', fontWeight: '600', fontSize: 13 },
 
  summaryRow:   { flexDirection: 'row', gap: 10, marginBottom: Layout.spacing.medium },
  summaryCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  summaryLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
 
  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: Layout.spacing.medium },
  searchInput:   { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
 
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText:  { fontSize: 13, color: Colors.textMuted },
 
  card:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  colorBar:    { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconWrap:    { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center' },
  cardNombre:  { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardCodigo:  { fontSize: 11, color: Colors.textMuted },
 
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  estadoText:  { fontSize: 10, fontWeight: '600' },
 
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
 
  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});