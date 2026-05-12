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
  Bodega,
  createBodega,
  updateBodega,
} from '../../services/bodegasService';
import Drawer from '../ui/Drawer';
 
// ─── Constantes ───────────────────────────────────────────────────────────────
 
const TIPOS   = ['PRINCIPAL', 'SECUNDARIA', 'TRANSITO', 'CONSIGNACION'];
const ESTADOS = ['A', 'I']; // Activo / Inactivo — igual que Artículos
 
const EMPTY_FORM = {
  CODIGO:      '',
  NOMBRE:      '',
  TIPO:        'PRINCIPAL',
  DIRECCION:   '',
  ESTADO:      'A',
  ID_SUCURSAL: '',
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
  bodega:  Bodega | null;
  onSaved: () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function BodegaModal({ visible, onClose, bodega, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
 
  useEffect(() => {
    if (bodega) {
      setForm({
        CODIGO:      bodega.CODIGO      ?? '',
        NOMBRE:      bodega.NOMBRE      ?? '',
        TIPO:        bodega.TIPO        ?? 'PRINCIPAL',
        DIRECCION:   bodega.DIRECCION   ?? '',
        ESTADO:      bodega.ESTADO      ?? 'A',
        ID_SUCURSAL: bodega.ID_SUCURSAL !== null ? String(bodega.ID_SUCURSAL) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [bodega, visible]);
 
  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
 
  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.CODIGO.trim()) e.CODIGO = 'Requerido';
    if (!form.NOMBRE.trim()) e.NOMBRE = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<Bodega, 'ID'> = {
      CODIGO:      form.CODIGO      || null,
      NOMBRE:      form.NOMBRE      || null,
      TIPO:        form.TIPO        || null,
      DIRECCION:   form.DIRECCION   || null,
      ESTADO:      form.ESTADO      || null,
      ID_SUCURSAL: form.ID_SUCURSAL === '' ? null : Number(form.ID_SUCURSAL),
    };
 
    try {
      if (bodega) {
        await updateBodega(bodega.ID, payload);
      } else {
        await createBodega(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Bodega guardada correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la bodega.' });
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={bodega ? 'Editar Bodega' : 'Nueva Bodega'}
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
              label="Código *"
              value={form.CODIGO}
              onChangeText={v => set('CODIGO', v)}
              error={errors.CODIGO}
              placeholder="Ej: BOD-001"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Sucursal"
              value={form.ID_SUCURSAL}
              onChangeText={v => set('ID_SUCURSAL', v)}
              keyboardType="numeric"
              placeholder="ID de la sucursal"
            />
          </View>
        </View>
 
        <Field
          label="Nombre *"
          value={form.NOMBRE}
          onChangeText={v => set('NOMBRE', v)}
          error={errors.NOMBRE}
          placeholder="Ej: Bodega Central"
        />
 
        <Field
          label="Dirección"
          value={form.DIRECCION}
          onChangeText={v => set('DIRECCION', v)}
          placeholder="Dirección física de la bodega"
          multiline
        />
 
        {/* ── Tipo ── */}
        <SectionTitle label="Tipo" />
 
        <View style={styles.toggleRow}>
          {TIPOS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, form.TIPO === t && styles.toggleBtnActive]}
              onPress={() => set('TIPO', t)}
            >
              <Text style={[styles.toggleText, form.TIPO === t && styles.toggleTextActive]}>
                {tipoLabel(t)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
 
        {/* ── Estado ── */}
        <SectionTitle label="Estado" />
 
        <View style={styles.toggleRow}>
          {ESTADOS.map(est => (
            <TouchableOpacity
              key={est}
              style={[styles.toggleBtn, form.ESTADO === est && styles.toggleBtnActive]}
              onPress={() => set('ESTADO', est)}
            >
              <Text style={[styles.toggleText, form.ESTADO === est && styles.toggleTextActive]}>
                {est === 'A' ? 'Activo' : 'Inactivo'}
              </Text>
            </TouchableOpacity>
          ))}
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
                  {bodega ? 'Guardar cambios' : 'Crear bodega'}
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </Drawer>
  );
}
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function tipoLabel(tipo: string): string {
  const map: Record<string, string> = {
    PRINCIPAL:    'Principal',
    SECUNDARIA:   'Secundaria',
    TRANSITO:     'Tránsito',
    CONSIGNACION: 'Consignación',
  };
  return map[tipo] ?? tipo;
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
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  row:             { flexDirection: 'row', alignItems: 'flex-start' },
  toggleRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  toggleBtn:       { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText:      { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive:{ color: '#fff', fontWeight: '600' },
  footer:          { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel:       { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText:   { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave:         { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
});