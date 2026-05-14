import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import {
  TransferenciaBodega,
  createTransferenciaBodega,
  updateTransferenciaBodega,
} from '../../services/transferenciaBodegaService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO'];

const EMPTY_FORM = {
  CODIGO:              '',
  CANTIDAD:            '',
  FECHA_ENVIO:         '',
  FECHA_ENTREGA:       '',
  ESTADO:              'PENDIENTE',
  ID_ORIGEN:           '',
  ID_DESTINO:          '',
  ID_ARTICULO:         '',
  ID_USUARIO_CREA:     '',
  ID_USUARIO_MODIFICA: '',
};

type Form = typeof EMPTY_FORM;

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
// El backend serializa DateTime como "2024-01-15T00:00:00"
// El TextInput trabaja con el formato legible "YYYY-MM-DD"
const toInputDate  = (iso: string | null) => iso ? iso.split('T')[0] : '';
const toISODate    = (d: string) => d ? `${d}T00:00:00` : null;

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible:      boolean;
  onClose:      () => void;
  transferencia: TransferenciaBodega | null;
  onSaved:      () => void;
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function TransferenciaBodegaModal({ visible, onClose, transferencia, onSaved }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});

  useEffect(() => {
    if (transferencia) {
      setForm({
        CODIGO:              transferencia.CODIGO              ?? '',
        CANTIDAD:            transferencia.CANTIDAD            !== null ? String(transferencia.CANTIDAD)            : '',
        FECHA_ENVIO:         toInputDate(transferencia.FECHA_ENVIO),
        FECHA_ENTREGA:       toInputDate(transferencia.FECHA_ENTREGA),
        ESTADO:              transferencia.ESTADO              ?? 'PENDIENTE',
        ID_ORIGEN:           transferencia.ID_ORIGEN           !== null ? String(transferencia.ID_ORIGEN)           : '',
        ID_DESTINO:          transferencia.ID_DESTINO          !== null ? String(transferencia.ID_DESTINO)          : '',
        ID_ARTICULO:         transferencia.ID_ARTICULO         !== null ? String(transferencia.ID_ARTICULO)         : '',
        ID_USUARIO_CREA:     transferencia.ID_USUARIO_CREA     !== null ? String(transferencia.ID_USUARIO_CREA)     : '',
        ID_USUARIO_MODIFICA: transferencia.ID_USUARIO_MODIFICA !== null ? String(transferencia.ID_USUARIO_MODIFICA) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [transferencia, visible]);

  const set = (key: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const num = (val: string) => val === '' ? null : Number(val);

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.CODIGO.trim())  e.CODIGO  = 'Requerido';
    if (!form.ESTADO.trim())  e.ESTADO  = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload: Omit<TransferenciaBodega, 'ID'> = {
      CODIGO:              form.CODIGO              || null,
      CANTIDAD:            num(form.CANTIDAD),
      FECHA_ENVIO:         toISODate(form.FECHA_ENVIO),
      FECHA_ENTREGA:       toISODate(form.FECHA_ENTREGA),
      ESTADO:              form.ESTADO              || null,
      ID_ORIGEN:           num(form.ID_ORIGEN),
      ID_DESTINO:          num(form.ID_DESTINO),
      ID_ARTICULO:         num(form.ID_ARTICULO),
      ID_USUARIO_CREA:     num(form.ID_USUARIO_CREA),
      ID_USUARIO_MODIFICA: num(form.ID_USUARIO_MODIFICA),
    };

    try {
      if (transferencia) {
        await updateTransferenciaBodega(transferencia.ID, payload);
      } else {
        await createTransferenciaBodega(payload);
      }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Transferencia guardada correctamente.' });
      onSaved();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la transferencia.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title={transferencia ? 'Editar Transferencia' : 'Nueva Transferencia'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Identificación ── */}
        <SectionTitle label="Identificación" />

        <Field
          label="Código *"
          value={form.CODIGO}
          onChangeText={v => set('CODIGO', v)}
          error={errors.CODIGO}
          placeholder="Ej: TRF-2024-001"
          autoCapitalize="characters"
        />

        <Field
          label="Cantidad"
          value={form.CANTIDAD}
          onChangeText={v => set('CANTIDAD', v)}
          keyboardType="decimal-pad"
          placeholder="Ej: 10"
        />

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
                {estadoLabel(est)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Fechas ── */}
        <SectionTitle label="Fechas" />

        <View style={styles.row}>
          <DatePickerField
            label="Fecha de envío"
            value={form.FECHA_ENVIO}
            onChange={v => set('FECHA_ENVIO', v)}
            error={errors.FECHA_ENVIO}
            flex
          />
          <View style={{ width: Layout.spacing.medium }} />
          <DatePickerField
            label="Fecha de entrega"
            value={form.FECHA_ENTREGA}
            onChange={v => set('FECHA_ENTREGA', v)}
            error={errors.FECHA_ENTREGA}
            flex
          />
        </View>

        {/* ── Relaciones ── */}
        <SectionTitle label="Ubicaciones" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="ID Origen"
              value={form.ID_ORIGEN}
              onChangeText={v => set('ID_ORIGEN', v)}
              keyboardType="numeric"
              placeholder="ID ubicación origen"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Destino"
              value={form.ID_DESTINO}
              onChangeText={v => set('ID_DESTINO', v)}
              keyboardType="numeric"
              placeholder="ID ubicación destino"
            />
          </View>
        </View>

        <SectionTitle label="Referencias" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="ID Artículo"
              value={form.ID_ARTICULO}
              onChangeText={v => set('ID_ARTICULO', v)}
              keyboardType="numeric"
              placeholder="ID del artículo"
            />
          </View>
          <View style={{ width: Layout.spacing.medium }} />
          <View style={{ flex: 1 }}>
            <Field
              label="ID Usuario Crea"
              value={form.ID_USUARIO_CREA}
              onChangeText={v => set('ID_USUARIO_CREA', v)}
              keyboardType="numeric"
              placeholder="ID usuario"
            />
          </View>
        </View>

        <Field
          label="ID Usuario Modifica"
          value={form.ID_USUARIO_MODIFICA}
          onChangeText={v => set('ID_USUARIO_MODIFICA', v)}
          keyboardType="numeric"
          placeholder="ID usuario que modifica"
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
                  {transferencia ? 'Guardar cambios' : 'Crear transferencia'}
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
    PENDIENTE:   'Pendiente',
    EN_TRANSITO: 'En tránsito',
    ENTREGADO:   'Entregado',
    CANCELADO:   'Cancelado',
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
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  row:             { flexDirection: 'row', alignItems: 'flex-start' },

  toggleRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  toggleBtn:       { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText:      { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive:{ color: '#fff', fontWeight: '600' },

  footer:        { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel:     { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave:       { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
});