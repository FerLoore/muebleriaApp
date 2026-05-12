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
  DespachoDetalle,
  createDespachoDetalle,
  updateDespachoDetalle,
} from '../../services/despachoDetalleService';
import Drawer from '../ui/Drawer';

const ESTADOS = ['P', 'E', 'C'];
const ESTADO_LABEL: Record<string, string> = { P: 'Pendiente', E: 'En Ruta', C: 'Completado' };

const EMPTY_FORM = {
  ID_ORDEN_DESPACHO: '',
  SECUENCIA_ENTREGA_DESPACHO_DETALLE: '',
  ESTADO_DESPACHO_DETALLE: 'P',
  ID_TRASLADO: '',
  ID_FACTURA_VENTA: '',
  ID_SUCURSAL_ENTR: '',
};
type Form = typeof EMPTY_FORM;

type Props = {
  visible: boolean;
  onClose: () => void;
  item: DespachoDetalle | null;
  onSaved: () => void;
};

export default function DespachoDetalleModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});

  useEffect(() => {
    if (item) {
      setForm({
        ID_ORDEN_DESPACHO:                 String(item.ID_ORDEN_DESPACHO),
        SECUENCIA_ENTREGA_DESPACHO_DETALLE: String(item.SECUENCIA_ENTREGA_DESPACHO_DETALLE),
        ESTADO_DESPACHO_DETALLE:            item.ESTADO_DESPACHO_DETALLE ?? 'P',
        ID_TRASLADO:                        item.ID_TRASLADO   !== null ? String(item.ID_TRASLADO)   : '',
        ID_FACTURA_VENTA:                   item.ID_FACTURA_VENTA !== null ? String(item.ID_FACTURA_VENTA) : '',
        ID_SUCURSAL_ENTR:                   item.ID_SUCURSAL_ENTR !== null ? String(item.ID_SUCURSAL_ENTR) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [item, visible]);

  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
  const num = (v: string) => v === '' ? null : Number(v);

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.ID_ORDEN_DESPACHO.trim())                 e.ID_ORDEN_DESPACHO = 'Requerido';
    if (!form.SECUENCIA_ENTREGA_DESPACHO_DETALLE.trim()) e.SECUENCIA_ENTREGA_DESPACHO_DETALLE = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload: DespachoDetalle = {
      ID_ORDEN_DESPACHO:                 Number(form.ID_ORDEN_DESPACHO),
      SECUENCIA_ENTREGA_DESPACHO_DETALLE: Number(form.SECUENCIA_ENTREGA_DESPACHO_DETALLE),
      ESTADO_DESPACHO_DETALLE:            form.ESTADO_DESPACHO_DETALLE || null,
      ID_TRASLADO:                        num(form.ID_TRASLADO),
      ID_FACTURA_VENTA:                   num(form.ID_FACTURA_VENTA),
      ID_SUCURSAL_ENTR:                   num(form.ID_SUCURSAL_ENTR),
    };
    try {
      if (item) {
        await updateDespachoDetalle(payload);
      } else {
        await createDespachoDetalle(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Despacho detalle guardado.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Despacho Detalle' : 'Nuevo Despacho Detalle'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <SectionTitle label="Identificación" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="ID Orden Despacho *" value={form.ID_ORDEN_DESPACHO} onChangeText={v => set('ID_ORDEN_DESPACHO', v)} error={errors.ID_ORDEN_DESPACHO} keyboardType="numeric" placeholder="ID" />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field label="Secuencia *" value={form.SECUENCIA_ENTREGA_DESPACHO_DETALLE} onChangeText={v => set('SECUENCIA_ENTREGA_DESPACHO_DETALLE', v)} error={errors.SECUENCIA_ENTREGA_DESPACHO_DETALLE} keyboardType="numeric" placeholder="Secuencia" />
          </View>
        </View>

        <SectionTitle label="Estado" />
        <View style={styles.toggleRow}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est} style={[styles.toggleBtn, form.ESTADO_DESPACHO_DETALLE === est && styles.toggleBtnActive]} onPress={() => set('ESTADO_DESPACHO_DETALLE', est)}>
              <Text style={[styles.toggleText, form.ESTADO_DESPACHO_DETALLE === est && styles.toggleTextActive]}>{ESTADO_LABEL[est]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionTitle label="Referencias" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="ID Traslado" value={form.ID_TRASLADO} onChangeText={v => set('ID_TRASLADO', v)} keyboardType="numeric" placeholder="ID" />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field label="ID Factura Venta" value={form.ID_FACTURA_VENTA} onChangeText={v => set('ID_FACTURA_VENTA', v)} keyboardType="numeric" placeholder="ID" />
          </View>
        </View>
        <Field label="ID Sucursal Entrega" value={form.ID_SUCURSAL_ENTR} onChangeText={v => set('ID_SUCURSAL_ENTR', v)} keyboardType="numeric" placeholder="ID sucursal" />

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={saving}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <>
            <FontAwesome5 name="save" size={13} color="#fff" />
            <Text style={styles.btnSaveText}>{item ? 'Guardar cambios' : 'Crear registro'}</Text>
          </>}
        </TouchableOpacity>
      </View>
    </Drawer>
  );
}

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
  label: string; value: string; onChangeText: (v: string) => void;
  error?: string; placeholder?: string; keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  multiline?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};
function Field({ label, value, onChangeText, error, placeholder, keyboardType = 'default', multiline, autoCapitalize }: FieldProps) {
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <TextInput style={[field.input, !!error && field.inputError, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={Colors.textMuted} keyboardType={keyboardType}
        multiline={multiline} autoCapitalize={autoCapitalize} />
      {!!error && <Text style={field.error}>{error}</Text>}
    </View>
  );
}
const field = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text },
  inputError: { borderColor: '#DC2626' },
  error: { fontSize: 11, color: '#DC2626', marginTop: 3 },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
