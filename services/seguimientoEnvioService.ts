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

export const getSeguimientosEnvio = async (): Promise<SeguimientoEnvio[]> => {
  const response = await api.get('/SeguimientoEnvio');
  return response.data;
};

export const createSeguimientoEnvio = async (data: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'>): Promise<void> => {
  await api.post('/SeguimientoEnvio', data);
};

export const updateSeguimientoEnvio = async (id: number, data: Omit<SeguimientoEnvio, 'ID_SEGUIMIENTO_ENVIO'>): Promise<void> => {
  await api.put('/SeguimientoEnvio', { ...data, ID_SEGUIMIENTO_ENVIO: id });
};

export const deleteSeguimientoEnvio = async (id: number): Promise<void> => {
  await api.delete(`/SeguimientoEnvio?id=${id}`);
};
