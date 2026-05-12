import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Vehiculo, createVehiculo, updateVehiculo } from '../../services/vehiculoService';
import Drawer from '../ui/Drawer';

const ESTADOS = ['A', 'I', 'M'];
const ESTADO_LABEL: Record<string, string> = { A: 'Activo', I: 'Inactivo', M: 'En Mantenimiento' };
const TIPOS_VEH = ['Camión', 'Furgón', 'Pickup', 'Motocicleta', 'Van'];

const EMPTY: Record<string, string> = {
  PLACA_VEHICULO: '', MARCA_VEHICULO: '', MODELO_VEHICULO: '', TIPO_VEHICULO: 'Camión',
  CAPACIDAD_KG_VEHICULO: '', KM_ULT_SERV_VEHICULO: '', KM_SIG_SERV_VEHICULO: '',
  ESTADO_VEHICULO: 'A', ID_SUCURSAL: '',
};

type Props = { visible: boolean; onClose: () => void; item: Vehiculo | null; onSaved: () => void; };

export default function VehiculoModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        PLACA_VEHICULO: item.PLACA_VEHICULO ?? '',
        MARCA_VEHICULO: item.MARCA_VEHICULO ?? '',
        MODELO_VEHICULO: item.MODELO_VEHICULO ?? '',
        TIPO_VEHICULO: item.TIPO_VEHICULO ?? 'Camión',
        CAPACIDAD_KG_VEHICULO: item.CAPACIDAD_KG_VEHICULO != null ? String(item.CAPACIDAD_KG_VEHICULO) : '',
        KM_ULT_SERV_VEHICULO: item.KM_ULT_SERV_VEHICULO != null ? String(item.KM_ULT_SERV_VEHICULO) : '',
        KM_SIG_SERV_VEHICULO: item.KM_SIG_SERV_VEHICULO != null ? String(item.KM_SIG_SERV_VEHICULO) : '',
        ESTADO_VEHICULO: item.ESTADO_VEHICULO ?? 'A',
        ID_SUCURSAL: item.ID_SUCURSAL != null ? String(item.ID_SUCURSAL) : '',
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const num = (v: string) => v === '' ? null : Number(v);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.PLACA_VEHICULO.trim()) e.PLACA_VEHICULO = 'Requerido';
    if (!form.MARCA_VEHICULO.trim()) e.MARCA_VEHICULO = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<Vehiculo, 'ID_VEHICULO'> = {
      PLACA_VEHICULO: form.PLACA_VEHICULO || null,
      MARCA_VEHICULO: form.MARCA_VEHICULO || null,
      MODELO_VEHICULO: form.MODELO_VEHICULO || null,
      TIPO_VEHICULO: form.TIPO_VEHICULO || null,
      CAPACIDAD_KG_VEHICULO: num(form.CAPACIDAD_KG_VEHICULO),
      KM_ULT_SERV_VEHICULO: num(form.KM_ULT_SERV_VEHICULO),
      KM_SIG_SERV_VEHICULO: num(form.KM_SIG_SERV_VEHICULO),
      ESTADO_VEHICULO: form.ESTADO_VEHICULO || null,
      ID_SUCURSAL: num(form.ID_SUCURSAL),
    };
    try {
      if (item) { await updateVehiculo(item.ID_VEHICULO, payload); } else { await createVehiculo(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Vehículo guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Identificación" />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.medium }}>
          <F flex label="Placa *" val={form.PLACA_VEHICULO} onChange={v => set('PLACA_VEHICULO', v)} err={errors.PLACA_VEHICULO} ph="Ej: ABC-123" autoC="characters" />
          <F flex label="Marca *" val={form.MARCA_VEHICULO} onChange={v => set('MARCA_VEHICULO', v)} err={errors.MARCA_VEHICULO} ph="Ej: Toyota" />
        </View>
        <F label="Modelo" val={form.MODELO_VEHICULO} onChange={v => set('MODELO_VEHICULO', v)} ph="Ej: Hilux 2022" />

        <Sec label="Tipo de Vehículo" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {TIPOS_VEH.map(t => (
            <TouchableOpacity key={t} style={[s.toggleBtn, form.TIPO_VEHICULO === t && s.toggleBtnActive]} onPress={() => set('TIPO_VEHICULO', t)}>
              <Text style={[s.toggleText, form.TIPO_VEHICULO === t && s.toggleTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Capacidad y Servicio" />
        <F label="Capacidad (kg)" val={form.CAPACIDAD_KG_VEHICULO} onChange={v => set('CAPACIDAD_KG_VEHICULO', v)} kb="decimal-pad" ph="0.00" />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.medium }}>
          <F flex label="Km Último Servicio" val={form.KM_ULT_SERV_VEHICULO} onChange={v => set('KM_ULT_SERV_VEHICULO', v)} kb="decimal-pad" ph="0.00" />
          <F flex label="Km Siguiente Servicio" val={form.KM_SIG_SERV_VEHICULO} onChange={v => set('KM_SIG_SERV_VEHICULO', v)} kb="decimal-pad" ph="0.00" />
        </View>

        <Sec label="Estado" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est} style={[s.toggleBtn, form.ESTADO_VEHICULO === est && s.toggleBtnActive]} onPress={() => set('ESTADO_VEHICULO', est)}>
              <Text style={[s.toggleText, form.ESTADO_VEHICULO === est && s.toggleTextActive]}>{ESTADO_LABEL[est]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Referencia" />
        <F label="ID Sucursal" val={form.ID_SUCURSAL} onChange={v => set('ID_SUCURSAL', v)} kb="numeric" ph="ID sucursal" />
        <View style={{ height: 24 }} />
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btnCancel} onPress={onClose} disabled={saving}><Text style={s.btnCancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{item ? 'Guardar cambios' : 'Crear vehículo'}</Text></>}
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

function F({ label, val, onChange, err, ph, kb = 'default', flex, autoC }: {
  label: string; val: string; onChange: (v: string) => void; err?: string; ph?: string; kb?: any; flex?: boolean; autoC?: any;
}) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 }}>{label}</Text>
      <TextInput
        style={{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text }}
        value={val} onChangeText={onChange} placeholder={ph} placeholderTextColor={Colors.textMuted} keyboardType={kb} autoCapitalize={autoC} />
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
