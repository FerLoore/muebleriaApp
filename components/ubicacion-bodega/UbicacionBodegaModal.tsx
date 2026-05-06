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
import { UbicacionBodega, createUbicacionBodega, updateUbicacionBodega } from '../../services/ubicacionBodegaService';
import Drawer from '../ui/Drawer';
 
// ─── Formulario vacío ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  PASILLO:   '',
  RACK:      '',
  NIVEL:     '',
  POSICION:  '',
  CAPACIDAD: '',
  ID_BODEGA: '',
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible:   boolean;
  onClose:   () => void;
  ubicacion: UbicacionBodega | null;
  onSaved:   () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function UbicacionBodegaModal({ visible, onClose, ubicacion, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
 
  useEffect(() => {
    if (ubicacion) {
      setForm({
        PASILLO:   ubicacion.PASILLO   ?? '',
        RACK:      ubicacion.RACK      ?? '',
        NIVEL:     ubicacion.NIVEL     ?? '',
        POSICION:  ubicacion.POSICION  ?? '',
        CAPACIDAD: ubicacion.CAPACIDAD !== null ? String(ubicacion.CAPACIDAD) : '',
        ID_BODEGA: ubicacion.ID_BODEGA !== null ? String(ubicacion.ID_BODEGA) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [ubicacion, visible]);
 
  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
 
  const num = (val: string) => val === '' ? null : Number(val);
 
  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.PASILLO.trim()) e.PASILLO = 'Requerido';
    if (!form.RACK.trim())    e.RACK    = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<UbicacionBodega, 'ID'> = {
      PASILLO:   form.PASILLO   || null,
      RACK:      form.RACK      || null,
      NIVEL:     form.NIVEL     || null,
      POSICION:  form.POSICION  || null,
      CAPACIDAD: num(form.CAPACIDAD),
      ID_BODEGA: num(form.ID_BODEGA),
    };
 
    try {
      if (ubicacion) {
        await updateUbicacionBodega(ubicacion.ID, payload);
      } else {
        await createUbicacionBodega(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Ubicación guardada correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la ubicación.' });
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionTitle label="Ubicación en Bodega" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Pasillo *"
              value={form.PASILLO}
              onChangeText={v => set('PASILLO', v)}
              error={errors.PASILLO}
              placeholder="Ej: A1"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Rack *"
              value={form.RACK}
              onChangeText={v => set('RACK', v)}
              error={errors.RACK}
              placeholder="Ej: R-01"
              autoCapitalize="characters"
            />
          </View>
        </View>
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Nivel"
              value={form.NIVEL}
              onChangeText={v => set('NIVEL', v)}
              placeholder="Ej: N2"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Posición"
              value={form.POSICION}
              onChangeText={v => set('POSICION', v)}
              placeholder="Ej: P-05"
              autoCapitalize="characters"
            />
          </View>
        </View>
 
        <SectionTitle label="Capacidad y Bodega" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Capacidad"
              value={form.CAPACIDAD}
              onChangeText={v => set('CAPACIDAD', v)}
              keyboardType="numeric"
              placeholder="Ej: 100"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Bodega"
              value={form.ID_BODEGA}
              onChangeText={v => set('ID_BODEGA', v)}
              keyboardType="numeric"
              placeholder="Número de bodega"
            />
          </View>
        </View>
 
        <View style={{ height: 24 }} />
      </ScrollView>
 
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
                  {ubicacion ? 'Guardar cambios' : 'Crear ubicación'}
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </Drawer>
  );
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
        style={[field.input, !!error && field.inputError, multiline && { height: 72, textAlignVertical: 'top' }]}
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
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  row:           { flexDirection: 'row', alignItems: 'flex-start' },
  footer:        { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel:     { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave:       { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
});