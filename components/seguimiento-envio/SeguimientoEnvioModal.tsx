import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { SeguimientoEnvio, createSeguimientoEnvio, updateSeguimientoEnvio } from '../../services/seguimientoEnvioService';
import Drawer from '../ui/Drawer';

const ESTADOS = ['P', 'T', 'E', 'D'];
const ESTADO_LABEL: Record<string, string> = { P: 'Pendiente', T: 'En Tránsito', E: 'En Entrega', D: 'Entregado' };

const EMPTY: Record<string, string> = {
  FECHA_HORA_SEGUIMIENTO_ENVIO: '', DESCRIPCION_SEGUIMIENTO_ENVIO: '',
  UBICACION_SEGUIMIENTO_ENVIO: '', ESTADO_SEGUIMIENTO_ENVIO: 'P',
  ID_ENTREGA: '', ID_USUARIO_CREA: '', ID_USUARIO_MODIFICA: '',
};

type Props = { visible: boolean; onClose: () => void; item: SeguimientoEnvio | null; onSaved: () => void; };

export default function SeguimientoEnvioModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        FECHA_HORA_SEGUIMIENTO_ENVIO: item.FECHA_HORA_SEGUIMIENTO_ENVIO ?? '',
        DESCRIPCION_SEGUIMIENTO_ENVIO: item.DESCRIPCION_SEGUIMIENTO_ENVIO ?? '',
        UBICACION_SEGUIMIENTO_ENVIO: item.UBICACION_SEGUIMIENTO_ENVIO ?? '',
        ESTADO_SEGUIMIENTO_ENVIO: item.ESTADO_SEGUIMIENTO_ENVIO ?? 'P',
        ID_ENTREGA: item.ID_ENTREGA != null ? String(item.ID_ENTREGA) : '',
        ID_USUARIO_CREA: item.ID_USUARIO_CREA != null ? String(item.ID_USUARIO_CREA) : '',
        ID_USUARIO_MODIFICA: item.ID_USUARIO_MODIFICA != null ? String(item.ID_USUARIO_MODIFICA) : '',
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const num = (v: string) => v === '' ? null : Number(v);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.DESCRIPCION_SEGUIMIENTO_ENVIO.trim()) e.DESCRIPCION_SEGUIMIENTO_ENVIO = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'> = {
      FECHA_HORA_SEGUIMIENTO_ENVIO: form.FECHA_HORA_SEGUIMIENTO_ENVIO || null,
      DESCRIPCION_SEGUIMIENTO_ENVIO: form.DESCRIPCION_SEGUIMIENTO_ENVIO || null,
      UBICACION_SEGUIMIENTO_ENVIO: form.UBICACION_SEGUIMIENTO_ENVIO || null,
      ESTADO_SEGUIMIENTO_ENVIO: form.ESTADO_SEGUIMIENTO_ENVIO || null,
      ID_ENTREGA: num(form.ID_ENTREGA),
      ID_USUARIO_CREA: num(form.ID_USUARIO_CREA),
      ID_USUARIO_MODIFICA: num(form.ID_USUARIO_MODIFICA),
    };
    try {
      if (item) { await updateSeguimientoEnvio(item.ID_SEGUIMIENTO_ENVIO, payload); } else { await createSeguimientoEnvio(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Seguimiento guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Seguimiento" />
        <F label="Fecha y Hora" val={form.FECHA_HORA_SEGUIMIENTO_ENVIO} onChange={v => set('FECHA_HORA_SEGUIMIENTO_ENVIO', v)} ph="YYYY-MM-DD HH:MM" />
        <F label="Descripción *" val={form.DESCRIPCION_SEGUIMIENTO_ENVIO} onChange={v => set('DESCRIPCION_SEGUIMIENTO_ENVIO', v)} err={errors.DESCRIPCION_SEGUIMIENTO_ENVIO} ph="Descripción del evento..." ml />
        <F label="Ubicación" val={form.UBICACION_SEGUIMIENTO_ENVIO} onChange={v => set('UBICACION_SEGUIMIENTO_ENVIO', v)} ph="Coordenadas o dirección" />

        <Sec label="Estado" />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est}
              style={[s.toggleBtn, form.ESTADO_SEGUIMIENTO_ENVIO === est && s.toggleBtnActive]}
              onPress={() => set('ESTADO_SEGUIMIENTO_ENVIO', est)}>
              <Text style={[s.toggleText, form.ESTADO_SEGUIMIENTO_ENVIO === est && s.toggleTextActive]}>{ESTADO_LABEL[est]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Referencias" />
        <F label="ID Entrega" val={form.ID_ENTREGA} onChange={v => set('ID_ENTREGA', v)} kb="numeric" ph="ID" />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.medium }}>
          <F flex label="ID Usuario Crea" val={form.ID_USUARIO_CREA} onChange={v => set('ID_USUARIO_CREA', v)} kb="numeric" ph="ID" />
          <F flex label="ID Usuario Modifica" val={form.ID_USUARIO_MODIFICA} onChange={v => set('ID_USUARIO_MODIFICA', v)} kb="numeric" ph="ID" />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btnCancel} onPress={onClose} disabled={saving}><Text style={s.btnCancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{item ? 'Guardar cambios' : 'Crear seguimiento'}</Text></>}
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

const s = StyleSheet.create({
  scroll: { flex: 1 }, content: { paddingHorizontal: Layout.spacing.large, paddingTop: Layout.spacing.medium },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: Layout.spacing.large, paddingVertical: Layout.spacing.medium, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#fff' },
  btnCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  btnSave: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
