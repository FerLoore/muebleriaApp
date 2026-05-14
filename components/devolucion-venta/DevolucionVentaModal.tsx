import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { DevolucionVenta, createDevolucionVenta, updateDevolucionVenta } from '../../services/devolucionVentaService';
import { getSalidasMercaderia } from '../../services/salidaMercaderiaService';
import { getUsuarios } from '../../services/usuariosService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const EMPTY = {
  NUMERO_DEVOLUCION: '', MOTIVO_DEVOLUCION: '',
  FECHA_DEVOLUCION_VENTA: '', TOTAL_DEVOLUCION_VENTA: '',
  OBSERVACION_DEVOLUCION_VENTA: '', ESTADO_DEVOLUCION_VENTA: '',
  ID_SALIDA_MERCADERIA: null as number | null,
  ID_USUARIO_CREA: null as number | null,
  ID_USUARIO_MODIFICA: null as number | null,
};

type FormState = typeof EMPTY;
type Props = { visible: boolean; onClose: () => void; item: DevolucionVenta | null; onSaved: () => void; };

export default function DevolucionVentaModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [salidas, setSalidas]   = useState<DropdownOption[]>([]);
  const [usuarios, setUsuarios] = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  // Carga de opciones
  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getSalidasMercaderia(), getUsuarios()])
      .then(([sal, usr]) => {
        setSalidas(sal.map(s => ({
          label: `#${s.ID_SALIDA_MERCADERIA} – ${s.NUMERO_SALIDA_MERCADERIA ?? '—'} (${s.ESTADO_SALIDA_MERCADERIA ?? '—'})`,
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

  // Populate form when editing
  useEffect(() => {
    if (item) {
      setForm({
        NUMERO_DEVOLUCION:            item.NUMERO_DEVOLUCION ?? '',
        MOTIVO_DEVOLUCION:            item.MOTIVO_DEVOLUCION ?? '',
        FECHA_DEVOLUCION_VENTA:       item.FECHA_DEVOLUCION_VENTA ?? '',
        TOTAL_DEVOLUCION_VENTA:       item.TOTAL_DEVOLUCION_VENTA != null ? String(item.TOTAL_DEVOLUCION_VENTA) : '',
        OBSERVACION_DEVOLUCION_VENTA: item.OBSERVACION_DEVOLUCION_VENTA ?? '',
        ESTADO_DEVOLUCION_VENTA:      item.ESTADO_DEVOLUCION_VENTA ?? '',
        ID_SALIDA_MERCADERIA:         item.ID_SALIDA_MERCADERIA,
        ID_USUARIO_CREA:              item.ID_USUARIO_CREA,
        ID_USUARIO_MODIFICA:          item.ID_USUARIO_MODIFICA,
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const setTxt = (k: keyof FormState, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const setNum = (k: keyof FormState, v: number | null) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.NUMERO_DEVOLUCION.trim()) e.NUMERO_DEVOLUCION = 'Requerido';
    if (!form.MOTIVO_DEVOLUCION.trim()) e.MOTIVO_DEVOLUCION = 'Requerido';
    if (!form.ESTADO_DEVOLUCION_VENTA.trim()) e.ESTADO_DEVOLUCION_VENTA = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<DevolucionVenta, 'ID_DEVOLUCION_VENTA'> = {
      NUMERO_DEVOLUCION:            form.NUMERO_DEVOLUCION || null,
      MOTIVO_DEVOLUCION:            form.MOTIVO_DEVOLUCION || null,
      FECHA_DEVOLUCION_VENTA:       form.FECHA_DEVOLUCION_VENTA || null,
      TOTAL_DEVOLUCION_VENTA:       form.TOTAL_DEVOLUCION_VENTA !== '' ? Number(form.TOTAL_DEVOLUCION_VENTA) : null,
      OBSERVACION_DEVOLUCION_VENTA: form.OBSERVACION_DEVOLUCION_VENTA || null,
      ESTADO_DEVOLUCION_VENTA:      form.ESTADO_DEVOLUCION_VENTA || null,
      ID_SALIDA_MERCADERIA:         form.ID_SALIDA_MERCADERIA,
      ID_USUARIO_CREA:              form.ID_USUARIO_CREA,
      ID_USUARIO_MODIFICA:          form.ID_USUARIO_MODIFICA,
    };
    try {
      if (item) { await updateDevolucionVenta(item.ID_DEVOLUCION_VENTA, payload); }
      else       { await createDevolucionVenta(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Devolución guardada.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Devolución' : 'Nueva Devolución'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Identificación" />
        <F label="Número Devolución *" val={form.NUMERO_DEVOLUCION} onChange={v => setTxt('NUMERO_DEVOLUCION', v)} err={errors.NUMERO_DEVOLUCION} ph="Ej. DEV-001" />
        <F label="Motivo *" val={form.MOTIVO_DEVOLUCION} onChange={v => setTxt('MOTIVO_DEVOLUCION', v)} err={errors.MOTIVO_DEVOLUCION} ph="Motivo de la devolución" ml />
        <Sec label="Fechas y Totales" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <DatePickerField
            label="Fecha Devolución"
            value={form.FECHA_DEVOLUCION_VENTA as string}
            onChange={v => setTxt('FECHA_DEVOLUCION_VENTA', v)}
            flex
          />
          <F flex label="Total Devolución" val={form.TOTAL_DEVOLUCION_VENTA as string} onChange={v => setTxt('TOTAL_DEVOLUCION_VENTA', v)} kb="numeric" ph="0.00" />
        </View>
        <Sec label="Estado y Observaciones" />
        <F label="Estado *" val={form.ESTADO_DEVOLUCION_VENTA} onChange={v => setTxt('ESTADO_DEVOLUCION_VENTA', v)} err={errors.ESTADO_DEVOLUCION_VENTA} ph="Ej. PENDIENTE, APROBADA" />
        <F label="Observaciones" val={form.OBSERVACION_DEVOLUCION_VENTA} onChange={v => setTxt('OBSERVACION_DEVOLUCION_VENTA', v)} ph="Notas adicionales..." ml />
        <Sec label="Referencias" />
        <DropdownSelect
          label="Salida Mercadería"
          value={form.ID_SALIDA_MERCADERIA}
          onChange={v => setNum('ID_SALIDA_MERCADERIA', v)}
          options={salidas}
          loading={loadingOpts}
          placeholder="Seleccionar salida de mercadería..."
          error={errors.ID_SALIDA_MERCADERIA}
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
      <Footer onClose={onClose} onSave={handleSave} saving={saving} isEdit={!!item} label="devolución" />
    </Drawer>
  );
}

function Sec({ label }: { label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
  </View>;
}
function F({ label, val, onChange, err, ph, kb = 'default', ml, flex }: {
  label: string; val: string; onChange: (v: string) => void; err?: string; ph?: string; kb?: any; ml?: boolean; flex?: boolean;
}) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 }}>{label}</Text>
      <TextInput
        style={[{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text }, ml && { height: 80, textAlignVertical: 'top' }]}
        value={val} onChangeText={onChange} placeholder={ph} placeholderTextColor={Colors.textMuted} keyboardType={kb} multiline={ml} />
      {!!err && <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>{err}</Text>}
    </View>
  );
}
function Footer({ onClose, onSave, saving, isEdit, label }: { onClose: () => void; onSave: () => void; saving: boolean; isEdit: boolean; label: string }) {
  return (
    <View style={s.footer}>
      <TouchableOpacity style={s.btnCancel} onPress={onClose} disabled={saving}><Text style={s.btnCancelText}>Cancelar</Text></TouchableOpacity>
      <TouchableOpacity style={[s.btnSave, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{isEdit ? 'Guardar cambios' : `Crear ${label}`}</Text></>}
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  scroll: { flex: 1 }, content: { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
