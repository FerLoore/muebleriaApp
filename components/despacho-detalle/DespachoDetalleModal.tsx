import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { DespachoDetalle, createDespachoDetalle, updateDespachoDetalle } from '../../services/despachoDetalleService';
import { getOrdenesDespacho } from '../../services/ordenDespachadoService';
import { getFacturasVenta } from '../../services/facturaVentaService';
import { getSucursales } from '../../services/sucursalesService';
import Drawer from '../ui/Drawer';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const ESTADOS = ['P', 'E', 'C'];
const ESTADO_LABEL: Record<string, string> = { P: 'Pendiente', E: 'En Ruta', C: 'Completado' };

type Props = { visible: boolean; onClose: () => void; item: DespachoDetalle | null; onSaved: () => void; };

export default function DespachoDetalleModal({ visible, onClose, item, onSaved }: Props) {
  const [secuencia, setSecuencia] = useState('');
  const [estado, setEstado]       = useState('P');

  const [idOrden,    setIdOrden]    = useState<number | null>(null);
  const [idFactura,  setIdFactura]  = useState<number | null>(null);
  const [idSucursal, setIdSucursal] = useState<number | null>(null);

  const [ordenes,    setOrdenes]    = useState<DropdownOption[]>([]);
  const [facturas,   setFacturas]   = useState<DropdownOption[]>([]);
  const [sucursales, setSucursales] = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  const [saving, setSaving]  = useState(false);
  const [errors, setErrors]  = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getOrdenesDespacho(), getFacturasVenta(), getSucursales()])
      .then(([ords, facs, sucs]) => {
        setOrdenes(ords.map(o => ({
          value: o.ID_ORDEN_DESPACHO,
          label: `${o.NOMBRE_ORDEN_DESPACHO ?? 'Sin nombre'} (ID ${o.ID_ORDEN_DESPACHO})`,
        })));
        setFacturas(facs.map(f => ({
          value: f.ID_FACTURA_VENTA,
          label: `${f.SERIE_FACTURA_VENTA ?? '—'}-${f.CORRELATIVO_FACTURA_VENTA ?? '—'} (ID ${f.ID_FACTURA_VENTA})`,
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
      setIdOrden(item.ID_ORDEN_DESPACHO);
      setSecuencia(String(item.SECUENCIA_ENTREGA_DESPACHO_DETALLE));
      setEstado(item.ESTADO_DESPACHO_DETALLE ?? 'P');
      setIdFactura(item.ID_FACTURA_VENTA);
      setIdSucursal(item.ID_SUCURSAL_ENTR);
    } else {
      setIdOrden(null); setSecuencia(''); setEstado('P');
      setIdFactura(null); setIdSucursal(null);
    }
    setErrors({});
  }, [item, visible]);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!idOrden)   e.idOrden   = 'Requerido';
    if (!secuencia) e.secuencia = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: DespachoDetalle = {
      ID_ORDEN_DESPACHO:                 idOrden!,
      SECUENCIA_ENTREGA_DESPACHO_DETALLE: Number(secuencia),
      ESTADO_DESPACHO_DETALLE:           estado || null,
      ID_TRASLADO:                       null,   // no hay tabla Traslado en el backend aún
      ID_FACTURA_VENTA:                  idFactura,
      ID_SUCURSAL_ENTR:                  idSucursal,
    };
    try {
      if (item) { await updateDespachoDetalle(payload); } else { await createDespachoDetalle(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Despacho detalle guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally   { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Despacho Detalle' : 'Nuevo Despacho Detalle'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Sec label="Orden y Secuencia" />
        <DropdownSelect
          label="Orden de Despacho *"
          value={idOrden}
          onChange={setIdOrden}
          options={ordenes}
          loading={loadingOpts}
          placeholder="Seleccionar orden..."
          error={errors.idOrden}
        />
        <F label="Secuencia *" val={secuencia} onChange={setSecuencia} kb="numeric" ph="Ej: 1" err={errors.secuencia} />

        <Sec label="Estado" />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est} style={[s.toggleBtn, estado === est && s.toggleBtnActive]} onPress={() => setEstado(est)}>
              <Text style={[s.toggleText, estado === est && s.toggleTextActive]}>{ESTADO_LABEL[est]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Referencias" />
        <DropdownSelect
          label="Factura de Venta"
          value={idFactura}
          onChange={setIdFactura}
          options={facturas}
          loading={loadingOpts}
          placeholder="Seleccionar factura..."
        />
        <DropdownSelect
          label="Sucursal de Entrega"
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
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><FontAwesome5 name="save" size={13} color="#fff" /><Text style={s.btnSaveText}>{item ? 'Guardar cambios' : 'Crear detalle'}</Text></>}
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
