import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Nomina, createNomina, updateNomina } from '../../services/nominaService';
import { getSucursales } from '../../services/sucursalesService';
import { getUsuarios } from '../../services/usuariosService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const EMPTY = {
  PERIODO_NOMINA:          '' as string,
  FECHA_PAGO_NOMINA:       '' as string,
  TOTAL_BRUTO_NOMINA:      '' as string,
  TOTAL_DESCUENTOS_NOMINA: '' as string,
  TOTAL_NETO_NOMINA:       '' as string,
  ESTADO_NOMINA:           '' as string,
  ID_SUCURSAL:        null as number | null,
  ID_USUARIO_CREA:    null as number | null,
  ID_USUARIO_MODIFICA: null as number | null,
};
type FormState = typeof EMPTY;
type Props = { visible: boolean; onClose: () => void; item: Nomina | null; onSaved: () => void; };

export default function NominaModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [sucursales, setSucursales] = useState<DropdownOption[]>([]);
  const [usuarios, setUsuarios]     = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getSucursales(), getUsuarios()])
      .then(([sucs, usrs]) => {
        setSucursales(sucs.map(s => ({ label: s.NombreSucursal ?? `Sucursal ${s.IdSucursal}`, value: s.IdSucursal })));
        setUsuarios(usrs.map(u => ({ label: `${u.NombreUsuario ?? '—'} (ID ${u.IdUsuario})`, value: u.IdUsuario })));
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar opciones.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  useEffect(() => {
    if (item) {
      setForm({
        PERIODO_NOMINA:          item.PERIODO_NOMINA ?? '',
        FECHA_PAGO_NOMINA:       item.FECHA_PAGO_NOMINA ?? '',
        TOTAL_BRUTO_NOMINA:      item.TOTAL_BRUTO_NOMINA != null ? String(item.TOTAL_BRUTO_NOMINA) : '',
        TOTAL_DESCUENTOS_NOMINA: item.TOTAL_DESCUENTOS_NOMINA != null ? String(item.TOTAL_DESCUENTOS_NOMINA) : '',
        TOTAL_NETO_NOMINA:       item.TOTAL_NETO_NOMINA != null ? String(item.TOTAL_NETO_NOMINA) : '',
        ESTADO_NOMINA:           item.ESTADO_NOMINA ?? '',
        ID_SUCURSAL:             item.ID_SUCURSAL,
        ID_USUARIO_CREA:         item.ID_USUARIO_CREA,
        ID_USUARIO_MODIFICA:     item.ID_USUARIO_MODIFICA,
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const setTxt = (k: keyof FormState, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const setNum = (k: keyof FormState, v: number | null) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.PERIODO_NOMINA.trim()) e.PERIODO_NOMINA = 'Requerido';
    if (!form.ESTADO_NOMINA.trim())  e.ESTADO_NOMINA  = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<Nomina, 'ID_NOMINA'> = {
      PERIODO_NOMINA:          form.PERIODO_NOMINA || null,
      FECHA_PAGO_NOMINA:       form.FECHA_PAGO_NOMINA || null,
      TOTAL_BRUTO_NOMINA:      form.TOTAL_BRUTO_NOMINA !== '' ? Number(form.TOTAL_BRUTO_NOMINA) : null,
      TOTAL_DESCUENTOS_NOMINA: form.TOTAL_DESCUENTOS_NOMINA !== '' ? Number(form.TOTAL_DESCUENTOS_NOMINA) : null,
      TOTAL_NETO_NOMINA:       form.TOTAL_NETO_NOMINA !== '' ? Number(form.TOTAL_NETO_NOMINA) : null,
      ESTADO_NOMINA:           form.ESTADO_NOMINA || null,
      ID_SUCURSAL:             form.ID_SUCURSAL,
      ID_USUARIO_CREA:         form.ID_USUARIO_CREA,
      ID_USUARIO_MODIFICA:     form.ID_USUARIO_MODIFICA,
    };
    try {
      if (item) { await updateNomina(item.ID_NOMINA, payload); }
      else       { await createNomina(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Nómina guardada.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Nómina' : 'Nueva Nómina'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Período y Estado" />
        <F label="Período *" val={form.PERIODO_NOMINA} onChange={v => setTxt('PERIODO_NOMINA', v)} err={errors.PERIODO_NOMINA} ph="Ej. 2025-01" />
        <F label="Estado *" val={form.ESTADO_NOMINA} onChange={v => setTxt('ESTADO_NOMINA', v)} err={errors.ESTADO_NOMINA} ph="Ej. ACTIVA, CERRADA, PAGADA" />
        <DatePickerField
          label="Fecha de Pago"
          value={form.FECHA_PAGO_NOMINA}
          onChange={v => setTxt('FECHA_PAGO_NOMINA', v)}
        />
        <Sec label="Totales" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Total Bruto" val={form.TOTAL_BRUTO_NOMINA} onChange={v => setTxt('TOTAL_BRUTO_NOMINA', v)} kb="numeric" ph="0.00" />
          <F flex label="Total Descuentos" val={form.TOTAL_DESCUENTOS_NOMINA} onChange={v => setTxt('TOTAL_DESCUENTOS_NOMINA', v)} kb="numeric" ph="0.00" />
        </View>
        <F label="Total Neto" val={form.TOTAL_NETO_NOMINA} onChange={v => setTxt('TOTAL_NETO_NOMINA', v)} kb="numeric" ph="0.00" />
        <Sec label="Referencias" />
        <DropdownSelect
          label="Sucursal"
          value={form.ID_SUCURSAL}
          onChange={v => setNum('ID_SUCURSAL', v)}
          options={sucursales}
          loading={loadingOpts}
          placeholder="Seleccionar sucursal..."
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
      <Footer onClose={onClose} onSave={handleSave} saving={saving} isEdit={!!item} label="nómina" />
    </Drawer>
  );
}

function Sec({ label }: { label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
  </View>;
}
function F({ label, val, onChange, err, ph, kb = 'default', flex }: {
  label: string; val: string; onChange: (v: string) => void; err?: string; ph?: string; kb?: any; flex?: boolean;
}) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 }}>{label}</Text>
      <TextInput
        style={{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text }}
        value={val} onChangeText={onChange} placeholder={ph} placeholderTextColor={Colors.textMuted} keyboardType={kb} />
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
