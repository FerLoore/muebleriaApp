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
import { Articulo, createArticulo, updateArticulo } from '../../services/articuloService';
import Drawer from '../ui/Drawer';
 
// ─── Formulario vacío ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  CODIGO: '', CODIGO_BARRA: '', NOMBRE: '', DESCRIPCION: '',
  TIPO: '', MANEJA_LOTE: 'N', MANEJA_SERIE: 'N',
  STOCK_MIN: '', STOCK_MAX: '', PESO: '', ESTADO: 'A',
  FACTOR_CAJA: '', FACTOR_CAMA: '', FACTOR_TARIMA: '', ID_CATEGORIA: '',
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
  articulo: Articulo | null;   // null = crear, object = editar
  onSaved: () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function ArticuloModal({ visible, onClose, articulo, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
 
  // Rellenar formulario cuando se abre para editar
  useEffect(() => {
    if (articulo) {
      setForm({
        CODIGO:        articulo.CODIGO        ?? '',
        CODIGO_BARRA:  articulo.CODIGO_BARRA  ?? '',
        NOMBRE:        articulo.NOMBRE        ?? '',
        DESCRIPCION:   articulo.DESCRIPCION   ?? '',
        TIPO:          articulo.TIPO          ?? '',
        MANEJA_LOTE:   articulo.MANEJA_LOTE   ?? 'N',
        MANEJA_SERIE:  articulo.MANEJA_SERIE  ?? 'N',
        STOCK_MIN:     articulo.STOCK_MIN     !== null ? String(articulo.STOCK_MIN)     : '',
        STOCK_MAX:     articulo.STOCK_MAX     !== null ? String(articulo.STOCK_MAX)     : '',
        PESO:          articulo.PESO          !== null ? String(articulo.PESO)          : '',
        ESTADO:        articulo.ESTADO        ?? 'A',
        FACTOR_CAJA:   articulo.FACTOR_CAJA   !== null ? String(articulo.FACTOR_CAJA)   : '',
        FACTOR_CAMA:   articulo.FACTOR_CAMA   !== null ? String(articulo.FACTOR_CAMA)   : '',
        FACTOR_TARIMA: articulo.FACTOR_TARIMA !== null ? String(articulo.FACTOR_TARIMA) : '',
        ID_CATEGORIA:  articulo.ID_CATEGORIA  !== null ? String(articulo.ID_CATEGORIA)  : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [articulo, visible]);
 
  // ── Helpers ──────────────────────────────────────────────────────────────
  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
 
  const num = (val: string) => val === '' ? null : Number(val);
 
  // ── Validación ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.CODIGO.trim()) e.CODIGO = 'Requerido';
    if (!form.NOMBRE.trim()) e.NOMBRE = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<Articulo, 'ID'> = {
      CODIGO:        form.CODIGO,
      CODIGO_BARRA:  form.CODIGO_BARRA,
      NOMBRE:        form.NOMBRE,
      DESCRIPCION:   form.DESCRIPCION,
      TIPO:          form.TIPO,
      MANEJA_LOTE:   form.MANEJA_LOTE,
      MANEJA_SERIE:  form.MANEJA_SERIE,
      STOCK_MIN:     num(form.STOCK_MIN),
      STOCK_MAX:     num(form.STOCK_MAX),
      PESO:          num(form.PESO),
      ESTADO:        form.ESTADO,
      FACTOR_CAJA:   num(form.FACTOR_CAJA),
      FACTOR_CAMA:   num(form.FACTOR_CAMA),
      FACTOR_TARIMA: num(form.FACTOR_TARIMA),
      ID_CATEGORIA:  num(form.ID_CATEGORIA),
    };
 
    try {
      if (articulo) {
        await updateArticulo(articulo.ID, payload);
      } else {
        await createArticulo(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Artículo guardado correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el artículo.' });
    } finally {
      setSaving(false);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={articulo ? 'Editar Artículo' : 'Nuevo Artículo'}
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
          label="Código *"
          value={form.CODIGO}
          onChangeText={v => set('CODIGO', v)}
          error={errors.CODIGO}
          placeholder="Ej: ART-001"
          autoCapitalize="characters"
        />
        <Field
          label="Código de Barra"
          value={form.CODIGO_BARRA}
          onChangeText={v => set('CODIGO_BARRA', v)}
          placeholder="Ej: 7501234567890"
          keyboardType="numeric"
        />
        <Field
          label="Nombre *"
          value={form.NOMBRE}
          onChangeText={v => set('NOMBRE', v)}
          error={errors.NOMBRE}
          placeholder="Nombre del artículo"
        />
        <Field
          label="Descripción"
          value={form.DESCRIPCION}
          onChangeText={v => set('DESCRIPCION', v)}
          placeholder="Descripción opcional"
          multiline
        />
        <Field
          label="Tipo"
          value={form.TIPO}
          onChangeText={v => set('TIPO', v)}
          placeholder="Ej: PRODUCTO, SERVICIO"
          autoCapitalize="characters"
        />
        <Field
          label="ID Categoría"
          value={form.ID_CATEGORIA}
          onChangeText={v => set('ID_CATEGORIA', v)}
          keyboardType="numeric"
          placeholder="Número de categoría"
        />
 
        {/* ── Sección: Stock ── */}
        <SectionTitle label="Stock" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Stock Mínimo"
              value={form.STOCK_MIN}
              onChangeText={v => set('STOCK_MIN', v)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Stock Máximo"
              value={form.STOCK_MAX}
              onChangeText={v => set('STOCK_MAX', v)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
 
        <Field
          label="Peso (kg)"
          value={form.PESO}
          onChangeText={v => set('PESO', v)}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
 
        {/* ── Sección: Factores ── */}
        <SectionTitle label="Factores de empaque" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Caja"   value={form.FACTOR_CAJA}   onChangeText={v => set('FACTOR_CAJA', v)}   keyboardType="numeric" placeholder="0" />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field label="Cama"   value={form.FACTOR_CAMA}   onChangeText={v => set('FACTOR_CAMA', v)}   keyboardType="numeric" placeholder="0" />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field label="Tarima" value={form.FACTOR_TARIMA} onChangeText={v => set('FACTOR_TARIMA', v)} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
 
        {/* ── Sección: Opciones ── */}
        <SectionTitle label="Opciones" />
 
        <ToggleField
          label="Estado"
          value={form.ESTADO}
          options={[
            { value: 'A', label: 'Activo' },
            { value: 'I', label: 'Inactivo' },
          ]}
          onChange={v => set('ESTADO', v)}
        />
        <ToggleField
          label="Maneja Lote"
          value={form.MANEJA_LOTE}
          options={[{ value: 'S', label: 'Sí' }, { value: 'N', label: 'No' }]}
          onChange={v => set('MANEJA_LOTE', v)}
        />
        <ToggleField
          label="Maneja Serie"
          value={form.MANEJA_SERIE}
          options={[{ value: 'S', label: 'Sí' }, { value: 'N', label: 'No' }]}
          onChange={v => set('MANEJA_SERIE', v)}
        />
 
        <View style={{ height: 24 }} />
      </ScrollView>
 
      {/* ── Footer con botón guardar ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={onClose}
          disabled={saving}
        >
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
                  {articulo ? 'Guardar cambios' : 'Crear artículo'}
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
function Field({
  label, value, onChangeText, error,
  placeholder, keyboardType = 'default', multiline, autoCapitalize,
}: FieldProps) {
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
  wrap:  { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: Colors.text,
  },
  inputError: { borderColor: '#DC2626' },
  error:      { fontSize: 11, color: '#DC2626', marginTop: 3 },
});
 
type ToggleProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
};
function ToggleField({ label, value, options, onChange }: ToggleProps) {
  return (
    <View style={toggle.wrap}>
      <Text style={toggle.label}>{label}</Text>
      <View style={toggle.row}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[toggle.btn, value === opt.value && toggle.btnActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[toggle.text, value === opt.value && toggle.textActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const toggle = StyleSheet.create({
  wrap:      { marginBottom: 14 },
  label:     { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  row:       { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', backgroundColor: Colors.background,
  },
  btnActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  text:       { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  textActive: { color: '#fff', fontWeight: '600' },
});
 
// ─── Estilos principales ──────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
 
  row: { flexDirection: 'row', alignItems: 'flex-start' },
 
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  btnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
 
  btnSave: {
    flex: 2, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12, borderRadius: 8,
  },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});