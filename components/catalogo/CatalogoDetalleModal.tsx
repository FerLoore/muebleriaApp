import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { ArticuloCatalogo } from '../../services/catalogoService';

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  visible:   boolean;
  articulo:  ArticuloCatalogo | null;
  onClose:   () => void;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CatalogoDetalleModal({ visible, articulo, onClose }: Props) {
  if (!articulo) return null;

  const stockColor =
    (articulo.stockDisponible ?? 0) === 0
      ? Colors.danger
      : (articulo.stockDisponible ?? 0) <= (articulo.stockMinimo ?? 0)
      ? '#F59E0B'
      : Colors.success;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* ── Encabezado ─────────────────────────────────── */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={2}>
              {articulo.nombre ?? '—'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <FontAwesome5 name="times" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

            {/* ── Imagen ─────────────────────────────────────── */}
            {articulo.fotoUrl ? (
              <Image source={{ uri: articulo.fotoUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <FontAwesome5 name="couch" size={40} color={Colors.border} />
                <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
              </View>
            )}

            {/* ── Precio y stock ─────────────────────────────── */}
            <View style={styles.highlight}>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Precio</Text>
                <Text style={styles.highlightValue}>
                  {articulo.precioActual != null
                    ? `Q ${articulo.precioActual.toFixed(2)}`
                    : '—'}
                </Text>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Stock</Text>
                <Text style={[styles.highlightValue, { color: stockColor }]}>
                  {articulo.stockDisponible ?? 0} uds.
                </Text>
              </View>
            </View>

            {/* ── Datos generales ────────────────────────────── */}
            <SectionTitle label="Información general" />
            <InfoRow label="Referencia"  value={articulo.referencia} />
            <InfoRow label="Código"      value={articulo.codigo} />
            <InfoRow label="Categoría"   value={articulo.categoria} />
            <InfoRow label="Tipo"        value={articulo.tipoArticulo} />
            <InfoRow label="Uso"         value={articulo.tipoUso} />
            <InfoRow label="Estado"      value={articulo.estado} />
            <InfoRow label="Descripción" value={articulo.descripcion} />

            {/* ── Características físicas ────────────────────── */}
            <SectionTitle label="Características" />
            <InfoRow label="Color"    value={articulo.color} />
            <InfoRow label="Material" value={articulo.material} />
            <InfoRow
              label="Peso"
              value={articulo.pesoKg != null ? `${articulo.pesoKg} kg` : null}
            />
            <InfoRow
              label="Dimensiones (cm)"
              value={
                articulo.alto != null
                  ? `${articulo.alto} × ${articulo.ancho} × ${articulo.profundo}`
                  : null
              }
            />

            {/* ── Stock ─────────────────────────────────────────── */}
            <SectionTitle label="Stock" />
            <InfoRow label="Disponible" value={String(articulo.stockDisponible ?? 0)} />
            <InfoRow label="Mínimo"     value={articulo.stockMinimo != null ? String(articulo.stockMinimo) : null} />
            <InfoRow label="Máximo"     value={articulo.stockMaximo != null ? String(articulo.stockMaximo) : null} />

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return (
    <View style={detail.section}>
      <Text style={detail.sectionText}>{label}</Text>
      <View style={detail.sectionLine} />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={detail.row}>
      <Text style={detail.rowLabel}>{label}</Text>
      <Text style={detail.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingHorizontal: Layout.spacing.large,
    paddingTop: Layout.spacing.large,
  },

  // header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.medium,
    gap: 12,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
  },

  // image
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: Layout.spacing.medium,
    backgroundColor: Colors.borderLight,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Layout.spacing.medium,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // precio / stock
  highlight: {
    flexDirection: 'row',
    backgroundColor: '#FAFAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.medium,
    overflow: 'hidden',
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  highlightLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  dividerV: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
});

const detail = StyleSheet.create({
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  rowValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
});
