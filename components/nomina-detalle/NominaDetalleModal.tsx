import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { NominaDetalle, createNominaDetalle, updateNominaDetalle } from '../../services/nominaDetalleService';
import { getNominas } from '../../services/nominaService';
import { getEmpleados } from '../../services/empleadosService';
import Drawer from '../ui/Drawer';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const EMPTY = {
  SALARIO_BASICO_NOMINA_DETALLE:     '' as string,
  HORAS_EXTR_NOMINA_DETALLE:         '' as string,
  BONIFICACION_NOMINA_DETALLE:       '' as string,
  DESCUENTO_SEGURO_NOMINA_DETALLE:   '' as string,
  DESCUENTO_IMPUESTO_NOMINA_DETALLE: '' as string,
  NETO_PAGAR_NOMINA_DETALLE:         '' as string,
  ID_NOMINA:   null as number | null,
  ID_EMPLEADO: null as number | null,
};
type FormState = typeof EMPTY;
type Props = { visible: boolean; onClose: () => void; item: NominaDetalle | null; onSaved: () => void; };

export default function NominaDetalleModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [nominas, setNominas]     = useState<DropdownOption[]>([]);
  const [empleados, setEmpleados] = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getNominas(), getEmpleados()])
      .then(([noms, emps]) => {
        setNominas(noms.map(n => ({
          label: `${n.PERIODO_NOMINA ?? '—'} – ${n.ESTADO_NOMINA ?? '—'} (ID ${n.ID_NOMINA})`,
          value: n.ID_NOMINA,
        })));
        setEmpleados(emps.map(e => ({
          label: `${e.NombresEmpleado ?? ''} ${e.ApellidosEmpleado ?? ''} [${e.NumeroEmpleado ?? e.IdEmpleado}]`.trim(),
          value: e.IdEmpleado,
        })));
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar opciones.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  useEffect(() => {
    if (item) {
      setForm({
        SALARIO_BASICO_NOMINA_DETALLE:     item.SALARIO_BASICO_NOMINA_DETALLE != null ? String(item.SALARIO_BASICO_NOMINA_DETALLE) : '',
        HORAS_EXTR_NOMINA_DETALLE:         item.HORAS_EXTR_NOMINA_DETALLE != null ? String(item.HORAS_EXTR_NOMINA_DETALLE) : '',
        BONIFICACION_NOMINA_DETALLE:       item.BONIFICACION_NOMINA_DETALLE != null ? String(item.BONIFICACION_NOMINA_DETALLE) : '',
        DESCUENTO_SEGURO_NOMINA_DETALLE:   item.DESCUENTO_SEGURO_NOMINA_DETALLE != null ? String(item.DESCUENTO_SEGURO_NOMINA_DETALLE) : '',
        DESCUENTO_IMPUESTO_NOMINA_DETALLE: item.DESCUENTO_IMPUESTO_NOMINA_DETALLE != null ? String(item.DESCUENTO_IMPUESTO_NOMINA_DETALLE) : '',
        NETO_PAGAR_NOMINA_DETALLE:         item.NETO_PAGAR_NOMINA_DETALLE != null ? String(item.NETO_PAGAR_NOMINA_DETALLE) : '',
        ID_NOMINA:   item.ID_NOMINA,
        ID_EMPLEADO: item.ID_EMPLEADO,
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const setTxt = (k: keyof FormState, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const setNum = (k: keyof FormState, v: number | null) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (form.ID_NOMINA == null)   e.ID_NOMINA   = 'Requerido';
    if (form.ID_EMPLEADO == null) e.ID_EMPLEADO = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<NominaDetalle, 'ID_NOMINA_DETALLE'> = {
      SALARIO_BASICO_NOMINA_DETALLE:     form.SALARIO_BASICO_NOMINA_DETALLE !== '' ? Number(form.SALARIO_BASICO_NOMINA_DETALLE) : null,
      HORAS_EXTR_NOMINA_DETALLE:         form.HORAS_EXTR_NOMINA_DETALLE !== '' ? Number(form.HORAS_EXTR_NOMINA_DETALLE) : null,
      BONIFICACION_NOMINA_DETALLE:       form.BONIFICACION_NOMINA_DETALLE !== '' ? Number(form.BONIFICACION_NOMINA_DETALLE) : null,
      DESCUENTO_SEGURO_NOMINA_DETALLE:   form.DESCUENTO_SEGURO_NOMINA_DETALLE !== '' ? Number(form.DESCUENTO_SEGURO_NOMINA_DETALLE) : null,
      DESCUENTO_IMPUESTO_NOMINA_DETALLE: form.DESCUENTO_IMPUESTO_NOMINA_DETALLE !== '' ? Number(form.DESCUENTO_IMPUESTO_NOMINA_DETALLE) : null,
      NETO_PAGAR_NOMINA_DETALLE:         form.NETO_PAGAR_NOMINA_DETALLE !== '' ? Number(form.NETO_PAGAR_NOMINA_DETALLE) : null,
      ID_NOMINA:   form.ID_NOMINA,
      ID_EMPLEADO: form.ID_EMPLEADO,
    };
    try {
      if (item) { await updateNominaDetalle(item.ID_NOMINA_DETALLE, payload); }
      else       { await createNominaDetalle(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Detalle de nómina guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Detalle Nómina' : 'Nuevo Detalle Nómina'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Nómina y Empleado" />
        <DropdownSelect
          label="Nómina *"
          value={form.ID_NOMINA}
          onChange={v => setNum('ID_NOMINA', v)}
          options={nominas}
          loading={loadingOpts}
          placeholder="Seleccionar nómina..."
          error={errors.ID_NOMINA}
        />
        <DropdownSelect
          label="Empleado *"
          value={form.ID_EMPLEADO}
          onChange={v => setNum('ID_EMPLEADO', v)}
          options={empleados}
          loading={loadingOpts}
          placeholder="Seleccionar empleado..."
          error={errors.ID_EMPLEADO}
        />
        <Sec label="Salario y Extras" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Salario Básico" val={form.SALARIO_BASICO_NOMINA_DETALLE} onChange={v => setTxt('SALARIO_BASICO_NOMINA_DETALLE', v)} kb="numeric" ph="0.00" />
          <F flex label="Horas Extra" val={form.HORAS_EXTR_NOMINA_DETALLE} onChange={v => setTxt('HORAS_EXTR_NOMINA_DETALLE', v)} kb="numeric" ph="0.00" />
        </View>
        <F label="Bonificación" val={form.BONIFICACION_NOMINA_DETALLE} onChange={v => setTxt('BONIFICACION_NOMINA_DETALLE', v)} kb="numeric" ph="0.00" />
        <Sec label="Descuentos" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Desc. Seguro" val={form.DESCUENTO_SEGURO_NOMINA_DETALLE} onChange={v => setTxt('DESCUENTO_SEGURO_NOMINA_DETALLE', v)} kb="numeric" ph="0.00" />
          <F flex label="Desc. Impuesto" val={form.DESCUENTO_IMPUESTO_NOMINA_DETALLE} onChange={v => setTxt('DESCUENTO_IMPUESTO_NOMINA_DETALLE', v)} kb="numeric" ph="0.00" />
        </View>
        <Sec label="Neto a Pagar" />
        <F label="Neto a Pagar" val={form.NETO_PAGAR_NOMINA_DETALLE} onChange={v => setTxt('NETO_PAGAR_NOMINA_DETALLE', v)} kb="numeric" ph="0.00" />
        <View style={{ height: 24 }} />
      </ScrollView>
      <Footer onClose={onClose} onSave={handleSave} saving={saving} isEdit={!!item} label="detalle" />
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
