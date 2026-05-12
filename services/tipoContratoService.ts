import api from './api';

export interface TipoContrato {
  ID_TIPO_CONTRATO: number;
  CODIGO_TIPO_CONTRATO: string | null;
  NOMBRE_TIPO_CONTRATO: string | null;
  OBSERVACIONES_TIPO_CONTRATO: string | null;
  DURACION_TIPO_CONTRATO: number | null;
  PRESTACIONES_TIPO_CONTRATO: string | null;
  HORA_EXTRA_TIPO_CONTRATO: string | null;
}

export const getTiposContrato = async (): Promise<TipoContrato[]> => {
  const response = await api.get('/TipoContrato');
  return response.data;
};

export const createTipoContrato = async (data: Omit<TipoContrato, 'ID_TIPO_CONTRATO'>): Promise<void> => {
  await api.post('/TipoContrato', data);
};

export const updateTipoContrato = async (id: number, data: Omit<TipoContrato, 'ID_TIPO_CONTRATO'>): Promise<void> => {
  await api.put('/TipoContrato', { ...data, ID_TIPO_CONTRATO: id });
};

export const deleteTipoContrato = async (id: number): Promise<void> => {
  await api.delete(`/TipoContrato?id=${id}`);
};
