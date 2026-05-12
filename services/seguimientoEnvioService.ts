import api from './api';

export interface SeguimientoEnvio {
  ID_SEGUIMIENTO_ENVIO: number;
  FECHA_HORA_SEGUIMIENTO_ENVIO: string | null;
  DESCRIPCION_SEGUIMIENTO_ENVIO: string | null;
  UBICACION_SEGUIMIENTO_ENVIO: string | null;
  ESTADO_SEGUIMIENTO_ENVIO: string | null;
  ID_ENTREGA: number | null;
  ID_USUARIO_CREA: number | null;
  ID_USUARIO_MODIFICA: number | null;
}

interface SeguimientoEnvioPayload {
  fechaHoraSeguimientoEnvio: string | null;
  descripcionSeguimientoEnvio: string | null;
  ubicacionSeguimientoEnvio: string | null;
  estadoSeguimientoEnvio: string | null;
  idEntrega: number | null;
  idUsuarioCrea: number | null;
  idUsuarioModifica: number | null;
}

const toPayload = (data: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'>): SeguimientoEnvioPayload => ({
  fechaHoraSeguimientoEnvio:   data.FECHA_HORA_SEGUIMIENTO_ENVIO,
  descripcionSeguimientoEnvio: data.DESCRIPCION_SEGUIMIENTO_ENVIO,
  ubicacionSeguimientoEnvio:   data.UBICACION_SEGUIMIENTO_ENVIO,
  estadoSeguimientoEnvio:      data.ESTADO_SEGUIMIENTO_ENVIO,
  idEntrega:                   data.ID_ENTREGA,
  idUsuarioCrea:               data.ID_USUARIO_CREA,
  idUsuarioModifica:           data.ID_USUARIO_MODIFICA,
});

export const getSeguimientosEnvio = async (): Promise<SeguimientoEnvio[]> => {
  const response = await api.get('/SeguimientoEnvio');
  return response.data;
};

export const createSeguimientoEnvio = async (data: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'>): Promise<void> => {
  await api.post('/SeguimientoEnvio', toPayload(data));
};

export const updateSeguimientoEnvio = async (id: number, data: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'>): Promise<void> => {
  await api.put(`/SeguimientoEnvio?id=${id}`, toPayload(data));
};

export const deleteSeguimientoEnvio = async (id: number): Promise<void> => {
  await api.delete(`/SeguimientoEnvio?id=${id}`);
};
