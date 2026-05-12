import api from './api';

export interface Entrega {
  ID_ENTREGA: number;
  NOMBRE_RECIBE_ENTREGA: string | null;
  APELLIDOS_RECIBE_ENTREGA: string | null;
  DPI_RECIBE_ENTREGA: string | null;
  FECHA_ENTREGA: string | null;
  UBICACION_ENTREGA: string | null;
  OBSERVACION_ENTREGA: string | null;
  ID_DESPACHO_DETALLE: number | null;
  ID_USUARIO_CREA: number | null;
  ID_USUARIO_MODIFICA: number | null;
}

export const getEntregas = async (): Promise<Entrega[]> => {
  const response = await api.get('/Entrega');
  return response.data;
};

export const createEntrega = async (data: Omit<Entrega, 'ID_ENTREGA'>): Promise<void> => {
  await api.post('/Entrega', data);
};

export const updateEntrega = async (id: number, data: Omit<Entrega, 'ID_ENTREGA'>): Promise<void> => {
  await api.put('/Entrega', { ...data, ID_ENTREGA: id });
};

export const deleteEntrega = async (id: number): Promise<void> => {
  await api.delete(`/Entrega?id=${id}`);
};
