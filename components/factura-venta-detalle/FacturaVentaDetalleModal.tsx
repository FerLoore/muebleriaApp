import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { FacturaVentaDetalle, createFacturaVentaDetalle, updateFacturaVentaDetalle } from '../../services/facturaVentaDetalleService';
import { getFacturasVenta } from '../../services/facturaVentaService';
import { getArticulos } from '../../services/articuloService';
import Drawer from '../ui/Drawer';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const EMPTY = {
  CANTIDAD_FACTURA_VENTA_DETALLE:    '' as string,
  PRECIO_UNITARIO_FACTURA_VENTA_DET: '' as string,
  ESTADO_FACTURA_VENTA_DETALLE:      '' as string,
  ID_FACTURA_VENTA:  null as number | null,
  ID_ARTICULO:       null as number | null,
};
type FormState = typeof EMPTY;
type Props = { visible: boolean; onClose: () => void; item: FacturaVentaDetalle | null; onSaved: () => void; };

export default function FacturaVentaDetalleModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [facturas, setFacturas]   = useState<DropdownOption[]>([]);
  const [articulos, setArticulos] = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getFacturasVenta(), getArticulos()])
      .then(([facs, arts]) => {
        setFacturas(facs.map(f => ({
          label: `${f.SERIE_FACTURA_VENTA ?? '—'}-${f.CORRELATIVO_FACTURA_VENTA ?? '—'} (ID ${f.ID_FACTURA_VENTA})`,
          value: f.ID_FACTURA_VENTA,
        })));
        setArticulos(arts.map(a => ({
          label: `${a.NOMBRE ?? '—'} [${a.CODIGO ?? '—'}]`,
          value: a.ID,
        })));
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar opciones.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  useEffect(() => {
    if (item) {
      setForm({
        CANTIDAD_FACTURA_VENTA_DETALLE:    item.CANTIDAD_FACTURA_VENTA_DETALLE != null ? String(item.CANTIDAD_FACTURA_VENTA_DETALLE) : '',
        PRECIO_UNITARIO_FACTURA_VENTA_DET: item.PRECIO_UNITARIO_FACTURA_VENTA_DET != null ? String(item.PRECIO_UNITARIO_FACTURA_VENTA_DET) : '',
        ESTADO_FACTURA_VENTA_DETALLE:      item.ESTADO_FACTURA_VENTA_DETALLE ?? '',
        ID_FACTURA_VENTA:                  item.ID_FACTURA_VENTA,
        ID_ARTICULO:                       item.ID_ARTICULO,
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const setTxt = (k: keyof FormState, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const setNum = (k: keyof FormState, v: number | null) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.ESTADO_FACTURA_VENTA_DETALLE.trim()) e.ESTADO_FACTURA_VENTA_DETALLE = 'Requerido';
    if (form.ID_FACTURA_VENTA == null)             e.ID_FACTURA_VENTA = 'Requerido';
    if (form.ID_ARTICULO == null)                  e.ID_ARTICULO = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<FacturaVentaDetalle, 'ID_FACTURA_VENTA_DETALLE'> = {
      CANTIDAD_FACTURA_VENTA_DETALLE:    form.CANTIDAD_FACTURA_VENTA_DETALLE !== '' ? Number(form.CANTIDAD_FACTURA_VENTA_DETALLE) : null,
      PRECIO_UNITARIO_FACTURA_VENTA_DET: form.PRECIO_UNITARIO_FACTURA_VENTA_DET !== '' ? Number(form.PRECIO_UNITARIO_FACTURA_VENTA_DET) : null,
      ESTADO_FACTURA_VENTA_DETALLE:      form.ESTADO_FACTURA_VENTA_DETALLE || null,
      ID_FACTURA_VENTA:                  form.ID_FACTURA_VENTA,
      ID_ARTICULO:                       form.ID_ARTICULO,
    };
    try {
      if (item) { await updateFacturaVentaDetalle(item.ID_FACTURA_VENTA_DETALLE, payload); }
      else       { await createFacturaVentaDetalle(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Detalle de factura guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Detalle Factura' : 'Nuevo Detalle Factura'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Factura y Artículo" />
        <DropdownSelect
          label="Factura de Venta *"
          value={form.ID_FACTURA_VENTA}
          onChange={v => setNum('ID_FACTURA_VENTA', v)}
          options={facturas}
          loading={loadingOpts}
          placeholder="Seleccionar factura..."
          error={errors.ID_FACTURA_VENTA}
        />
        <DropdownSelect
          label="Artículo *"
          value={form.ID_ARTICULO}
          onChange={v => setNum('ID_ARTICULO', v)}
          options={articulos}
          loading={loadingOpts}
          placeholder="Seleccionar artículo..."
          error={errors.ID_ARTICULO}
        />
        <Sec label="Cantidad, Precio y Estado" />
        <View style={{ flexDirection: 'row', gap: Layout.spacing.medium }}>
          <F flex label="Cantidad" val={form.CANTIDAD_FACTURA_VENTA_DETALLE} onChange={v => setTxt('CANTIDAD_FACTURA_VENTA_DETALLE', v)} kb="numeric" ph="0" />
          <F flex label="Precio Unitario" val={form.PRECIO_UNITARIO_FACTURA_VENTA_DET} onChange={v => setTxt('PRECIO_UNITARIO_FACTURA_VENTA_DET', v)} kb="numeric" ph="0.00" />
        </View>
        <F label="Estado *" val={form.ESTADO_FACTURA_VENTA_DETALLE} onChange={v => setTxt('ESTADO_FACTURA_VENTA_DETALLE', v)} err={errors.ESTADO_FACTURA_VENTA_DETALLE} ph="Ej. ACTIVO" />
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
