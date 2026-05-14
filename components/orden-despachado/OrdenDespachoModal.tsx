import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { OrdenDespacho, createOrdenDespacho, updateOrdenDespacho } from '../../services/ordenDespachadoService';
import { getTransportistas } from '../../services/transportistaService';
import { getVehiculos } from '../../services/vehiculoService';
import { getSucursales } from '../../services/sucursalesService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const ESTADOS = ['P', 'D', 'C'];
const ESTADO_LABEL: Record<string, string> = { P: 'Pendiente', D: 'Despachado', C: 'Completado' };

const EMPTY_FORM = {
  NOMBRE_ORDEN_DESPACHO: '',
  FECHA_CREA_ORDEN_DESPACHO: '',
  FECHA_ENTREGA_ORDEN_DESPACHO: '',
  PESO_KG_TOTAL_ORDEN_DESPACHO: '',
  ESTADO_ORDEN_DESPACHADO: 'P',
};

type Props = { visible: boolean; onClose: () => void; item: OrdenDespacho | null; onSaved: () => void; };

export default function OrdenDespachoModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]                 = useState<Record<string, string>>(EMPTY_FORM);
  const [idVehiculo, setIdVehiculo]     = useState<number | null>(null);
  const [idTransportista, setIdTransportista] = useState<number | null>(null);
  const [idSucursal, setIdSucursal]     = useState<number | null>(null);
  const [saving, setSaving]             = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const [vehiculos, setVehiculos]           = useState<DropdownOption[]>([]);
  const [transportistas, setTransportistas] = useState<DropdownOption[]>([]);
  const [sucursales, setSucursales]         = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts]       = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getVehiculos(), getTransportistas(), getSucursales()])
      .then(([vs, ts, sucs]) => {
        setVehiculos(vs.map(v => ({
          value: v.ID_VEHICULO,
          label: `${v.PLACA_VEHICULO ?? ''} — ${v.MARCA_VEHICULO ?? ''} ${v.MODELO_VEHICULO ?? ''}`.trim(),
        })));
        setTransportistas(ts.map(t => ({
          value: t.ID_TRANSPORTISTA,
          label: `${t.NOMBRE_TRANSPORTISTA ?? ''} ${t.APELLIDOS_TRANSPORTISTA ?? ''}`.trim(),
        })));
        setSucursales(sucs.map(s => ({
          value: s.IdSucursal,
          label: s.NombreSucursal ?? `Sucursal ${s.IdSucursal}`,
        })));
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar opciones.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  useEffect(() => {
    if (item) {
      setForm({
        NOMBRE_ORDEN_DESPACHO:        item.NOMBRE_ORDEN_DESPACHO ?? '',
        FECHA_CREA_ORDEN_DESPACHO:    item.FECHA_CREA_ORDEN_DESPACHO ?? '',
        FECHA_ENTREGA_ORDEN_DESPACHO: item.FECHA_ENTREGA_ORDEN_DESPACHO ?? '',
        PESO_KG_TOTAL_ORDEN_DESPACHO: item.PESO_KG_TOTAL_ORDEN_DESPACHO != null ? String(item.PESO_KG_TOTAL_ORDEN_DESPACHO) : '',
        ESTADO_ORDEN_DESPACHADO:      item.ESTADO_ORDEN_DESPACHADO ?? 'P',
      });
      setIdVehiculo(item.ID_VEHICULO);
      setIdTransportista(item.ID_TRANSPORTISTA);
      setIdSucursal(item.ID_SUCURSAL);
    } else {
      setForm(EMPTY_FORM);
      setIdVehiculo(null);
      setIdTransportista(null);
      setIdSucursal(null);
    }
    setErrors({});
  }, [item, visible]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.NOMBRE_ORDEN_DESPACHO.trim()) e.NOMBRE_ORDEN_DESPACHO = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<OrdenDespacho, 'ID_ORDEN_DESPACHO'> = {
      NOMBRE_ORDEN_DESPACHO:        form.NOMBRE_ORDEN_DESPACHO || null,
      FECHA_CREA_ORDEN_DESPACHO:    form.FECHA_CREA_ORDEN_DESPACHO || null,
      FECHA_ENTREGA_ORDEN_DESPACHO: form.FECHA_ENTREGA_ORDEN_DESPACHO || null,
      PESO_KG_TOTAL_ORDEN_DESPACHO: form.PESO_KG_TOTAL_ORDEN_DESPACHO ? Number(form.PESO_KG_TOTAL_ORDEN_DESPACHO) : null,
      ESTADO_ORDEN_DESPACHADO:      form.ESTADO_ORDEN_DESPACHADO || null,
      ID_VEHICULO:                  idVehiculo,
      ID_TRANSPORTISTA:             idTransportista,
      ID_SUCURSAL:                  idSucursal,
    };
    try {
      if (item) { await updateOrdenDespacho(item.ID_ORDEN_DESPACHO, payload); }
      else       { await createOrdenDespacho(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Orden guardada.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally   { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Orden Despacho' : 'Nueva Orden Despacho'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Sec label="Información General" />
        <F label="Nombre *" val={form.NOMBRE_ORDEN_DESPACHO} onChange={v => set('NOMBRE_ORDEN_DESPACHO', v)} err={errors.NOMBRE_ORDEN_DESPACHO} ph="Nombre de la orden" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <DatePickerField
            label="Fecha Creación"
            value={form.FECHA_CREA_ORDEN_DESPACHO}
            onChange={v => set('FECHA_CREA_ORDEN_DESPACHO', v)}
            flex
          />
          <DatePickerField
            label="Fecha Entrega"
            value={form.FECHA_ENTREGA_ORDEN_DESPACHO}
            onChange={v => set('FECHA_ENTREGA_ORDEN_DESPACHO', v)}
            flex
          />
        </View>
        <F label="Peso Total (kg)" val={form.PESO_KG_TOTAL_ORDEN_DESPACHO} onChange={v => set('PESO_KG_TOTAL_ORDEN_DESPACHO', v)} kb="decimal-pad" ph="0.00" />

        <Sec label="Estado" />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est} style={[s.toggleBtn, form.ESTADO_ORDEN_DESPACHADO === est && s.toggleBtnActive]} onPress={() => set('ESTADO_ORDEN_DESPACHADO', est)}>
              <Text style={[s.toggleText, form.ESTADO_ORDEN_DESPACHADO === est && s.toggleTextActive]}>{ESTADO_LABEL[est]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Asignación" />
        <DropdownSelect
          label="Vehículo"
          value={idVehiculo}
          onChange={setIdVehiculo}
          options={vehiculos}
          loading={loadingOpts}
          placeholder="Seleccionar vehículo..."
        />
        <DropdownSelect
          label="Transportista"
          value={idTransportista}
          onChange={setIdTransportista}
          options={transportistas}
          loading={loadingOpts}
          placeholder="Seleccionar transportista..."
        />
        <DropdownSelect
          label="Sucursal"
          value={idSucursal}
          onChange={setIdSucursal}
          options={sucursales}
          loading={loadingOpts}
          placeholder="Seleccionar sucursal..."
        />

        <View style={{ height: 24 }} />
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btnCancel} onPress={onClose} disabled={saving}><Text style={s.btnCancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{item ? 'Guardar cambios' : 'Crear orden'}</Text></>}
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
      <TextInput style={{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text }}
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
