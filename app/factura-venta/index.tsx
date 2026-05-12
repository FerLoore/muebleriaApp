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
import FacturaVentaModal from '../../components/factura-venta/FacturaVentaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  FacturaVenta,
  deleteFacturaVenta,
  getFacturasVenta,
} from '../../services/facturaVentaService';
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function estadoConfig(estado: string | null): { label: string; color: string; bg: string } {
  switch (estado) {
    case 'PENDIENTE': return { label: 'Pendiente', color: '#D97706', bg: '#FEF3C7' };
    case 'EMITIDA':   return { label: 'Emitida',   color: '#2563EB', bg: '#EFF6FF' };
    case 'ANULADA':   return { label: 'Anulada',   color: '#DC2626', bg: '#FEF2F2' };
    case 'PAGADA':    return { label: 'Pagada',    color: '#059669', bg: '#ECFDF5' };
    default:          return { label: estado ?? '—', color: '#6B7280', bg: '#F3F4F6' };
  }
}
 
function barColor(estado: string | null): string {
  switch (estado) {
    case 'PENDIENTE': return '#F59E0B';
    case 'EMITIDA':   return '#3B82F6';
    case 'ANULADA':   return '#EF4444';
    case 'PAGADA':    return '#10B981';
    default:          return '#D1D5DB';
  }
}
 
function formatFecha(iso: string | null): string {
  if (!iso) return '—';
  return iso.split('T')[0];
}
 
function formatTotal(total: number | null): string {
  if (total === null) return '—';
  return total.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' });
}
 
// ─── Componente principal ─────────────────────────────────────────────────────
 
export default function FacturaVentaScreen() {
  const [facturas, setFacturas]         = useState<FacturaVenta[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<FacturaVenta | null>(null);
 
  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await getFacturasVenta();
      setFacturas(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar las facturas.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchFacturas(); }, []);
 
  const handleDelete = async (item: FacturaVenta) => {
    try {
      await deleteFacturaVenta(item.ID_FACTURA_VENTA);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `Factura ${item.SERIE_FACTURA_VENTA}-${item.CORRELATIVO_FACTURA_VENTA} eliminada.` });
      fetchFacturas();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la factura.' });
    }
  };
 
  const filtered = facturas.filter(f =>
    (f.SERIE_FACTURA_VENTA ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(f.CORRELATIVO_FACTURA_VENTA ?? '').includes(search) ||
    (f.ESTADO_SALIDA_MERCADERIA ?? '').toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (f: FacturaVenta) => { setSelected(f); setModalVisible(true); };
 
  // Totales para el resumen
  const totalPagadas  = facturas.filter(f => f.ESTADO_SALIDA_MERCADERIA === 'PAGADA').length;
  const totalPendientes = facturas.filter(f => f.ESTADO_SALIDA_MERCADERIA === 'PENDIENTE').length;
  const sumaTotal     = facturas
    .filter(f => f.ESTADO_SALIDA_MERCADERIA !== 'ANULADA')
    .reduce((acc, f) => acc + (f.TOTAL_FACTURA_VENTA ?? 0), 0);
 
  return (
    <View style={styles.container}>
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Facturas de Venta</Text>
          <Text style={styles.pageSubtitle}>{facturas.length} registros</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
 
      {/* ── Resumen ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="check-circle" size={13} color="#059669" />
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{totalPagadas}</Text>
          <Text style={styles.summaryLabel}>Pagadas</Text>
        </View>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="clock" size={13} color="#D97706" />
          <Text style={[styles.summaryValue, { color: '#D97706' }]}>{totalPendientes}</Text>
          <Text style={styles.summaryLabel}>Pendientes</Text>
        </View>
        <View style={[styles.summaryCard, { flex: 2 }]}>
          <FontAwesome5 name="dollar-sign" size={13} color={Colors.primary} />
          <Text style={[styles.summaryValue, { color: Colors.primary, fontSize: 13 }]}>
            {sumaTotal.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}
          </Text>
          <Text style={styles.summaryLabel}>Total activo</Text>
        </View>
      </View>
 
      {/* ── Buscador ── */}
      <View style={styles.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por serie, correlativo o estado…"
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
          <FontAwesome5 name="file-invoice-dollar" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_FACTURA_VENTA)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const cfg = estadoConfig(item.ESTADO_SALIDA_MERCADERIA);
            return (
              <View style={styles.card}>
                <View style={[styles.colorBar, { backgroundColor: barColor(item.ESTADO_SALIDA_MERCADERIA) }]} />
 
                <View style={styles.cardContent}>
                  {/* Fila superior */}
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {item.SERIE_FACTURA_VENTA ?? '—'}-{item.CORRELATIVO_FACTURA_VENTA ?? '—'}
                      </Text>
                      <Text style={styles.cardSub}>
                        Factura: {formatFecha(item.FECHA_FACTURA_VENTA)}
                      </Text>
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.estadoText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
 
                  {/* Total destacado */}
                  {item.TOTAL_FACTURA_VENTA !== null && (
                    <View style={styles.totalRow}>
                      <FontAwesome5 name="receipt" size={11} color={Colors.primary} />
                      <Text style={styles.totalText}>{formatTotal(item.TOTAL_FACTURA_VENTA)}</Text>
                    </View>
                  )}
 
                  {/* Chips informativos */}
                  <View style={styles.chips}>
                    {item.FECHA_SALIDA_FACTURA_VENTA && (
                      <InfoChip icon="paper-plane" label={`Salida: ${formatFecha(item.FECHA_SALIDA_FACTURA_VENTA)}`} />
                    )}
                    {item.ID_SALIDA_MERCADERIA !== null && (
                      <InfoChip icon="box-open" label={`Salida merc: ${item.ID_SALIDA_MERCADERIA}`} />
                    )}
                    {!!item.OBSERVACION_SALIDA_MERCADERIA && (
                      <InfoChip icon="comment-alt" label={item.OBSERVACION_SALIDA_MERCADERIA} />
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
      <FacturaVentaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        factura={selected}
        onSaved={() => { setModalVisible(false); fetchFacturas(); }}
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
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 220 },
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
  cardRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle:   { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:     { fontSize: 11, color: Colors.textMuted },
 
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  estadoText:  { fontSize: 10, fontWeight: '600' },
 
  totalRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  totalText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
 
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
 
  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});