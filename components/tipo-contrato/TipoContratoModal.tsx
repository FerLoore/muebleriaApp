import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { TipoContrato, createTipoContrato, updateTipoContrato } from '../../services/tipoContratoService';
import Drawer from '../ui/Drawer';

const EMPTY: Record<string, string> = {
  CODIGO_TIPO_CONTRATO: '', NOMBRE_TIPO_CONTRATO: '', OBSERVACIONES_TIPO_CONTRATO: '',
  DURACION_TIPO_CONTRATO: '', PRESTACIONES_TIPO_CONTRATO: '', HORA_EXTRA_TIPO_CONTRATO: '',
};

type Props = { visible: boolean; onClose: () => void; item: TipoContrato | null; onSaved: () => void; };

export default function TipoContratoModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        CODIGO_TIPO_CONTRATO: item.CODIGO_TIPO_CONTRATO ?? '',
        NOMBRE_TIPO_CONTRATO: item.NOMBRE_TIPO_CONTRATO ?? '',
        OBSERVACIONES_TIPO_CONTRATO: item.OBSERVACIONES_TIPO_CONTRATO ?? '',
        DURACION_TIPO_CONTRATO: item.DURACION_TIPO_CONTRATO != null ? String(item.DURACION_TIPO_CONTRATO) : '',
        PRESTACIONES_TIPO_CONTRATO: item.PRESTACIONES_TIPO_CONTRATO ?? '',
        HORA_EXTRA_TIPO_CONTRATO: item.HORA_EXTRA_TIPO_CONTRATO ?? '',
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const num = (v: string) => v === '' ? null : Number(v);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.CODIGO_TIPO_CONTRATO.trim()) e.CODIGO_TIPO_CONTRATO = 'Requerido';
    if (!form.NOMBRE_TIPO_CONTRATO.trim()) e.NOMBRE_TIPO_CONTRATO = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<TipoContrato, 'ID_TIPO_CONTRATO'> = {
      CODIGO_TIPO_CONTRATO: form.CODIGO_TIPO_CONTRATO || null,
      NOMBRE_TIPO_CONTRATO: form.NOMBRE_TIPO_CONTRATO || null,
      OBSERVACIONES_TIPO_CONTRATO: form.OBSERVACIONES_TIPO_CONTRATO || null,
      DURACION_TIPO_CONTRATO: num(form.DURACION_TIPO_CONTRATO),
      PRESTACIONES_TIPO_CONTRATO: form.PRESTACIONES_TIPO_CONTRATO || null,
      HORA_EXTRA_TIPO_CONTRATO: form.HORA_EXTRA_TIPO_CONTRATO || null,
    };
    try {
      if (item) { await updateTipoContrato(item.ID_TIPO_CONTRATO, payload); } else { await createTipoContrato(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Tipo de contrato guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Tipo Contrato' : 'Nuevo Tipo Contrato'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Identificación" />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.medium }}>
          <F flex label="Código *" val={form.CODIGO_TIPO_CONTRATO} onChange={v => set('CODIGO_TIPO_CONTRATO', v)} err={errors.CODIGO_TIPO_CONTRATO} ph="Ej: TC-001" autoC="characters" />
          <F flex label="Duración (meses)" val={form.DURACION_TIPO_CONTRATO} onChange={v => set('DURACION_TIPO_CONTRATO', v)} kb="numeric" ph="Ej: 12" />
        </View>
        <F label="Nombre *" val={form.NOMBRE_TIPO_CONTRATO} onChange={v => set('NOMBRE_TIPO_CONTRATO', v)} err={errors.NOMBRE_TIPO_CONTRATO} ph="Nombre del tipo de contrato" />
        <F label="Observaciones" val={form.OBSERVACIONES_TIPO_CONTRATO} onChange={v => set('OBSERVACIONES_TIPO_CONTRATO', v)} ph="Observaciones generales..." ml />

        <Sec label="Condiciones" />
        <F label="Prestaciones" val={form.PRESTACIONES_TIPO_CONTRATO} onChange={v => set('PRESTACIONES_TIPO_CONTRATO', v)} ph="Prestaciones incluidas..." ml />
        <F label="Hora Extra" val={form.HORA_EXTRA_TIPO_CONTRATO} onChange={v => set('HORA_EXTRA_TIPO_CONTRATO', v)} ph="Política de horas extra" />
        <View style={{ height: 24 }} />
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btnCancel} onPress={onClose} disabled={saving}><Text style={s.btnCancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{item ? 'Guardar cambios' : 'Crear tipo contrato'}</Text></>}
        </TouchableOpacity>
      </View>
    </Drawer>
  );
}

function Sec({ label }: { label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
  </View>;
}

function F({ label, val, onChange, err, ph, kb = 'default', ml, flex, autoC }: {
  label: string; val: string; onChange: (v: string) => void; err?: string; ph?: string; kb?: any; ml?: boolean; flex?: boolean; autoC?: any;
}) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 }}>{label}</Text>
      <TextInput
        style={[{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text }, ml && { height: 80, textAlignVertical: 'top' }]}
        value={val} onChangeText={onChange} placeholder={ph} placeholderTextColor={Colors.textMuted} keyboardType={kb} multiline={ml} autoCapitalize={autoC} />
      {!!err && <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>{err}</Text>}
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
