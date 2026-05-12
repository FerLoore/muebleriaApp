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
    Cliente,
    createCliente,
    updateCliente,
} from '../../services/clienteService';
import Drawer from '../ui/Drawer';
 
// ─── Constantes ───────────────────────────────────────────────────────────────
const ESTADOS = ['A', 'I'];
 
const EMPTY_FORM = {
  CODIGO_CLIENTE:         '',
  RAZON_SOCIAL_CLIENTE:   '',
  NIT_CLIENTE:            '',
  LIMITE_CREDITO_CLIENTE: '',
  TELEFON_CLIENTE:        '',
  EMAIL_CLIENTE:          '',
  PLAZO_PAGO_CLIENTES:    '',
  ESTADO_CLIENTE:         'A',
  ID_LISTA_PRECIOS:       '',
  ID_SUCURSAL:            '',
};
 
type Form = typeof EMPTY_FORM;
 
// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible:  boolean;
  onClose:  () => void;
  cliente:  Cliente | null;
  onSaved:  () => void;
};
 
// ─── Componente ───────────────────────────────────────────────────────────────
export default function ClienteModal({ visible, onClose, cliente, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
 
  useEffect(() => {
    if (cliente) {
      setForm({
        CODIGO_CLIENTE:         cliente.CODIGO_CLIENTE         ?? '',
        RAZON_SOCIAL_CLIENTE:   cliente.RAZON_SOCIAL_CLIENTE   ?? '',
        NIT_CLIENTE:            cliente.NIT_CLIENTE             ?? '',
        LIMITE_CREDITO_CLIENTE: cliente.LIMITE_CREDITO_CLIENTE !== null ? String(cliente.LIMITE_CREDITO_CLIENTE) : '',
        TELEFON_CLIENTE:        cliente.TELEFON_CLIENTE         ?? '',
        EMAIL_CLIENTE:          cliente.EMAIL_CLIENTE           ?? '',
        PLAZO_PAGO_CLIENTES:    cliente.PLAZO_PAGO_CLIENTES    !== null ? String(cliente.PLAZO_PAGO_CLIENTES)    : '',
        ESTADO_CLIENTE:         cliente.ESTADO_CLIENTE          ?? 'A',
        ID_LISTA_PRECIOS:       cliente.ID_LISTA_PRECIOS        !== null ? String(cliente.ID_LISTA_PRECIOS)       : '',
        ID_SUCURSAL:            cliente.ID_SUCURSAL             !== null ? String(cliente.ID_SUCURSAL)            : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [cliente, visible]);
 
  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
 
  const num = (val: string) => val === '' ? null : Number(val);
 
  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.CODIGO_CLIENTE.trim())       e.CODIGO_CLIENTE       = 'Requerido';
    if (!form.RAZON_SOCIAL_CLIENTE.trim()) e.RAZON_SOCIAL_CLIENTE = 'Requerido';
    if (!form.NIT_CLIENTE.trim())          e.NIT_CLIENTE          = 'Requerido';
    if (form.EMAIL_CLIENTE && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EMAIL_CLIENTE))
      e.EMAIL_CLIENTE = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
 
    const payload: Omit<Cliente, 'ID_CLIENTE'> = {
      CODIGO_CLIENTE:         form.CODIGO_CLIENTE         || null,
      RAZON_SOCIAL_CLIENTE:   form.RAZON_SOCIAL_CLIENTE   || null,
      NIT_CLIENTE:            form.NIT_CLIENTE             || null,
      LIMITE_CREDITO_CLIENTE: num(form.LIMITE_CREDITO_CLIENTE),
      TELEFON_CLIENTE:        form.TELEFON_CLIENTE         || null,
      EMAIL_CLIENTE:          form.EMAIL_CLIENTE           || null,
      PLAZO_PAGO_CLIENTES:    num(form.PLAZO_PAGO_CLIENTES),
      ESTADO_CLIENTE:         form.ESTADO_CLIENTE          || null,
      ID_LISTA_PRECIOS:       num(form.ID_LISTA_PRECIOS),
      ID_SUCURSAL:            num(form.ID_SUCURSAL),
    };
 
    try {
      if (cliente) {
        await updateCliente(cliente.ID_CLIENTE, payload);
      } else {
        await createCliente(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Cliente guardado correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el cliente.' });
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              value={form.CODIGO_CLIENTE}
              onChangeText={v => set('CODIGO_CLIENTE', v)}
              error={errors.CODIGO_CLIENTE}
              placeholder="Ej: CLI-001"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="NIT *"
              value={form.NIT_CLIENTE}
              onChangeText={v => set('NIT_CLIENTE', v)}
              error={errors.NIT_CLIENTE}
              placeholder="Ej: 12345678-9"
              keyboardType="numeric"
            />
          </View>
        </View>
 
        <Field
          label="Razón social *"
          value={form.RAZON_SOCIAL_CLIENTE}
          onChangeText={v => set('RAZON_SOCIAL_CLIENTE', v)}
          error={errors.RAZON_SOCIAL_CLIENTE}
          placeholder="Nombre completo o razón social"
        />
 
        {/* ── Contacto ── */}
        <SectionTitle label="Contacto" />
 
        <Field
          label="Teléfono"
          value={form.TELEFON_CLIENTE}
          onChangeText={v => set('TELEFON_CLIENTE', v)}
          placeholder="Ej: 2222-3333"
          keyboardType="numeric"
        />
 
        <Field
          label="Email"
          value={form.EMAIL_CLIENTE}
          onChangeText={v => set('EMAIL_CLIENTE', v)}
          error={errors.EMAIL_CLIENTE}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
 
        {/* ── Crédito ── */}
        <SectionTitle label="Crédito" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Límite de crédito"
              value={form.LIMITE_CREDITO_CLIENTE}
              onChangeText={v => set('LIMITE_CREDITO_CLIENTE', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Plazo de pago (días)"
              value={form.PLAZO_PAGO_CLIENTES}
              onChangeText={v => set('PLAZO_PAGO_CLIENTES', v)}
              keyboardType="numeric"
              placeholder="Ej: 30"
            />
          </View>
        </View>
 
        {/* ── Estado ── */}
        <SectionTitle label="Estado" />
 
        <View style={styles.toggleRow}>
          {ESTADOS.map(est => (
            <TouchableOpacity
              key={est}
              style={[styles.toggleBtn, form.ESTADO_CLIENTE === est && styles.toggleBtnActive]}
              onPress={() => set('ESTADO_CLIENTE', est)}
            >
              <Text style={[styles.toggleText, form.ESTADO_CLIENTE === est && styles.toggleTextActive]}>
                {est === 'A' ? 'Activo' : 'Inactivo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
 
        {/* ── Referencias ── */}
        <SectionTitle label="Referencias" />
 
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="ID Lista de precios"
              value={form.ID_LISTA_PRECIOS}
              onChangeText={v => set('ID_LISTA_PRECIOS', v)}
              keyboardType="numeric"
              placeholder="ID lista"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Sucursal"
              value={form.ID_SUCURSAL}
              onChangeText={v => set('ID_SUCURSAL', v)}
              keyboardType="numeric"
              placeholder="ID sucursal"
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
                  {cliente ? 'Guardar cambios' : 'Crear cliente'}
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
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
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
  toggleRow:        { flexDirection: 'row', gap: 8, marginBottom: 14 },
  toggleBtn:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText:       { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  footer:           { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel:        { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText:    { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave:          { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
});