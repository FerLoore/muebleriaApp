import { FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Dimensions, FlatList, Image,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CatalogoDetalleModal from '../../components/catalogo/CatalogoDetalleModal';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  ArticuloCatalogo, buscarCatalogo, getCatalogo, getCatalogoById,
} from '../../services/catalogoService';

const { width } = Dimensions.get('window');
const IS_WIDE   = width >= 768;
const COLS      = IS_WIDE ? 4 : 2;
const PAGE_SIZE = 12;
const TIPOS_USO = ['Todos', 'Interior', 'Exterior', 'Int./Ext.'];

export default function CatalogoScreen() {
  const [items, setItems]               = useState<ArticuloCatalogo[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const [search, setSearch]             = useState('');
  const [tipoUso, setTipoUso]           = useState('Todos');
  const [soloStock, setSoloStock]       = useState(false);
  const [precioMin, setPrecioMin]       = useState('');
  const [precioMax, setPrecioMax]       = useState('');
  const [expandFilters, setExpandFilters] = useState(false);
  const [page, setPage]                 = useState(1);

  const [detalleVisible, setDetalleVisible] = useState(false);
  const [selected, setSelected]         = useState<ArticuloCatalogo | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCatalogo = useCallback(async (texto?: string) => {
    setLoading(true); setError(null); setPage(1);
    try {
      const data = texto?.trim()
        ? await buscarCatalogo(texto.trim())
        : await getCatalogo({
            tipoUso:   tipoUso !== 'Todos' ? tipoUso : undefined,
            conStock:  soloStock ? 'S' : undefined,
            precioMin: precioMin ? Number(precioMin) : undefined,
            precioMax: precioMax ? Number(precioMax) : undefined,
          });
      setItems(data);
    } catch {
      setError('No se pudo cargar el catálogo.');
      Toast.show({ type: 'error', text1: 'Error de conexión' });
    } finally { setLoading(false); }
  }, [tipoUso, soloStock, precioMin, precioMax]);

  useEffect(() => { fetchCatalogo(); }, [fetchCatalogo]);

  const handleSearch = (t: string) => {
    setSearch(t);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchCatalogo(t), 500);
  };

  const applyFilters = () => {
    setExpandFilters(false);
    fetchCatalogo(search);
  };

  const paginated = useMemo(() => items.slice(0, page * PAGE_SIZE), [items, page]);

  const openDetalle = async (item: ArticuloCatalogo) => {
    if (!item.idArticulo) return;
    setDetalleVisible(true); setLoadingDetalle(true);
    try { setSelected(await getCatalogoById(item.idArticulo)); }
    catch { Toast.show({ type: 'error', text1: 'Error al cargar detalle' }); setDetalleVisible(false); }
    finally { setLoadingDetalle(false); }
  };

  const activeFilters =
    (tipoUso !== 'Todos' ? 1 : 0) +
    (soloStock ? 1 : 0) +
    (precioMin || precioMax ? 1 : 0);

  return (
    <View style={s.root}>

      {/* ════════════════════════════════════
          HEADER — Búsqueda + Filtros
      ════════════════════════════════════ */}
      <View style={s.header}>

        {/* Fila 1: título + contador */}
        <View style={s.titleRow}>
          <View>
            <Text style={s.pageTitle}>Catálogo</Text>
            <Text style={s.pageSubtitle}>
              {loading ? 'Cargando…' : `${items.length} producto${items.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          {/* Botón filtros */}
          <TouchableOpacity
            style={[s.filterBtn, activeFilters > 0 && s.filterBtnActive]}
            onPress={() => setExpandFilters(v => !v)}
          >
            <FontAwesome5 name="sliders-h" size={12} color={activeFilters > 0 ? '#fff' : Colors.primary} />
            <Text style={[s.filterBtnTxt, activeFilters > 0 && { color: '#fff' }]}>
              Filtros{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fila 2: Buscador */}
        <View style={s.searchBox}>
          <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar por nombre o referencia…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <FontAwesome5 name="times" size={12} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Fila 3: Chips de tipo (siempre visibles) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={s.chipRow}>
          {TIPOS_USO.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, tipoUso === t && s.chipActive]}
              onPress={() => { setTipoUso(t); fetchCatalogo(search); }}
            >
              <Text style={[s.chipTxt, tipoUso === t && s.chipTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Panel expandible: precio + stock + aplicar */}
        {expandFilters && (
          <View style={s.filterPanel}>
            <View style={s.panelRow}>
              <View style={s.panelCol}>
                <Text style={s.panelLabel}>Precio mínimo (Q)</Text>
                <TextInput
                  style={s.panelInput}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={precioMin}
                  onChangeText={setPrecioMin}
                />
              </View>
              <View style={s.panelCol}>
                <Text style={s.panelLabel}>Precio máximo (Q)</Text>
                <TextInput
                  style={s.panelInput}
                  placeholder="9999"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={precioMax}
                  onChangeText={setPrecioMax}
                />
              </View>
            </View>

            <TouchableOpacity style={s.stockRow} onPress={() => setSoloStock(v => !v)}>
              <View style={[s.check, soloStock && s.checkActive]}>
                {soloStock && <FontAwesome5 name="check" size={8} color="#fff" />}
              </View>
              <Text style={s.stockLbl}>Solo con stock disponible</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.applyBtn} onPress={applyFilters}>
              <FontAwesome5 name="check" size={12} color="#fff" style={{ marginRight: 6 }} />
              <Text style={s.applyTxt}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ════════════════════════════════════
          GRID DE PRODUCTOS
      ════════════════════════════════════ */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.stateMsg}>Cargando catálogo…</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <FontAwesome5 name="exclamation-circle" size={32} color={Colors.danger} />
          <Text style={s.stateMsg}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchCatalogo(search)}>
            <Text style={s.retryTxt}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={s.center}>
          <FontAwesome5 name="box-open" size={32} color={Colors.textMuted} />
          <Text style={s.stateMsg}>Sin resultados</Text>
          <Text style={s.stateHint}>Prueba con otros filtros o términos de búsqueda.</Text>
        </View>
      ) : (
        <FlatList
          key={COLS}
          data={paginated}
          keyExtractor={(item, i) => String(item.idArticulo ?? i)}
          numColumns={COLS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.gridRow}
          onEndReached={() => { if (paginated.length < items.length) setPage(p => p + 1); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            paginated.length < items.length
              ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
              : null
          }
          renderItem={({ item }) => <ProductCard item={item} onPress={() => openDetalle(item)} />}
        />
      )}

      {/* ════════════════════════════════════
          MODAL DETALLE
      ════════════════════════════════════ */}
      {loadingDetalle && (
        <View style={s.loadOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      <CatalogoDetalleModal
        visible={detalleVisible}
        articulo={selected}
        onClose={() => { setDetalleVisible(false); setSelected(null); }}
      />
    </View>
  );
}

// ─── Tarjeta de producto ─────────────────────────────────

const CARD_GAP = 10;
const CARD_W   = (width - Layout.spacing.large * 2 - CARD_GAP * (COLS - 1)) / COLS;

function ProductCard({ item, onPress }: { item: ArticuloCatalogo; onPress: () => void }) {
  const sinStock  = (item.stockDisponible ?? 0) === 0;
  const stockBajo = !sinStock && item.stockMinimo != null && (item.stockDisponible ?? 0) <= item.stockMinimo;
  const dotColor  = sinStock ? Colors.danger : stockBajo ? '#F59E0B' : '#22C55E';
  const tipoLabel = item.tipoUso?.toUpperCase();

  return (
    <TouchableOpacity style={[card.wrap, { width: CARD_W }]} onPress={onPress} activeOpacity={0.85}>

      {/* Imagen */}
      <View style={[card.imgBox, { height: CARD_W * 0.8 }]}>
        {item.fotoUrl
          ? <Image source={{ uri: item.fotoUrl }} style={card.img} resizeMode="cover" />
          : <View style={card.imgPlaceholder}>
              <FontAwesome5 name="couch" size={CARD_W * 0.22} color={Colors.border} />
            </View>
        }
        {tipoLabel && (
          <View style={card.tipoBadge}>
            <Text style={card.tipoBadgeTxt}>{tipoLabel}</Text>
          </View>
        )}
        <View style={[card.dot, { backgroundColor: dotColor }]} />
      </View>

      {/* Info */}
      <View style={card.info}>
        {item.referencia && <Text style={card.ref} numberOfLines={1}>{item.referencia}</Text>}
        <Text style={card.nombre} numberOfLines={2}>{item.nombre ?? '—'}</Text>
        {(item.color || item.material) && (
          <Text style={card.sub} numberOfLines={1}>
            {[item.color, item.material].filter(Boolean).join(' · ')}
          </Text>
        )}
        <View style={card.footer}>
          <Text style={card.precio}>
            {item.precioActual != null ? `Q ${item.precioActual.toFixed(2)}` : '—'}
          </Text>
          <Text style={[card.stock, { color: dotColor }]}>
            {sinStock ? 'Sin stock' : `${item.stockDisponible}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Estilos ─────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Layout.spacing.large,
    paddingTop: Layout.spacing.medium,
    paddingBottom: 0,
  },
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  pageTitle:  { fontSize: 20, fontWeight: '700', color: Colors.text },
  pageSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterBtnTxt: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },

  chipScroll: { marginBottom: 12 },
  chipRow:   { flexDirection: 'row', gap: 8, paddingRight: Layout.spacing.large },
  chip:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  chipActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt:       { fontSize: 12, color: Colors.text, fontWeight: '500' },
  chipTxtActive: { color: '#fff', fontWeight: '700' },

  // Filter panel
  filterPanel: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 12, gap: 12 },
  panelRow:   { flexDirection: 'row', gap: 10 },
  panelCol:   { flex: 1, gap: 4 },
  panelLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  panelInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: Colors.text },

  stockRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check:      { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  stockLbl:   { fontSize: 13, color: Colors.text },

  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, borderRadius: 8, paddingVertical: 11 },
  applyTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Grid
  grid:    { padding: Layout.spacing.large, paddingTop: 14 },
  gridRow: { justifyContent: 'space-between', marginBottom: CARD_GAP },

  // States
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  stateMsg: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  stateHint:{ fontSize: 12, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },
  retryBtn: { backgroundColor: Colors.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryTxt: { color: '#fff', fontWeight: '600' },

  loadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
});

const card = StyleSheet.create({
  wrap:           { backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  imgBox:         { position: 'relative', backgroundColor: Colors.borderLight },
  img:            { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tipoBadge:      { position: 'absolute', top: 7, left: 7, backgroundColor: 'rgba(20,20,20,0.72)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tipoBadgeTxt:   { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  dot:            { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#fff' },
  info:           { padding: 10, gap: 2 },
  ref:    { fontSize: 9,  color: Colors.textMuted, fontWeight: '500', letterSpacing: 0.3 },
  nombre: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 17 },
  sub:    { fontSize: 10, color: Colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  precio: { fontSize: 13, fontWeight: '800', color: Colors.text },
  stock:  { fontSize: 10, fontWeight: '600' },
});
