import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Entrega, createEntrega, updateEntrega } from '../../services/entregaService';
import Drawer from '../ui/Drawer';

const EMPTY: Record<string, string> = {
  FECHA_ENTREGA: '', NOMBRE_RECIBE_ENTREGA: '', APELLIDOS_RECIBE_ENTREGA: '',
  DPI_RECIBE_ENTREGA: '', FIRMA_RECIBE_ENTREGA: '', FOTO_ENTREGA: '',
  OBSERVACION_ENTREGA: '', UBICACION_ENTREGA: '', ID_DESPACHO_DETALLE: '',
};

type Props = { visible: boolean; onClose: () => void; item: Entrega | null; onSaved: () => void; };

export default function EntregaModal({ visible, onClose, item, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        FECHA_ENTREGA: item.FECHA_ENTREGA ?? '',
        NOMBRE_RECIBE_ENTREGA: item.NOMBRE_RECIBE_ENTREGA ?? '',
        APELLIDOS_RECIBE_ENTREGA: item.APELLIDOS_RECIBE_ENTREGA ?? '',
        DPI_RECIBE_ENTREGA: item.DPI_RECIBE_ENTREGA ?? '',
        FIRMA_RECIBE_ENTREGA: item.FIRMA_RECIBE_ENTREGA ?? '',
        FOTO_ENTREGA: item.FOTO_ENTREGA ?? '',
        OBSERVACION_ENTREGA: item.OBSERVACION_ENTREGA ?? '',
        UBICACION_ENTREGA: item.UBICACION_ENTREGA ?? '',
        ID_DESPACHO_DETALLE: item.ID_DESPACHO_DETALLE != null ? String(item.ID_DESPACHO_DETALLE) : '',
      });
    } else { setForm(EMPTY); }
    setErrors({});
  }, [item, visible]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const num = (v: string) => v === '' ? null : Number(v);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.NOMBRE_RECIBE_ENTREGA.trim()) e.NOMBRE_RECIBE_ENTREGA = 'Requerido';
    if (!form.DPI_RECIBE_ENTREGA.trim()) e.DPI_RECIBE_ENTREGA = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<Entrega, 'ID_ENTREGA'> = {
      FECHA_ENTREGA: form.FECHA_ENTREGA || null, NOMBRE_RECIBE_ENTREGA: form.NOMBRE_RECIBE_ENTREGA || null,
      APELLIDOS_RECIBE_ENTREGA: form.APELLIDOS_RECIBE_ENTREGA || null, DPI_RECIBE_ENTREGA: form.DPI_RECIBE_ENTREGA || null,
      FIRMA_RECIBE_ENTREGA: form.FIRMA_RECIBE_ENTREGA || null, FOTO_ENTREGA: form.FOTO_ENTREGA || null,
      OBSERVACION_ENTREGA: form.OBSERVACION_ENTREGA || null, UBICACION_ENTREGA: form.UBICACION_ENTREGA || null,
      ID_DESPACHO_DETALLE: num(form.ID_DESPACHO_DETALLE),
    };
    try {
      if (item) { await updateEntrega(item.ID_ENTREGA, payload); } else { await createEntrega(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Entrega guardada.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Entrega' : 'Nueva Entrega'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Sec label="Receptor" />
        <Row>
          <F flex label="Nombre *" val={form.NOMBRE_RECIBE_ENTREGA} onChange={v => set('NOMBRE_RECIBE_ENTREGA', v)} err={errors.NOMBRE_RECIBE_ENTREGA} ph="Nombre" />
          <F flex label="Apellidos" val={form.APELLIDOS_RECIBE_ENTREGA} onChange={v => set('APELLIDOS_RECIBE_ENTREGA', v)} ph="Apellidos" />
        </Row>
        <F label="DPI *" val={form.DPI_RECIBE_ENTREGA} onChange={v => set('DPI_RECIBE_ENTREGA', v)} err={errors.DPI_RECIBE_ENTREGA} ph="Número DPI" kb="numeric" />
        <Sec label="Detalles" />
        <F label="Fecha Entrega" val={form.FECHA_ENTREGA} onChange={v => set('FECHA_ENTREGA', v)} ph="YYYY-MM-DD" />
        <F label="Ubicación" val={form.UBICACION_ENTREGA} onChange={v => set('UBICACION_ENTREGA', v)} ph="Dirección" />
        <F label="Observaciones" val={form.OBSERVACION_ENTREGA} onChange={v => set('OBSERVACION_ENTREGA', v)} ph="Notas..." ml />
        <Sec label="Evidencia" />
        <F label="Firma (URL)" val={form.FIRMA_RECIBE_ENTREGA} onChange={v => set('FIRMA_RECIBE_ENTREGA', v)} ph="URL firma" />
        <F label="Foto (URL)" val={form.FOTO_ENTREGA} onChange={v => set('FOTO_ENTREGA', v)} ph="URL foto" />
        <Sec label="Referencias" />
        <F label="ID Despacho Detalle" val={form.ID_DESPACHO_DETALLE} onChange={v => set('ID_DESPACHO_DETALLE', v)} kb="numeric" ph="ID" />
        <View style={{ height: 24 }} />
      </ScrollView>
      <Footer onClose={onClose} onSave={handleSave} saving={saving} isEdit={!!item} label="entrega" />
    </Drawer>
  );
}

function Sec({ label }: { label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
  </View>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.medium }}>{children}</View>;
}

function F({ label, val, onChange, err, ph, kb = 'default', ml, flex, autoC }: {
  label: string; val: string; onChange: (v: string) => void; err?: string; ph?: string;
  kb?: any; ml?: boolean; flex?: boolean; autoC?: any;
}) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 }}>{label}</Text>
      <TextInput
        style={[{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text }, ml && { height: 80, textAlignVertical: 'top' }]}
        value={val} onChangeText={onChange} placeholder={ph} placeholderTextColor={Colors.textMuted}
        keyboardType={kb} multiline={ml} autoCapitalize={autoC} />
      {!!err && <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>{err}</Text>}
    </View>
  );
}

function Footer({ onClose, onSave, saving, isEdit, label }: { onClose: () => void; onSave: () => void; saving: boolean; isEdit: boolean; label: string; }) {
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
