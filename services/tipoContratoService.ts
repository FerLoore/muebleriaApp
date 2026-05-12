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

interface TipoContratoPayload {
  codigoTipoContrato: string | null;
  nombreTipoContrato: string | null;
  observacionesTipoContrato: string | null;
  duracionTipoContrato: number | null;
  prestacionesTipoContrato: string | null;
  horaExtraTipoContrato: string | null;
}

const toPayload = (data: Omit<TipoContrato, 'ID_TIPO_CONTRATO'>): TipoContratoPayload => ({
  codigoTipoContrato:       data.CODIGO_TIPO_CONTRATO,
  nombreTipoContrato:       data.NOMBRE_TIPO_CONTRATO,
  observacionesTipoContrato: data.OBSERVACIONES_TIPO_CONTRATO,
  duracionTipoContrato:     data.DURACION_TIPO_CONTRATO,
  prestacionesTipoContrato: data.PRESTACIONES_TIPO_CONTRATO,
  horaExtraTipoContrato:    data.HORA_EXTRA_TIPO_CONTRATO,
});

export const getTiposContrato = async (): Promise<TipoContrato[]> => {
  const response = await api.get('/TipoContrato');
  return response.data;
};

export const createTipoContrato = async (data: Omit<TipoContrato, 'ID_TIPO_CONTRATO'>): Promise<void> => {
  await api.post('/TipoContrato', toPayload(data));
};

export const updateTipoContrato = async (id: number, data: Omit<TipoContrato, 'ID_TIPO_CONTRATO'>): Promise<void> => {
  await api.put(`/TipoContrato?id=${id}`, toPayload(data));
};

export const deleteTipoContrato = async (id: number): Promise<void> => {
  await api.delete(`/TipoContrato?id=${id}`);
};
