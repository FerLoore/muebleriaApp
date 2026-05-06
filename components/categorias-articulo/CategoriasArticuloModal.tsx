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
  CategoriasArticulo,
  createCategoriaArticulo,
  updateCategoriaArticulo,
} from '../../services/categoriasArticuloService';
import Drawer from '../ui/Drawer';
 
// ─── Formulario vacío ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  NOMBRE:   '',
  CODIGO:   '',
  NIVEL:    '',
  ID_PADRE: '',
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible:   boolean;
  onClose:   () => void;
  categoria: CategoriasArticulo | null;
  onSaved:   () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function CategoriaArticuloModal({ visible, onClose, categoria, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
 
  useEffect(() => {
    if (categoria) {
      setForm({
        NOMBRE:   categoria.NOMBRE   ?? '',
        CODIGO:   categoria.CODIGO   ?? '',
        NIVEL:    categoria.NIVEL    !== null ? String(categoria.NIVEL)    : '',
        ID_PADRE: categoria.ID_PADRE !== null ? String(categoria.ID_PADRE) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [categoria, visible]);
 
  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
 
  const num = (val: string) => val === '' ? null : Number(val);
 
  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.NOMBRE.trim()) e.NOMBRE = 'Requerido';
    if (!form.CODIGO.trim()) e.CODIGO = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<CategoriasArticulo, 'ID'> = {
      NOMBRE:   form.NOMBRE   || null,
      CODIGO:   form.CODIGO   || null,
      NIVEL:    num(form.NIVEL),
      ID_PADRE: num(form.ID_PADRE),
    };
 
    try {
      if (categoria) {
        await updateCategoriaArticulo(categoria.ID, payload);
      } else {
        await createCategoriaArticulo(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Categoría guardada correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la categoría.' });
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={categoria ? 'Editar Categoría' : 'Nueva Categoría'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
 
        {/* ── Sección: Identificación ── */}
        <SectionTitle label="Identificación" />
 
        <Field
          label="Nombre *"
          value={form.NOMBRE}
          onChangeText={v => set('NOMBRE', v)}
          error={errors.NOMBRE}
          placeholder="Ej: Muebles de sala"
        />
        <Field
          label="Código *"
          value={form.CODIGO}
          onChangeText={v => set('CODIGO', v)}
          error={errors.CODIGO}
          placeholder="Ej: CAT-001"
          autoCapitalize="characters"
        />
 
        {/* ── Sección: Jerarquía ── */}
        <SectionTitle label="Jerarquía" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Nivel"
              value={form.NIVEL}
              onChangeText={v => set('NIVEL', v)}
              keyboardType="numeric"
              placeholder="Ej: 1"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Categoría Padre"
              value={form.ID_PADRE}
              onChangeText={v => set('ID_PADRE', v)}
              keyboardType="numeric"
              placeholder="Vacío si es raíz"
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
                  {categoria ? 'Guardar cambios' : 'Crear categoría'}
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
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  row:           { flexDirection: 'row', alignItems: 'flex-start' },
  footer:        { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel:     { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave:       { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
});