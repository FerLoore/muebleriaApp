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
import StockArticuloModal from '../../components/stock-articulo/StockArticuloModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { getCatalogo } from '../../services/catalogoService';
import {
  StockArticulo,
  deleteStockArticulo,
  getStockArticulos,
} from '../../services/stockArticuloService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFecha(iso: string | null): string {
  if (!iso) return '—';
  return iso.split('T')[0];
}

// Color de la barra lateral según disponibilidad
function barColor(disponible: number | null): string {
  if (disponible === null) return '#D1D5DB';
  if (disponible <= 0)     return '#EF4444'; // rojo — sin stock
  if (disponible <= 10)    return '#F59E0B'; // ámbar — stock bajo
  return '#10B981';                           // verde — stock OK
}
 
// ─── Componente principal ─────────────────────────────────────────────────────
export default function StockArticuloScreen() {
  const [stocks, setStocks]             = useState<StockArticulo[]>([]);
  const [nombres, setNombres]           = useState<Map<number, string>>(new Map());
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<StockArticulo | null>(null);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const [data, catalogo] = await Promise.all([getStockArticulos(), getCatalogo()]);
      setStocks(data);
      // Construye mapa ID → nombre para lookup rápido
      const mapa = new Map<number, string>();
      catalogo.forEach(a => { if (a.idArticulo != null) mapa.set(a.idArticulo, a.nombre ?? `#${a.idArticulo}`); });
      setNombres(mapa);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar el stock.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  const handleDelete = async (item: StockArticulo) => {
    try {
      await deleteStockArticulo(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Registro de stock eliminado.' });
      fetchStocks();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar el stock.' });
    }
  };

  // Búsqueda por nombre de artículo o ID ubicación
  const filtered = stocks.filter(s => {
    const nombre = s.ID_ARTICULO != null ? (nombres.get(s.ID_ARTICULO) ?? '') : '';
    return nombre.toLowerCase().includes(search.toLowerCase()) ||
           String(s.ID_UBICACION ?? '').includes(search);
  });

  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (s: StockArticulo) => { setSelected(s); setModalVisible(true); };

  // Totales rápidos para el resumen del header
  const totalDisponible = stocks.reduce((acc, s) => acc + (s.CANTIDAD_DISPONIBLE ?? 0), 0);
  const sinStock        = stocks.filter(s => (s.CANTIDAD_DISPONIBLE ?? 0) <= 0).length;

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Stock de Artículos</Text>
          <Text style={styles.pageSubtitle}>{stocks.length} registros</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* ── Resumen rápido ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="boxes" size={14} color={Colors.primary} />
          <Text style={styles.summaryValue}>{totalDisponible.toFixed(0)}</Text>
          <Text style={styles.summaryLabel}>Total disponible</Text>
        </View>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="exclamation-triangle" size={14} color="#EF4444" />
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{sinStock}</Text>
          <Text style={styles.summaryLabel}>Sin stock</Text>
        </View>
      </View>

      {/* ── Buscador ── */}
      <View style={styles.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre de artículo…"
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
          <FontAwesome5 name="boxes" size={36} color={Colors.textMuted} />
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
              {/* Barra lateral según nivel de stock */}
              <View style={[styles.colorBar, { backgroundColor: barColor(item.CANTIDAD_DISPONIBLE) }]} />

              <View style={styles.cardContent}>
                {/* Fila superior */}
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {item.ID_ARTICULO != null
                        ? (nombres.get(item.ID_ARTICULO) ?? `Artículo #${item.ID_ARTICULO}`)
                        : '—'}
                    </Text>
                    <Text style={styles.cardSub}>Ubicación: {item.ID_UBICACION ?? '—'}</Text>
                  </View>
                  {/* Badge de disponibilidad */}
                  <View style={[
                    styles.dispBadge,
                    { backgroundColor: (item.CANTIDAD_DISPONIBLE ?? 0) > 0 ? '#ECFDF5' : '#FEF2F2' }
                  ]}>
                    <Text style={[
                      styles.dispText,
                      { color: (item.CANTIDAD_DISPONIBLE ?? 0) > 0 ? '#059669' : '#DC2626' }
                    ]}>
                      {item.CANTIDAD_DISPONIBLE ?? 0} disp.
                    </Text>
                  </View>
                </View>

                {/* Chips de cantidades */}
                <View style={styles.chips}>
                  {item.CANTIDAD_RESERVADA !== null && (
                    <InfoChip icon="lock" label={`Reservada: ${item.CANTIDAD_RESERVADA}`} />
                  )}
                  {item.CANTIDAD_TRANSITO !== null && (
                    <InfoChip icon="truck" label={`Tránsito: ${item.CANTIDAD_TRANSITO}`} />
                  )}
                  {item.COSTO_PROMEDIO !== null && (
                    <InfoChip icon="dollar-sign" label={`Costo: ${item.COSTO_PROMEDIO}`} />
                  )}
                  {item.ULTIMO_MOVIMIENTO && (
                    <InfoChip icon="clock" label={formatFecha(item.ULTIMO_MOVIMIENTO)} />
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
      <StockArticuloModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        stock={selected}
        onSaved={() => { setModalVisible(false); fetchStocks(); }}
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
  // Resumen
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
  cardRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle:   { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:     { fontSize: 11, color: Colors.textMuted },
  dispBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  dispText:  { fontSize: 10, fontWeight: '600' },
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});