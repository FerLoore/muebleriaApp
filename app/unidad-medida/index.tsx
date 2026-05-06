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
import UnidadMedidaModal from '../../components/unidad-medida/UnidadMedidaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  UnidadMedida,
  deleteUnidadMedida,
  getUnidadesMedida,
} from '../../services/unidadMedidaService';
 
// ─── Componente principal ─────────────────────────────────────────────────────
 
export default function UnidadMedidaScreen() {
  const [unidades, setUnidades]         = useState<UnidadMedida[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<UnidadMedida | null>(null);
 
  const fetchUnidades = async () => {
    setLoading(true);
    try {
      const data = await getUnidadesMedida();
      setUnidades(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar las unidades de medida.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchUnidades(); }, []);
 
  const handleDelete = async (item: UnidadMedida) => {
    try {
      await deleteUnidadMedida(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.NOMBRE}" fue eliminada.` });
      fetchUnidades();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la unidad de medida.' });
    }
  };
 
  const filtered = unidades.filter(u =>
    (u.NOMBRE      ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.DESCRIPCION ?? '').toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (u: UnidadMedida) => { setSelected(u); setModalVisible(true); };
 
  return (
    <View style={styles.container}>
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Unidades de Medida</Text>
          <Text style={styles.pageSubtitle}>{unidades.length} registros</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
 
      {/* ── Buscador ── */}
      <View style={styles.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o descripción…"
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
          <FontAwesome5 name="ruler" size={36} color={Colors.textMuted} />
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
              {/* Barra lateral — ámbar si tiene descuento, azul si no */}
              <View style={[
                styles.colorBar,
                { backgroundColor: (item.DESCUENTO ?? 0) > 0 ? Colors.primary : '#93C5FD' }
              ]} />
 
              <View style={styles.cardContent}>
                {/* Fila superior */}
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardNombre} numberOfLines={1}>{item.NOMBRE ?? '—'}</Text>
                    {!!item.DESCRIPCION && (
                      <Text style={styles.cardDesc} numberOfLines={1}>{item.DESCRIPCION}</Text>
                    )}
                  </View>
                  {/* Badge de descuento */}
                  {(item.DESCUENTO ?? 0) > 0 && (
                    <View style={styles.descuentoBadge}>
                      <FontAwesome5 name="percent" size={8} color={Colors.primary} />
                      <Text style={styles.descuentoText}>{item.DESCUENTO}%</Text>
                    </View>
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
      <UnidadMedidaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        unidad={selected}
        onSaved={() => { setModalVisible(false); fetchUnidades(); }}
      />
 
    </View>
  );
}
 
// ─── Estilos ──────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.large },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Layout.spacing.medium },
  pageTitle:    { fontSize: 20, fontWeight: '700', color: Colors.text },
  pageSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btnNew:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnNewText:   { color: '#fff', fontWeight: '600', fontSize: 13 },
 
  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: Layout.spacing.medium },
  searchInput:   { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
 
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText:  { fontSize: 13, color: Colors.textMuted },
 
  card:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  colorBar:    { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardNombre:  { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardDesc:    { fontSize: 11, color: Colors.textMuted },
 
  descuentoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  descuentoText:  { fontSize: 10, fontWeight: '600', color: Colors.primary },
 
  actions:       { flexDirection: 'row', gap: 8 },
  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});