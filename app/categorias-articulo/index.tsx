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
import CategoriaArticuloModal from '../../components/categorias-articulo/CategoriasArticuloModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  CategoriasArticulo,
  deleteCategoriaArticulo,
  getCategoriasArticulo,
} from '../../services/categoriasArticuloService';
 
// ─── Componente principal ─────────────────────────────────────────────────────
 
export default function CategoriasArticuloScreen() {
  const [categorias, setCategorias]     = useState<CategoriasArticulo[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<CategoriasArticulo | null>(null);
 
  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await getCategoriasArticulo();
      setCategorias(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar las categorías.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchCategorias(); }, []);
 
  const handleDelete = async (item: CategoriasArticulo) => {
    try {
      await deleteCategoriaArticulo(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.NOMBRE}" fue eliminada.` });
      fetchCategorias();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la categoría.' });
    }
  };
 
  const filtered = categorias.filter(c =>
    (c.NOMBRE ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.CODIGO ?? '').toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (c: CategoriasArticulo) => { setSelected(c); setModalVisible(true); };
 
  // Busca el nombre de la categoría padre para mostrarlo en la card
  const getNombrePadre = (id_padre: number | null) => {
    if (!id_padre) return null;
    return categorias.find(c => c.ID === id_padre)?.NOMBRE ?? `ID ${id_padre}`;
  };
 
  return (
    <View style={styles.container}>
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Categorías de Artículo</Text>
          <Text style={styles.pageSubtitle}>{categorias.length} registros</Text>
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
          <FontAwesome5 name="tags" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const nombrePadre = getNombrePadre(item.ID_PADRE);
            return (
              <View style={styles.card}>
                {/* Barra lateral con color según nivel */}
                <View style={[styles.colorBar, { backgroundColor: nivelColor(item.NIVEL) }]} />
 
                <View style={styles.cardContent}>
                  {/* Fila superior */}
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardNombre} numberOfLines={1}>{item.NOMBRE ?? '—'}</Text>
                      <Text style={styles.cardCodigo}>{item.CODIGO ?? '—'}</Text>
                    </View>
                    {item.NIVEL !== null && (
                      <View style={styles.nivelBadge}>
                        <Text style={styles.nivelText}>Nivel {item.NIVEL}</Text>
                      </View>
                    )}
                  </View>
 
                  {/* Chips informativos */}
                  <View style={styles.chips}>
                    {nombrePadre && (
                      <InfoChip icon="sitemap" label={`Padre: ${nombrePadre}`} />
                    )}
                    {!item.ID_PADRE && (
                      <InfoChip icon="star" label="Categoría raíz" />
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
            );
          }}
        />
      )}
 
      {/* ── Modal ── */}
      <CategoriaArticuloModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        categoria={selected}
        onSaved={() => { setModalVisible(false); fetchCategorias(); }}
      />
 
    </View>
  );
}
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
 
// Color de la barra lateral según nivel de jerarquía
function nivelColor(nivel: number | null): string {
  switch (nivel) {
    case 1:  return '#F59E0B'; // ámbar — raíz
    case 2:  return '#3B82F6'; // azul
    case 3:  return '#10B981'; // verde
    default: return '#D1D5DB'; // gris — sin nivel
  }
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
  cardRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardNombre:  { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardCodigo:  { fontSize: 11, color: Colors.textMuted },
 
  nivelBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  nivelText:  { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
 
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
 
  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});