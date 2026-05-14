import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Asistencia, createAsistencia, updateAsistencia } from '../../services/asistenciaService';
import { getEmpleados } from '../../services/empleadosService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const EMPTY = {
  FECHA_ASISTENCIA:         '' as string,
  HORA_IN_ASISTENCIA:       '' as string,
  HORA_SAL_ASISTENCIA:      '' as string,
  HORA_IN_DES_ASISTENCIA:   '' as string,
  HORA_SAL_DES_ASISTENCIA:  '' as string,
  HORAS_TRABAJO_ASISTENCIA: '' as string,
  HORAS_DES_ASISTENCIA:     '' as string,
  HORAS_EXTR_ASISTENCIA:    '' as string,
  ESTADO_ASISTENCIA:        '' as string,
  ID_EMPLEADO: null as number | null,
};
type FormState = typeof EMPTY;
type Props = { visible: boolean; onClose: () => void; item: Asistencia | null; onSaved: () => void; };

export default function AsistenciaModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [empleados, setEmpleados]     = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    getEmpleados()
      .then(emps => setEmpleados(emps.map(e => ({
        label: `${e.NombresEmpleado ?? ''} ${e.ApellidosEmpleado ?? ''} [${e.NumeroEmpleado ?? e.IdEmpleado}]`.trim(),
        value: e.IdEmpleado,
      }))))
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar empleados.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  useEffect(() => {
    if (item) {
      setForm({
        FECHA_ASISTENCIA:         item.FECHA_ASISTENCIA ?? '',
        HORA_IN_ASISTENCIA:       item.HORA_IN_ASISTENCIA ?? '',
        HORA_SAL_ASISTENCIA:      item.HORA_SAL_ASISTENCIA ?? '',
        HORA_IN_DES_ASISTENCIA:   item.HORA_IN_DES_ASISTENCIA ?? '',
        HORA_SAL_DES_ASISTENCIA:  item.HORA_SAL_DES_ASISTENCIA ?? '',
        HORAS_TRABAJO_ASISTENCIA: item.HORAS_TRABAJO_ASISTENCIA != null ? String(item.HORAS_TRABAJO_ASISTENCIA) : '',
        HORAS_DES_ASISTENCIA:     item.HORAS_DES_ASISTENCIA != null ? String(item.HORAS_DES_ASISTENCIA) : '',
        HORAS_EXTR_ASISTENCIA:    item.HORAS_EXTR_ASISTENCIA != null ? String(item.HORAS_EXTR_ASISTENCIA) : '',
        ESTADO_ASISTENCIA:        item.ESTADO_ASISTENCIA ?? '',
        ID_EMPLEADO:              item.ID_EMPLEADO,
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const setTxt = (k: keyof FormState, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const setNum = (k: keyof FormState, v: number | null) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (form.ID_EMPLEADO == null)       e.ID_EMPLEADO      = 'Requerido';
    if (!form.FECHA_ASISTENCIA.trim())  e.FECHA_ASISTENCIA = 'Requerido';
    if (!form.ESTADO_ASISTENCIA.trim()) e.ESTADO_ASISTENCIA = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<Asistencia, 'ID_ASISTENCIA'> = {
      FECHA_ASISTENCIA:         form.FECHA_ASISTENCIA || null,
      HORA_IN_ASISTENCIA:       form.HORA_IN_ASISTENCIA || null,
      HORA_SAL_ASISTENCIA:      form.HORA_SAL_ASISTENCIA || null,
      HORA_IN_DES_ASISTENCIA:   form.HORA_IN_DES_ASISTENCIA || null,
      HORA_SAL_DES_ASISTENCIA:  form.HORA_SAL_DES_ASISTENCIA || null,
      HORAS_TRABAJO_ASISTENCIA: form.HORAS_TRABAJO_ASISTENCIA !== '' ? Number(form.HORAS_TRABAJO_ASISTENCIA) : null,
      HORAS_DES_ASISTENCIA:     form.HORAS_DES_ASISTENCIA !== '' ? Number(form.HORAS_DES_ASISTENCIA) : null,
      HORAS_EXTR_ASISTENCIA:    form.HORAS_EXTR_ASISTENCIA !== '' ? Number(form.HORAS_EXTR_ASISTENCIA) : null,
      ESTADO_ASISTENCIA:        form.ESTADO_ASISTENCIA || null,
      ID_EMPLEADO:              form.ID_EMPLEADO,
    };
    try {
      if (item) { await updateAsistencia(item.ID_ASISTENCIA, payload); }
      else       { await createAsistencia(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Asistencia guardada.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Asistencia' : 'Nueva Asistencia'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Empleado" />
        <DropdownSelect
          label="Empleado *"
          value={form.ID_EMPLEADO}
          onChange={v => setNum('ID_EMPLEADO', v)}
          options={empleados}
          loading={loadingOpts}
          placeholder="Seleccionar empleado..."
          error={errors.ID_EMPLEADO}
        />
        <Sec label="Fecha y Estado" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <DatePickerField
            label="Fecha *"
            value={form.FECHA_ASISTENCIA}
            onChange={v => setTxt('FECHA_ASISTENCIA', v)}
            error={errors.FECHA_ASISTENCIA}
            required
            flex
          />
          <F flex label="Estado *" val={form.ESTADO_ASISTENCIA} onChange={v => setTxt('ESTADO_ASISTENCIA', v)} err={errors.ESTADO_ASISTENCIA} ph="PRESENTE / AUSENTE" />
        </View>
        <Sec label="Horario" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Hora Entrada" val={form.HORA_IN_ASISTENCIA} onChange={v => setTxt('HORA_IN_ASISTENCIA', v)} ph="HH:MM" />
          <F flex label="Hora Salida" val={form.HORA_SAL_ASISTENCIA} onChange={v => setTxt('HORA_SAL_ASISTENCIA', v)} ph="HH:MM" />
        </View>
        <Sec label="Descanso" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Inicio Descanso" val={form.HORA_IN_DES_ASISTENCIA} onChange={v => setTxt('HORA_IN_DES_ASISTENCIA', v)} ph="HH:MM" />
          <F flex label="Fin Descanso" val={form.HORA_SAL_DES_ASISTENCIA} onChange={v => setTxt('HORA_SAL_DES_ASISTENCIA', v)} ph="HH:MM" />
        </View>
        <Sec label="Horas Trabajadas" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Horas Trabajo" val={form.HORAS_TRABAJO_ASISTENCIA} onChange={v => setTxt('HORAS_TRABAJO_ASISTENCIA', v)} kb="numeric" ph="0.00" />
          <F flex label="Horas Descanso" val={form.HORAS_DES_ASISTENCIA} onChange={v => setTxt('HORAS_DES_ASISTENCIA', v)} kb="numeric" ph="0.00" />
        </View>
        <F label="Horas Extra" val={form.HORAS_EXTR_ASISTENCIA} onChange={v => setTxt('HORAS_EXTR_ASISTENCIA', v)} kb="numeric" ph="0.00" />
        <View style={{ height: 24 }} />
      </ScrollView>
      <Footer onClose={onClose} onSave={handleSave} saving={saving} isEdit={!!item} label="asistencia" />
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
