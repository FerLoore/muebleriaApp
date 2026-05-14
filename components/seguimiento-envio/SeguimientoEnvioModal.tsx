import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { SeguimientoEnvio, createSeguimientoEnvio, updateSeguimientoEnvio } from '../../services/seguimientoEnvioService';
import { getEntregas } from '../../services/entregaService';
import { getUsuarios } from '../../services/usuariosService';
import Drawer from '../ui/Drawer';
import DatePickerField from '../ui/DatePickerField';
import DropdownSelect, { DropdownOption } from '../ui/DropdownSelect';

const ESTADOS = ['P', 'T', 'E', 'C'];
const ESTADO_LABEL: Record<string, string> = { P: 'Pendiente', T: 'En Tránsito', E: 'Entregado', C: 'Cancelado' };

type Props = { visible: boolean; onClose: () => void; item: SeguimientoEnvio | null; onSaved: () => void; };

export default function SeguimientoEnvioModal({ visible, onClose, item, onSaved }: Props) {
  const [fechaHora, setFechaHora]     = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion]     = useState('');
  const [estado, setEstado]           = useState('P');

  const [idEntrega,          setIdEntrega]          = useState<number | null>(null);
  const [idUsuarioCrea,      setIdUsuarioCrea]      = useState<number | null>(null);
  const [idUsuarioModifica,  setIdUsuarioModifica]  = useState<number | null>(null);

  const [entregas,  setEntregas]  = useState<DropdownOption[]>([]);
  const [usuarios,  setUsuarios]  = useState<DropdownOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    setLoadingOpts(true);
    Promise.all([getEntregas(), getUsuarios()])
      .then(([ents, usrs]) => {
        setEntregas(ents.map(e => ({
          value: e.ID_ENTREGA,
          label: `#${e.ID_ENTREGA} — ${e.NOMBRE_RECIBE_ENTREGA ?? ''} ${e.APELLIDOS_RECIBE_ENTREGA ?? ''}`.trim(),
        })));
        setUsuarios(usrs.map(u => ({
          value: u.IdUsuario,
          label: `${u.NombreUsuario ?? '—'} (ID ${u.IdUsuario})`,
        })));
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar opciones.' }))
      .finally(() => setLoadingOpts(false));
  }, [visible]);

  useEffect(() => {
    if (item) {
      setFechaHora(item.FECHA_HORA_SEGUIMIENTO_ENVIO ?? '');
      setDescripcion(item.DESCRIPCION_SEGUIMIENTO_ENVIO ?? '');
      setUbicacion(item.UBICACION_SEGUIMIENTO_ENVIO ?? '');
      setEstado(item.ESTADO_SEGUIMIENTO_ENVIO ?? 'P');
      setIdEntrega(item.ID_ENTREGA);
      setIdUsuarioCrea(item.ID_USUARIO_CREA);
      setIdUsuarioModifica(item.ID_USUARIO_MODIFICA);
    } else {
      setFechaHora(''); setDescripcion(''); setUbicacion(''); setEstado('P');
      setIdEntrega(null); setIdUsuarioCrea(null); setIdUsuarioModifica(null);
    }
    setErrors({});
  }, [item, visible]);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!descripcion.trim()) e.descripcion = 'Requerido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'> = {
      FECHA_HORA_SEGUIMIENTO_ENVIO:  fechaHora || null,
      DESCRIPCION_SEGUIMIENTO_ENVIO: descripcion || null,
      UBICACION_SEGUIMIENTO_ENVIO:   ubicacion || null,
      ESTADO_SEGUIMIENTO_ENVIO:      estado || null,
      ID_ENTREGA:                    idEntrega,
      ID_USUARIO_CREA:               idUsuarioCrea,
      ID_USUARIO_MODIFICA:           idUsuarioModifica,
    };
    try {
      if (item) { await updateSeguimientoEnvio(item.ID_SEGUIMIENTO_ENVIO, payload); }
      else       { await createSeguimientoEnvio(payload); }
      Toast.show({ type: 'success', text1: 'Guardado', text2: 'Seguimiento guardado.' });
      onSaved();
    } catch { Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar.' }); }
    finally   { setSaving(false); }
  };

  return (
    <Drawer visible={visible} onClose={onClose} title={item ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Sec label="Entrega asociada" />
        <DropdownSelect
          label="Entrega"
          value={idEntrega}
          onChange={setIdEntrega}
          options={entregas}
          loading={loadingOpts}
          placeholder="Seleccionar entrega..."
        />

        <Sec label="Detalle del seguimiento" />
        <DatePickerField
          label="Fecha"
          value={fechaHora ? fechaHora.split('T')[0].split(' ')[0] : ''}
          onChange={v => setFechaHora(v)}
        />
        <F label="Descripción *" val={descripcion} onChange={setDescripcion} ph="Descripción del evento" err={errors.descripcion} multiline />
        <F label="Ubicación" val={ubicacion} onChange={setUbicacion} ph="Dirección o coordenadas" />

        <Sec label="Estado" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {ESTADOS.map(est => (
            <TouchableOpacity key={est} style={[s.toggleBtn, estado === est && s.toggleBtnActive]} onPress={() => setEstado(est)}>
              <Text style={[s.toggleText, estado === est && s.toggleTextActive]}>{ESTADO_LABEL[est]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sec label="Usuarios" />
        <DropdownSelect
          label="Usuario Crea"
          value={idUsuarioCrea}
          onChange={setIdUsuarioCrea}
          options={usuarios}
          loading={loadingOpts}
          placeholder="Seleccionar usuario..."
        />
        <DropdownSelect
          label="Usuario Modifica"
          value={idUsuarioModifica}
          onChange={setIdUsuarioModifica}
          options={usuarios}
          loading={loadingOpts}
          placeholder="Seleccionar usuario..."
        />

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
function F({ label, val, onChange, err, ph, kb = 'default', flex, multiline }: {
  label: string; val: string; onChange: (v: string) => void; err?: string; ph?: string; kb?: any; flex?: boolean; multiline?: boolean;
}) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 }}>{label}</Text>
      <TextInput style={{ backgroundColor: Colors.background, borderWidth: 1, borderColor: err ? '#DC2626' : Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.text, minHeight: multiline ? 80 : undefined, textAlignVertical: multiline ? 'top' : undefined }}
        value={val} onChangeText={onChange} placeholder={ph} placeholderTextColor={Colors.textMuted} keyboardType={kb} multiline={multiline} />
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
