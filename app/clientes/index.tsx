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
import ClienteModal from '../../components/clientes/ClientesModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  Cliente,
  deleteCliente,
  getClientes,
} from '../../services/clienteService';
 
// ─── Componente principal ─────────────────────────────────────────────────────
 
export default function ClienteScreen() {
  const [clientes, setClientes]         = useState<Cliente[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState<Cliente | null>(null);
 
  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data = await getClientes();
      setClientes(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar los clientes.' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchClientes(); }, []);
 
  const handleDelete = async (item: Cliente) => {
    try {
      await deleteCliente(item.ID_CLIENTE);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: `"${item.RAZON_SOCIAL_CLIENTE}" fue eliminado.` });
      fetchClientes();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar el cliente.' });
    }
  };
 
  const filtered = clientes.filter(c =>
    (c.RAZON_SOCIAL_CLIENTE ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.CODIGO_CLIENTE       ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.NIT_CLIENTE          ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.EMAIL_CLIENTE        ?? '').toLowerCase().includes(search.toLowerCase())
  );
 
  const openCreate = () => { setSelected(null); setModalVisible(true); };
  const openEdit   = (c: Cliente) => { setSelected(c); setModalVisible(true); };
 
  // Resumen
  const activos   = clientes.filter(c => c.ESTADO_CLIENTE === 'A').length;
  const inactivos = clientes.length - activos;
 
  return (
    <View style={styles.container}>
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Clientes</Text>
          <Text style={styles.pageSubtitle}>{clientes.length} registros</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={openCreate}>
          <FontAwesome5 name="plus" size={12} color="#fff" />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
 
      {/* ── Resumen ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="user-check" size={13} color="#059669" />
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{activos}</Text>
          <Text style={styles.summaryLabel}>Activos</Text>
        </View>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="user-times" size={13} color="#9CA3AF" />
          <Text style={[styles.summaryValue, { color: '#9CA3AF' }]}>{inactivos}</Text>
          <Text style={styles.summaryLabel}>Inactivos</Text>
        </View>
      </View>
 
      {/* ── Buscador ── */}
      <View style={styles.searchWrapper}>
        <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, código, NIT o email…"
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
          <FontAwesome5 name="users" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.ID_CLIENTE)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Barra lateral según estado */}
              <View style={[
                styles.colorBar,
                { backgroundColor: item.ESTADO_CLIENTE === 'A' ? Colors.primary : '#D1D5DB' }
              ]} />
 
              <View style={styles.cardContent}>
                {/* Fila superior */}
                <View style={styles.cardRow}>
                  {/* Avatar con inicial */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.RAZON_SOCIAL_CLIENTE ?? '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.cardNombre} numberOfLines={1}>
                      {item.RAZON_SOCIAL_CLIENTE ?? '—'}
                    </Text>
                    <Text style={styles.cardCodigo}>
                      {item.CODIGO_CLIENTE ?? '—'} · NIT: {item.NIT_CLIENTE ?? '—'}
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { backgroundColor: item.ESTADO_CLIENTE === 'A' ? '#FFF8E7' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.estadoText,
                      { color: item.ESTADO_CLIENTE === 'A' ? Colors.primary : '#9CA3AF' }
                    ]}>
                      {item.ESTADO_CLIENTE === 'A' ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
 
                {/* Chips informativos */}
                <View style={styles.chips}>
                  {!!item.TELEFON_CLIENTE && (
                    <InfoChip icon="phone" label={item.TELEFON_CLIENTE} />
                  )}
                  {!!item.EMAIL_CLIENTE && (
                    <InfoChip icon="envelope" label={item.EMAIL_CLIENTE} />
                  )}
                  {item.LIMITE_CREDITO_CLIENTE !== null && (
                    <InfoChip icon="credit-card" label={`Crédito: Q${item.LIMITE_CREDITO_CLIENTE}`} />
                  )}
                  {item.PLAZO_PAGO_CLIENTES !== null && (
                    <InfoChip icon="calendar-alt" label={`Plazo: ${item.PLAZO_PAGO_CLIENTES} días`} />
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
      <ClienteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cliente={selected}
        onSaved={() => { setModalVisible(false); fetchClientes(); }}
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
  cardRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
 
  avatar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 15, fontWeight: '700', color: Colors.primary },
 
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