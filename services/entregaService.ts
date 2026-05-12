import api from './api';

export interface Entrega {
  ID_ENTREGA: number;
  FECHA_ENTREGA: string | null;
  NOMBRE_RECIBE_ENTREGA: string | null;
  APELLIDOS_RECIBE_ENTREGA: string | null;
  DPI_RECIBE_ENTREGA: string | null;
  FIRMA_RECIBE_ENTREGA: string | null;
  FOTO_ENTREGA: string | null;
  OBSERVACION_ENTREGA: string | null;
  UBICACION_ENTREGA: string | null;
  ID_DESPACHO_DETALLE: number | null;
}

interface EntregaPayload {
  idEntrega: number;
  fechaEntrega: string | null;
  nombreRecibeEntrega: string | null;
  apellidosRecibeEntrega: string | null;
  dpiRecibeEntrega: string | null;
  firmaRecibeEntrega: string | null;
  fotoEntrega: string | null;
  observacionEntrega: string | null;
  ubicacionEntrega: string | null;
  idDespachoDetalle: number | null;
}

const toPayload = (data: Omit<Entrega, 'ID_ENTREGA'>): Omit<EntregaPayload, 'idEntrega'> => ({
  fechaEntrega:          data.FECHA_ENTREGA,
  nombreRecibeEntrega:   data.NOMBRE_RECIBE_ENTREGA,
  apellidosRecibeEntrega: data.APELLIDOS_RECIBE_ENTREGA,
  dpiRecibeEntrega:      data.DPI_RECIBE_ENTREGA,
  firmaRecibeEntrega:    data.FIRMA_RECIBE_ENTREGA,
  fotoEntrega:           data.FOTO_ENTREGA,
  observacionEntrega:    data.OBSERVACION_ENTREGA,
  ubicacionEntrega:      data.UBICACION_ENTREGA,
  idDespachoDetalle:     data.ID_DESPACHO_DETALLE,
});

export const getEntregas = async (): Promise<Entrega[]> => {
  const response = await api.get('/Entrega');
  return response.data;
};

export const createEntrega = async (data: Omit<Entrega, 'ID_ENTREGA'>): Promise<void> => {
  await api.post('/Entrega', toPayload(data));
};

export const updateEntrega = async (id: number, data: Omit<Entrega, 'ID_ENTREGA'>): Promise<void> => {
  await api.put(`/Entrega?id=${id}`, toPayload(data));
};

export const deleteEntrega = async (id: number): Promise<void> => {
  await api.delete(`/Entrega?id=${id}`);
};
