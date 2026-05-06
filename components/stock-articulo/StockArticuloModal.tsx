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
  StockArticulo,
  createStockArticulo,
  updateStockArticulo,
} from '../../services/stockArticuloService';
import Drawer from '../ui/Drawer';

// ─── Formulario vacío ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  CANTIDAD_DISPONIBLE: '',
  CANTIDAD_RESERVADA:  '',
  CANTIDAD_TRANSITO:   '',
  COSTO_PROMEDIO:      '',
  ULTIMO_MOVIMIENTO:   '',
  ID_ARTICULO:         '',
  ID_UBICACION:        '',
};

type Form = typeof EMPTY_FORM;

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
const toInputDate = (iso: string | null) => iso ? iso.split('T')[0] : '';
const toISODate   = (d: string) => d ? `${d}T00:00:00` : null;

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
  stock:   StockArticulo | null;
  onSaved: () => void;
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function StockArticuloModal({ visible, onClose, stock, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});

  useEffect(() => {
    if (stock) {
      setForm({
        CANTIDAD_DISPONIBLE: stock.CANTIDAD_DISPONIBLE !== null ? String(stock.CANTIDAD_DISPONIBLE) : '',
        CANTIDAD_RESERVADA:  stock.CANTIDAD_RESERVADA  !== null ? String(stock.CANTIDAD_RESERVADA)  : '',
        CANTIDAD_TRANSITO:   stock.CANTIDAD_TRANSITO   !== null ? String(stock.CANTIDAD_TRANSITO)   : '',
        COSTO_PROMEDIO:      stock.COSTO_PROMEDIO      !== null ? String(stock.COSTO_PROMEDIO)      : '',
        ULTIMO_MOVIMIENTO:   toInputDate(stock.ULTIMO_MOVIMIENTO),
        ID_ARTICULO:         stock.ID_ARTICULO  !== null ? String(stock.ID_ARTICULO)  : '',
        ID_UBICACION:        stock.ID_UBICACION !== null ? String(stock.ID_UBICACION) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [stock, visible]);

  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const num = (val: string) => val === '' ? null : Number(val);

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.ID_ARTICULO.trim())  e.ID_ARTICULO  = 'Requerido';
    if (!form.ID_UBICACION.trim()) e.ID_UBICACION = 'Requerido';
    if (form.ULTIMO_MOVIMIENTO && !/^\d{4}-\d{2}-\d{2}$/.test(form.ULTIMO_MOVIMIENTO))
      e.ULTIMO_MOVIMIENTO = 'Formato: YYYY-MM-DD';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload: Omit<StockArticulo, 'ID'> = {
      CANTIDAD_DISPONIBLE: num(form.CANTIDAD_DISPONIBLE),
      CANTIDAD_RESERVADA:  num(form.CANTIDAD_RESERVADA),
      CANTIDAD_TRANSITO:   num(form.CANTIDAD_TRANSITO),
      COSTO_PROMEDIO:      num(form.COSTO_PROMEDIO),
      ULTIMO_MOVIMIENTO:   toISODate(form.ULTIMO_MOVIMIENTO),
      ID_ARTICULO:         num(form.ID_ARTICULO),
      ID_UBICACION:        num(form.ID_UBICACION),
    };

    try {
      if (stock) {
        await updateStockArticulo(stock.ID, payload);
      } else {
        await createStockArticulo(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Stock guardado correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el stock.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={stock ? 'Editar Stock' : 'Nuevo Stock'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Referencias ── */}
        <SectionTitle label="Referencias" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="ID Artículo *"
              value={form.ID_ARTICULO}
              onChangeText={v => set('ID_ARTICULO', v)}
              error={errors.ID_ARTICULO}
              keyboardType="numeric"
              placeholder="ID del artículo"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Ubicación *"
              value={form.ID_UBICACION}
              onChangeText={v => set('ID_UBICACION', v)}
              error={errors.ID_UBICACION}
              keyboardType="numeric"
              placeholder="ID de la ubicación"
            />
          </View>
        </View>

        {/* ── Cantidades ── */}
        <SectionTitle label="Cantidades" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Disponible"
              value={form.CANTIDAD_DISPONIBLE}
              onChangeText={v => set('CANTIDAD_DISPONIBLE', v)}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Reservada"
              value={form.CANTIDAD_RESERVADA}
              onChangeText={v => set('CANTIDAD_RESERVADA', v)}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="En tránsito"
              value={form.CANTIDAD_TRANSITO}
              onChangeText={v => set('CANTIDAD_TRANSITO', v)}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Costo promedio"
              value={form.COSTO_PROMEDIO}
              onChangeText={v => set('COSTO_PROMEDIO', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
        </View>

        {/* ── Fecha ── */}
        <SectionTitle label="Último movimiento (YYYY-MM-DD)" />

        <Field
          label="Fecha"
          value={form.ULTIMO_MOVIMIENTO}
          onChangeText={v => set('ULTIMO_MOVIMIENTO', v)}
          error={errors.ULTIMO_MOVIMIENTO}
          keyboardType="numeric"
          placeholder="2024-01-15"
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
                  {stock ? 'Guardar cambios' : 'Crear stock'}
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
};
function Field({ label, value, onChangeText, error, placeholder, keyboardType = 'default' }: FieldProps) {
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