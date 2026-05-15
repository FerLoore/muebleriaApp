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
import ArticuloModal from '../../components/articulo/ArticuloModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  Articulo,
  deleteArticulo,
  getArticulos,
} from '../../services/articuloService';
 
// ─── Componente principal ─────────────────────────────────────────────────────
 
export default function ArticuloScreen() {
  const [articulos, setArticulos]       = useState<Articulo[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<Articulo | null>(null);
 
  // ── Cargar datos ───────────────────────────────────────────────────────
  const fetchArticulos = async () => {
    setLoading(true);
    try {
      const data = await getArticulos();
      setArticulos(data);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error al cargar', text2: e?.message ?? 'No se pudo cargar los artículos.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchArticulos(); }, []);
 
  // ── Eliminar ───────────────────────────────────────────────────────────
  const handleDelete = async (item: Articulo) => {
    try {
      await deleteArticulo(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.NOMBRE}" fue eliminado.` });
      fetchArticulos();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar el artículo.' });
    }
  };
 
  // ── Filtro búsqueda ────────────────────────────────────────────────────
  const filtered = articulos.filter(a =>
    a.NOMBRE.toLowerCase().includes(search.toLowerCase()) ||
    a.CODIGO.toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null);  setModalVisible(true); };
  const openEdit   = (a: Articulo) => { setSelected(a); setModalVisible(true); };
 
  // ──────────────────────────────────────────────────────────────────────
 
  return (
    <View style={styles.container}>
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Artículos</Text>
          <Text style={styles.pageSubtitle}>{articulos.length} registros</Text>
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
          placeholder="Buscar por nombre o código…"
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
          <FontAwesome5 name="box-open" size={36} color={Colors.textMuted} />
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
              {/* barra lateral de color según estado */}
              <View style={[
                styles.colorBar,
                { backgroundColor: item.ESTADO === 'A' ? Colors.primary : '#D1D5DB' }
              ]} />
 
              <View style={styles.cardContent}>
                {/* Fila superior */}
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardNombre} numberOfLines={1}>{item.NOMBRE}</Text>
                    <Text style={styles.cardCodigo}>
                      {item.CODIGO}{item.CODIGO_BARRA ? ` · ${item.CODIGO_BARRA}` : ''}
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { backgroundColor: item.ESTADO === 'A' ? '#FFF8E7' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.estadoText,
                      { color: item.ESTADO === 'A' ? Colors.primary : '#9CA3AF' }
                    ]}>
                      {item.ESTADO === 'A' ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
 
                {/* Chips informativos */}
                <View style={styles.chips}>
                  {!!item.TIPO             && <InfoChip icon="tag"              label={item.TIPO} />}
                  {item.STOCK_MIN !== null  && <InfoChip icon="sort-amount-down" label={`Min ${item.STOCK_MIN}`} />}
                  {item.STOCK_MAX !== null  && <InfoChip icon="sort-amount-up"   label={`Max ${item.STOCK_MAX}`} />}
                  {item.PESO      !== null  && <InfoChip icon="weight"            label={`${item.PESO} kg`} />}
                  {item.MANEJA_LOTE  === 'S' && <InfoChip icon="layer-group"    label="Lote" />}
                  {item.MANEJA_SERIE === 'S' && <InfoChip icon="barcode"        label="Serie" />}
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
 
      {/* ── Drawer/Modal ── */}
      <ArticuloModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        articulo={selected}
        onSaved={() => { setModalVisible(false); fetchArticulos(); }}
      />
 
    </View>
  );
}
 
// ─── Chip auxiliar ────────────────────────────────────────────────────────────
 
function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={chip.wrap}>
      <FontAwesome5 name={icon} size={9} color={Colors.textMuted} />
      <Text style={chip.text}>{label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F1F5F9', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  text: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
});
 
// ─── Estilos ──────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.spacing.large,
    paddingTop: Layout.spacing.large,
  },
 
  // header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Layout.spacing.medium,
  },
  pageTitle:    { fontSize: 20, fontWeight: '700', color: Colors.text },
  pageSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btnNew: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  btnNewText: { color: '#fff', fontWeight: '600', fontSize: 13 },
 
  // search
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Layout.spacing.medium,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
 
  // empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText:  { fontSize: 13, color: Colors.textMuted },
 
  // card
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  colorBar:    { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardNombre:  { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardCodigo:  { fontSize: 11, color: Colors.textMuted },
 
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  estadoText:  { fontSize: 10, fontWeight: '600' },
 
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
 
  btnEdit: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
 
  btnDelete: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});