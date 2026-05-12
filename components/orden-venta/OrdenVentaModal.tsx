import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  OrdenVenta,
  createOrdenVenta,
  updateOrdenVenta,
} from '../../services/ordenVentaService';
import Drawer from '../ui/Drawer';
 
// ─── Constantes ───────────────────────────────────────────────────────────────
const ESTADOS = ['PENDIENTE', 'APROBADA', 'EN_PROCESO', 'ENTREGADA', 'CANCELADA'];
 
const EMPTY_FORM = {
  NUMERO_ORDEN_VENTA:          '',
  FECHA_SOLICITUD_ORDEN_VENTA: '',
  FECHA_ENTREGA_ORDEN_VENTA:   '',
  SUBTOTAL_ORDEN_VENTA:        '',
  DESCUENTO_ORDEN_VENTA:       '',
  IMPUESTO_ORDEN_VENTA:        '',
  TOTAL_ORDEN_VENTA:           '',
  ESTADO_ORDEN_VENTA:          'PENDIENTE',
  ID_SUCURSAL_CLIENTE:         '',
  ID_USUARIO_CREA:             '',
  ID_USUARIO_MODIFICA:         '',
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Helpers de fecha ─────────────────────────────────────────────────────────
const toInputDate = (iso: string | null) => iso ? iso.split('T')[0] : '';
const toISODate   = (d: string) => d ? `${d}T00:00:00` : null;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
  orden:   OrdenVenta | null;
  onSaved: () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function OrdenVentaModal({ visible, onClose, orden, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
 
  useEffect(() => {
    if (orden) {
      setForm({
        NUMERO_ORDEN_VENTA:          orden.NUMERO_ORDEN_VENTA          ?? '',
        FECHA_SOLICITUD_ORDEN_VENTA: toInputDate(orden.FECHA_SOLICITUD_ORDEN_VENTA),
        FECHA_ENTREGA_ORDEN_VENTA:   toInputDate(orden.FECHA_ENTREGA_ORDEN_VENTA),
        SUBTOTAL_ORDEN_VENTA:        orden.SUBTOTAL_ORDEN_VENTA  !== null ? String(orden.SUBTOTAL_ORDEN_VENTA)  : '',
        DESCUENTO_ORDEN_VENTA:       orden.DESCUENTO_ORDEN_VENTA !== null ? String(orden.DESCUENTO_ORDEN_VENTA) : '',
        IMPUESTO_ORDEN_VENTA:        orden.IMPUESTO_ORDEN_VENTA  !== null ? String(orden.IMPUESTO_ORDEN_VENTA)  : '',
        TOTAL_ORDEN_VENTA:           orden.TOTAL_ORDEN_VENTA     !== null ? String(orden.TOTAL_ORDEN_VENTA)     : '',
        ESTADO_ORDEN_VENTA:          orden.ESTADO_ORDEN_VENTA    ?? 'PENDIENTE',
        ID_SUCURSAL_CLIENTE:         orden.ID_SUCURSAL_CLIENTE   !== null ? String(orden.ID_SUCURSAL_CLIENTE)   : '',
        ID_USUARIO_CREA:             orden.ID_USUARIO_CREA       !== null ? String(orden.ID_USUARIO_CREA)       : '',
        ID_USUARIO_MODIFICA:         orden.ID_USUARIO_MODIFICA   !== null ? String(orden.ID_USUARIO_MODIFICA)   : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [orden, visible]);
 
  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
 
  const num = (val: string) => val === '' ? null : Number(val);
 
  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.NUMERO_ORDEN_VENTA.trim()) e.NUMERO_ORDEN_VENTA = 'Requerido';
    if (form.FECHA_SOLICITUD_ORDEN_VENTA && !/^\d{4}-\d{2}-\d{2}$/.test(form.FECHA_SOLICITUD_ORDEN_VENTA))
      e.FECHA_SOLICITUD_ORDEN_VENTA = 'Formato: YYYY-MM-DD';
    if (form.FECHA_ENTREGA_ORDEN_VENTA && !/^\d{4}-\d{2}-\d{2}$/.test(form.FECHA_ENTREGA_ORDEN_VENTA))
      e.FECHA_ENTREGA_ORDEN_VENTA = 'Formato: YYYY-MM-DD';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<OrdenVenta, 'ID_ORDEN_VENTA'> = {
      NUMERO_ORDEN_VENTA:          form.NUMERO_ORDEN_VENTA          || null,
      FECHA_SOLICITUD_ORDEN_VENTA: toISODate(form.FECHA_SOLICITUD_ORDEN_VENTA),
      FECHA_ENTREGA_ORDEN_VENTA:   toISODate(form.FECHA_ENTREGA_ORDEN_VENTA),
      SUBTOTAL_ORDEN_VENTA:        num(form.SUBTOTAL_ORDEN_VENTA),
      DESCUENTO_ORDEN_VENTA:       num(form.DESCUENTO_ORDEN_VENTA),
      IMPUESTO_ORDEN_VENTA:        num(form.IMPUESTO_ORDEN_VENTA),
      TOTAL_ORDEN_VENTA:           num(form.TOTAL_ORDEN_VENTA),
      ESTADO_ORDEN_VENTA:          form.ESTADO_ORDEN_VENTA          || null,
      ID_SUCURSAL_CLIENTE:         num(form.ID_SUCURSAL_CLIENTE),
      ID_USUARIO_CREA:             num(form.ID_USUARIO_CREA),
      ID_USUARIO_MODIFICA:         num(form.ID_USUARIO_MODIFICA),
    };
 
    try {
      if (orden) {
        await updateOrdenVenta(orden.ID_ORDEN_VENTA, payload);
      } else {
        await createOrdenVenta(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Orden de venta guardada correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la orden de venta.' });
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={orden ? 'Editar Orden de Venta' : 'Nueva Orden de Venta'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Identificación ── */}
        <SectionTitle label="Identificación" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Número de orden *"
              value={form.NUMERO_ORDEN_VENTA}
              onChangeText={v => set('NUMERO_ORDEN_VENTA', v)}
              error={errors.NUMERO_ORDEN_VENTA}
              placeholder="Ej: OV-2024-001"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Sucursal cliente"
              value={form.ID_SUCURSAL_CLIENTE}
              onChangeText={v => set('ID_SUCURSAL_CLIENTE', v)}
              keyboardType="numeric"
              placeholder="ID sucursal"
            />
          </View>
        </View>
 
        {/* ── Estado ── */}
        <SectionTitle label="Estado" />
 
        <View style={styles.toggleRow}>
          {ESTADOS.map(est => (
            <TouchableOpacity
              key={est}
              style={[styles.toggleBtn, form.ESTADO_ORDEN_VENTA === est && styles.toggleBtnActive]}
              onPress={() => set('ESTADO_ORDEN_VENTA', est)}
            >
              <Text style={[styles.toggleText, form.ESTADO_ORDEN_VENTA === est && styles.toggleTextActive]}>
                {estadoLabel(est)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
 
        {/* ── Fechas ── */}
        <SectionTitle label="Fechas (YYYY-MM-DD)" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Fecha solicitud"
              value={form.FECHA_SOLICITUD_ORDEN_VENTA}
              onChangeText={v => set('FECHA_SOLICITUD_ORDEN_VENTA', v)}
              error={errors.FECHA_SOLICITUD_ORDEN_VENTA}
              placeholder="2024-01-15"
              keyboardType="numeric"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Fecha entrega"
              value={form.FECHA_ENTREGA_ORDEN_VENTA}
              onChangeText={v => set('FECHA_ENTREGA_ORDEN_VENTA', v)}
              error={errors.FECHA_ENTREGA_ORDEN_VENTA}
              placeholder="2024-01-20"
              keyboardType="numeric"
            />
          </View>
        </View>
 
        {/* ── Montos ── */}
        <SectionTitle label="Montos" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Subtotal"
              value={form.SUBTOTAL_ORDEN_VENTA}
              onChangeText={v => set('SUBTOTAL_ORDEN_VENTA', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Descuento"
              value={form.DESCUENTO_ORDEN_VENTA}
              onChangeText={v => set('DESCUENTO_ORDEN_VENTA', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
        </View>
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Impuesto"
              value={form.IMPUESTO_ORDEN_VENTA}
              onChangeText={v => set('IMPUESTO_ORDEN_VENTA', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Total"
              value={form.TOTAL_ORDEN_VENTA}
              onChangeText={v => set('TOTAL_ORDEN_VENTA', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
        </View>
 
        {/* ── Referencias ── */}
        <SectionTitle label="Referencias" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="ID Usuario crea"
              value={form.ID_USUARIO_CREA}
              onChangeText={v => set('ID_USUARIO_CREA', v)}
              keyboardType="numeric"
              placeholder="ID usuario"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Usuario modifica"
              value={form.ID_USUARIO_MODIFICA}
              onChangeText={v => set('ID_USUARIO_MODIFICA', v)}
              keyboardType="numeric"
              placeholder="ID usuario"
            />
          </View>
        </View>
 
        <View style={{ height: 24 }} />
      </ScrollView>
 
      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={saving}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSave, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <FontAwesome5 name="save" size={13} color="#fff" />
                <Text style={styles.btnSaveText}>
                  {orden ? 'Guardar cambios' : 'Crear orden'}
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </Drawer>
  );
}
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function estadoLabel(estado: string): string {
  const map: Record<string, string> = {
    PENDIENTE:  'Pendiente',
    APROBADA:   'Aprobada',
    EN_PROCESO: 'En proceso',
    ENTREGADA:  'Entregada',
    CANCELADA:  'Cancelada',
  };
  return map[estado] ?? estado;
}
 
// ─── Sub-componentes ──────────────────────────────────────────────────────────
 
function SectionTitle({ label }: { label: string }) {
  return (
    <View style={section.wrap}>
      <Text style={section.text}>{label}</Text>
      <View style={section.line} />
    </View>
  );
}
const section = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 },
  text: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
});
 
type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};
function Field({ label, value, onChangeText, error, placeholder, keyboardType = 'default', autoCapitalize }: FieldProps) {
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <TextInput
        style={[field.input, !!error && field.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {!!error && <Text style={field.error}>{error}</Text>}
    </View>
  );
}
const field = StyleSheet.create({
  wrap:       { marginBottom: 14 },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  input:      { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text },
  inputError: { borderColor: '#DC2626' },
  error:      { fontSize: 11, color: '#DC2626', marginTop: 3 },
});
 
const styles = StyleSheet.create({
  scroll:           { flex: 1 },
  scrollContent:    { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  row:              { flexDirection: 'row', alignItems: 'flex-start' },
  toggleRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  toggleBtn:        { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText:       { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  footer:           { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel:        { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText:    { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave:          { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
});