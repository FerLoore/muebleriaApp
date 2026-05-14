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
  FacturaVenta,
  createFacturaVenta,
  updateFacturaVenta,
} from '../../services/facturaVentaService';
import { getSalidasMercaderia } from '../../services/salidaMercaderiaService';
import { getUsuarios } from '../../services/usuariosService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';
 
// ─── Constantes ───────────────────────────────────────────────────────────────
 
const ESTADOS = ['PENDIENTE', 'EMITIDA', 'ANULADA', 'PAGADA'];
 
const EMPTY_FORM = {
  SERIE_FACTURA_VENTA:           '',
  CORRELATIVO_FACTURA_VENTA:     '',
  FECHA_SALIDA_FACTURA_VENTA:    '',
  FECHA_FACTURA_VENTA:           '',
  OBSERVACION_SALIDA_MERCADERIA: '',
  ESTADO_SALIDA_MERCADERIA:      'PENDIENTE',
  TOTAL_FACTURA_VENTA:           '',
  ID_SALIDA_MERCADERIA:          null as number | null,
  ID_USUARIO_CREA:               null as number | null,
  ID_USUARIO_MODIFICA:           null as number | null,
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Helpers de fecha ─────────────────────────────────────────────────────────
const toInputDate = (iso: string | null) => iso ? iso.split('T')[0] : '';
const toISODate   = (d: string) => d ? `${d}T00:00:00` : null;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible:  boolean;
  onClose:  () => void;
  factura:  FacturaVenta | null;
  onSaved:  () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function FacturaVentaModal({ visible, onClose, factura, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string,string>>>({});

  const [salidas, setSalidas]   = useState<DropdownOption[]>([]);
  const [usuarios, setUsuarios] = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
 
  // Cargar opciones de lookup al abrir
  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getSalidasMercaderia(), getUsuarios()])
      .then(([sal, usr]) => {
        setSalidas(sal.map(s => ({
          label: `${s.NUMERO_SALIDA_MERCADERIA ?? '—'} (${s.ESTADO_SALIDA_MERCADERIA ?? '—'})`,
          value: s.ID_SALIDA_MERCADERIA,
        })));
        setUsuarios(usr.map(u => ({
          label: `${u.NombreUsuario ?? '—'} (ID ${u.IdUsuario})`,
          value: u.IdUsuario,
        })));
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar opciones.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  // Poblar formulario al editar
  useEffect(() => {
    if (factura) {
      setForm({
        SERIE_FACTURA_VENTA:           factura.SERIE_FACTURA_VENTA           ?? '',
        CORRELATIVO_FACTURA_VENTA:     factura.CORRELATIVO_FACTURA_VENTA     !== null ? String(factura.CORRELATIVO_FACTURA_VENTA)  : '',
        FECHA_SALIDA_FACTURA_VENTA:    toInputDate(factura.FECHA_SALIDA_FACTURA_VENTA),
        FECHA_FACTURA_VENTA:           toInputDate(factura.FECHA_FACTURA_VENTA),
        OBSERVACION_SALIDA_MERCADERIA: factura.OBSERVACION_SALIDA_MERCADERIA ?? '',
        ESTADO_SALIDA_MERCADERIA:      factura.ESTADO_SALIDA_MERCADERIA      ?? 'PENDIENTE',
        TOTAL_FACTURA_VENTA:           factura.TOTAL_FACTURA_VENTA           !== null ? String(factura.TOTAL_FACTURA_VENTA) : '',
        ID_SALIDA_MERCADERIA:          factura.ID_SALIDA_MERCADERIA ?? null,
        ID_USUARIO_CREA:               factura.ID_USUARIO_CREA ?? null,
        ID_USUARIO_MODIFICA:           factura.ID_USUARIO_MODIFICA ?? null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [factura, visible]);
 
  const setTxt = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const setNum = (key: keyof Form, value: number | null) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const num = (val: string) => val === '' ? null : Number(val);
 
  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!form.SERIE_FACTURA_VENTA.trim()) e.SERIE_FACTURA_VENTA = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<FacturaVenta, 'ID_FACTURA_VENTA'> = {
      SERIE_FACTURA_VENTA:           form.SERIE_FACTURA_VENTA           || null,
      CORRELATIVO_FACTURA_VENTA:     num(form.CORRELATIVO_FACTURA_VENTA as string),
      FECHA_SALIDA_FACTURA_VENTA:    toISODate(form.FECHA_SALIDA_FACTURA_VENTA as string),
      FECHA_FACTURA_VENTA:           toISODate(form.FECHA_FACTURA_VENTA as string),
      OBSERVACION_SALIDA_MERCADERIA: form.OBSERVACION_SALIDA_MERCADERIA || null,
      ESTADO_SALIDA_MERCADERIA:      form.ESTADO_SALIDA_MERCADERIA      || null,
      TOTAL_FACTURA_VENTA:           num(form.TOTAL_FACTURA_VENTA as string),
      ID_SALIDA_MERCADERIA:          form.ID_SALIDA_MERCADERIA,
      ID_USUARIO_CREA:               form.ID_USUARIO_CREA,
      ID_USUARIO_MODIFICA:           form.ID_USUARIO_MODIFICA,
    };
 
    try {
      if (factura) {
        await updateFacturaVenta(factura.ID_FACTURA_VENTA, payload);
      } else {
        await createFacturaVenta(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Factura guardada correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la factura.' });
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={factura ? 'Editar Factura' : 'Nueva Factura'}
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
              label="Serie *"
              value={form.SERIE_FACTURA_VENTA as string}
              onChangeText={v => setTxt('SERIE_FACTURA_VENTA', v)}
              error={errors.SERIE_FACTURA_VENTA}
              placeholder="Ej: A"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Correlativo"
              value={form.CORRELATIVO_FACTURA_VENTA as string}
              onChangeText={v => setTxt('CORRELATIVO_FACTURA_VENTA', v)}
              keyboardType="numeric"
              placeholder="Ej: 1001"
            />
          </View>
        </View>
 
        {/* ── Estado ── */}
        <SectionTitle label="Estado" />
 
        <View style={styles.toggleRow}>
          {ESTADOS.map(est => (
            <TouchableOpacity
              key={est}
              style={[styles.toggleBtn, form.ESTADO_SALIDA_MERCADERIA === est && styles.toggleBtnActive]}
              onPress={() => setTxt('ESTADO_SALIDA_MERCADERIA', est)}
            >
              <Text style={[styles.toggleText, form.ESTADO_SALIDA_MERCADERIA === est && styles.toggleTextActive]}>
                {estadoLabel(est)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
 
        {/* ── Fechas ── */}
        <SectionTitle label="Fechas" />
 
        <View style={styles.row}>
          <DatePickerField
            label="Fecha salida"
            value={form.FECHA_SALIDA_FACTURA_VENTA as string}
            onChange={v => setTxt('FECHA_SALIDA_FACTURA_VENTA', v)}
            error={errors.FECHA_SALIDA_FACTURA_VENTA}
            flex
          />
          <View style={{ width: Layout.spacing.medium }} />
          <DatePickerField
            label="Fecha factura"
            value={form.FECHA_FACTURA_VENTA as string}
            onChange={v => setTxt('FECHA_FACTURA_VENTA', v)}
            error={errors.FECHA_FACTURA_VENTA}
            flex
          />
        </View>
 
        {/* ── Montos ── */}
        <SectionTitle label="Montos" />
 
        <Field
          label="Total factura"
          value={form.TOTAL_FACTURA_VENTA as string}
          onChangeText={v => setTxt('TOTAL_FACTURA_VENTA', v)}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        {/* ── Observación ── */}
        <SectionTitle label="Observación" />

        <Field
          label="Observación"
          value={form.OBSERVACION_SALIDA_MERCADERIA as string}
          onChangeText={v => setTxt('OBSERVACION_SALIDA_MERCADERIA', v)}
          placeholder="Notas u observaciones…"
          multiline
        />
 
        {/* ── Referencias ── */}
        <SectionTitle label="Referencias" />
 
        <DropdownSelect
          label="Salida Mercadería"
          value={form.ID_SALIDA_MERCADERIA}
          onChange={v => setNum('ID_SALIDA_MERCADERIA', v)}
          options={salidas}
          loading={loadingOpts}
          placeholder="Seleccionar salida de mercadería..."
        />
        <DropdownSelect
          label="Usuario Crea"
          value={form.ID_USUARIO_CREA}
          onChange={v => setNum('ID_USUARIO_CREA', v)}
          options={usuarios}
          loading={loadingOpts}
          placeholder="Seleccionar usuario..."
        />
        <DropdownSelect
          label="Usuario Modifica"
          value={form.ID_USUARIO_MODIFICA}
          onChange={v => setNum('ID_USUARIO_MODIFICA', v)}
          options={usuarios}
          loading={loadingOpts}
          placeholder="Seleccionar usuario..."
        />
 
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
                  {factura ? 'Guardar cambios' : 'Crear factura'}
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
    PENDIENTE: 'Pendiente',
    EMITIDA:   'Emitida',
    ANULADA:   'Anulada',
    PAGADA:    'Pagada',
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
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};
function Field({ label, value, onChangeText, error, placeholder, keyboardType = 'default', multiline, autoCapitalize }: FieldProps) {
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <TextInput
        style={[field.input, !!error && field.inputError, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
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