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
import TransferenciaBodegaModal from '../../components/transferencia-bodega/TransferenciaBodegaModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  TransferenciaBodega,
  deleteTransferenciaBodega,
  getTransferenciasBodega,
} from '../../services/transferenciaBodegaService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function estadoConfig(estado: string | null): { label: string; color: string; bg: string } {
  switch (estado) {
    case 'PENDIENTE':   return { label: 'Pendiente',   color: '#D97706', bg: '#FEF3C7' };
    case 'EN_TRANSITO': return { label: 'En tránsito', color: '#2563EB', bg: '#EFF6FF' };
    case 'ENTREGADO':   return { label: 'Entregado',   color: '#059669', bg: '#ECFDF5' };
    case 'CANCELADO':   return { label: 'Cancelado',   color: '#DC2626', bg: '#FEF2F2' };
    default:            return { label: estado ?? '—', color: '#6B7280', bg: '#F3F4F6' };
  }
}

function barColor(estado: string | null): string {
  switch (estado) {
    case 'PENDIENTE':   return '#F59E0B';
    case 'EN_TRANSITO': return '#3B82F6';
    case 'ENTREGADO':   return '#10B981';
    case 'CANCELADO':   return '#EF4444';
    default:            return '#D1D5DB';
  }
}

function formatFecha(iso: string | null): string {
  if (!iso) return '—';
  return iso.split('T')[0]; // Muestra solo "YYYY-MM-DD"
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TransferenciaBodegaScreen() {
  const [transferencias, setTransferencias] = useState<TransferenciaBodega[]>([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [modalVisible, setModalVisible]     = useState(false);
  const [selected, setSelected]             = useState<TransferenciaBodega | null>(null);

  const fetchTransferencias = async () => {
    setLoading(true);
    try {
      const data = await getTransferenciasBodega();
      setTransferencias(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar las transferencias.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransferencias(); }, []);

  const handleDelete = async (item: TransferenciaBodega) => {
    try {
      await deleteTransferenciaBodega(item.ID);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `Transferencia "${item.CODIGO}" eliminada.` });
      fetchTransferencias();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la transferencia.' });
    }
  };

  const filtered = transferencias.filter(t =>
    (t.CODIGO  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.ESTADO  ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (t: TransferenciaBodega) => { setSelected(t); setModalVisible(true); };

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Transferencias de Bodega</Text>
          <Text style={styles.pageSubtitle}>{transferencias.length} registros</Text>
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
          placeholder="Buscar por código o estado…"
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
          <FontAwesome5 name="exchange-alt" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const cfg = estadoConfig(item.ESTADO);
            return (
              <View style={styles.card}>
                {/* Barra lateral de color según estado */}
                <View style={[styles.colorBar, { backgroundColor: barColor(item.ESTADO) }]} />

                <View style={styles.cardContent}>
                  {/* Fila superior */}
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardCodigo} numberOfLines={1}>{item.CODIGO ?? '—'}</Text>
                      <Text style={styles.cardSub}>
                        {item.ID_ORIGEN ?? '—'} → {item.ID_DESTINO ?? '—'}
                      </Text>
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.estadoText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  {/* Chips informativos */}
                  <View style={styles.chips}>
                    {item.CANTIDAD !== null && (
                      <InfoChip icon="cubes" label={`Cant: ${item.CANTIDAD}`} />
                    )}
                    {item.FECHA_ENVIO && (
                      <InfoChip icon="paper-plane" label={`Envío: ${formatFecha(item.FECHA_ENVIO)}`} />
                    )}
                    {item.FECHA_ENTREGA && (
                      <InfoChip icon="flag-checkered" label={`Entrega: ${formatFecha(item.FECHA_ENTREGA)}`} />
                    )}
                    {item.ID_ARTICULO !== null && (
                      <InfoChip icon="box" label={`Art: ${item.ID_ARTICULO}`} />
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
      <TransferenciaBodegaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        transferencia={selected}
        onSaved={() => { setModalVisible(false); fetchTransferencias(); }}
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

  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: Layout.spacing.medium },
  searchInput:   { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText:  { fontSize: 13, color: Colors.textMuted },

  card:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  colorBar:    { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardCodigo:  { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardSub:     { fontSize: 11, color: Colors.textMuted },

  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  estadoText:  { fontSize: 10, fontWeight: '600' },

  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },

  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText:   { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  btnDelete:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 11 },
});