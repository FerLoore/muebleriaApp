import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Transportista, createTransportista, updateTransportista } from '../../services/transportistaService';
import Drawer from '../ui/Drawer';

const ESTADOS = ['A', 'I'];
const TIPOS_LIC = ['A', 'B', 'M'];

const EMPTY: Record<string, string> = {
  NOMBRE_TRANSPORTISTA: '', APELLIDOS_TRANSPORTISTA: '', LICENCIA_TRANSPORTISTA: '',
  DPI_TRANSPORTISTA: '', TIPO_LIC_TRANSPORTISTA: 'B', ESTADO_TRANSPORTISTA: 'A', ID_EMPLEADO: '',
};

type Props = { visible: boolean; onClose: () => void; item: Transportista | null; onSaved: () => void; };

export default function TransportistaModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        NOMBRE_TRANSPORTISTA: item.NOMBRE_TRANSPORTISTA ?? '',
        APELLIDOS_TRANSPORTISTA: item.APELLIDOS_TRANSPORTISTA ?? '',
        LICENCIA_TRANSPORTISTA: item.LICENCIA_TRANSPORTISTA ?? '',
        DPI_TRANSPORTISTA: item.DPI_TRANSPORTISTA ?? '',
        TIPO_LIC_TRANSPORTISTA: item.TIPO_LIC_TRANSPORTISTA ?? 'B',
        ESTADO_TRANSPORTISTA: item.ESTADO_TRANSPORTISTA ?? 'A',
        ID_EMPLEADO: item.ID_EMPLEADO != null ? String(item.ID_EMPLEADO) : '',
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const num = (v: string) => v === '' ? null : Number(v);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.NOMBRE_TRANSPORTISTA.trim()) e.NOMBRE_TRANSPORTISTA = 'Requerido';
    if (!form.DPI_TRANSPORTISTA.trim()) e.DPI_TRANSPORTISTA = 'Requerido';
    if (!form.LICENCIA_TRANSPORTISTA.trim()) e.LICENCIA_TRANSPORTISTA = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<Transportista, 'ID_TRANSPORTISTA'> = {
      NOMBRE_TRANSPORTISTA: form.NOMBRE_TRANSPORTISTA || null,
      APELLIDOS_TRANSPORTISTA: form.APELLIDOS_TRANSPORTISTA || null,
      LICENCIA_TRANSPORTISTA: form.LICENCIA_TRANSPORTISTA || null,
      DPI_TRANSPORTISTA: form.DPI_TRANSPORTISTA || null,
      TIPO_LIC_TRANSPORTISTA: form.TIPO_LIC_TRANSPORTISTA || null,
      ESTADO_TRANSPORTISTA: form.ESTADO_TRANSPORTISTA || null,
      ID_EMPLEADO: num(form.ID_EMPLEADO),
    };
    try {
      if (item) { await updateTransportista(item.ID_TRANSPORTISTA, payload); } else { await createTransportista(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Transportista guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Transportista' : 'Nuevo Transportista'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Datos Personales" />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.medium }}>
          <F flex label="Nombre *" val={form.NOMBRE_TRANSPORTISTA} onChange={v => set('NOMBRE_TRANSPORTISTA', v)} err={errors.NOMBRE_TRANSPORTISTA} ph="Nombre" />
          <F flex label="Apellidos" val={form.APELLIDOS_TRANSPORTISTA} onChange={v => set('APELLIDOS_TRANSPORTISTA', v)} ph="Apellidos" />
        </View>
        <F label="DPI *" val={form.DPI_TRANSPORTISTA} onChange={v => set('DPI_TRANSPORTISTA', v)} err={errors.DPI_TRANSPORTISTA} ph="Número DPI" kb="numeric" />

        <Sec label="Licencia" />
        <F label="Número de Licencia *" val={form.LICENCIA_TRANSPORTISTA} onChange={v => set('LICENCIA_TRANSPORTISTA', v)} err={errors.LICENCIA_TRANSPORTISTA} ph="Número de licencia" />
        <View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 8 }}>Tipo de Licencia</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {TIPOS_LIC.map(t => (
              <TouchableOpacity key={t} style={[s.toggleBtn, form.TIPO_LIC_TRANSPORTISTA === t && s.toggleBtnActive]} onPress={() => set('TIPO_LIC_TRANSPORTISTA', t)}>
                <Text style={[s.toggleText, form.TIPO_LIC_TRANSPORTISTA === t && s.toggleTextActive]}>Tipo {t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Sec label="Estado" />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est} style={[s.toggleBtn, form.ESTADO_TRANSPORTISTA === est && s.toggleBtnActive]} onPress={() => set('ESTADO_TRANSPORTISTA', est)}>
              <Text style={[s.toggleText, form.ESTADO_TRANSPORTISTA === est && s.toggleTextActive]}>{est === 'A' ? 'Activo' : 'Inactivo'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Referencia" />
        <F label="ID Empleado" val={form.ID_EMPLEADO} onChange={v => set('ID_EMPLEADO', v)} kb="numeric" ph="ID del empleado" />
        <View style={{ height: 24 }} />
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btnCancel} onPress={onClose} disabled={saving}><Text style={s.btnCancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{item ? 'Guardar cambios' : 'Crear transportista'}</Text></>}
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
