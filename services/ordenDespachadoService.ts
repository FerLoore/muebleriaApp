import api from './api';

export interface OrdenDespacho {
  ID_ORDEN_DESPACHO: number;
  NOMBRE_ORDEN_DESPACHO: string | null;
  FECHA_CREA_ORDEN_DESPACHO: string | null;
  FECHA_ENTREGA_ORDEN_DESPACHO: string | null;
  PESO_KG_TOTAL_ORDEN_DESPACHO: number | null;
  ESTADO_ORDEN_DESPACHADO: string | null;
  ID_VEHICULO: number | null;
  ID_TRANSPORTISTA: number | null;
  ID_SUCURSAL: number | null;
}

export const getOrdenesDespacho = async (): Promise<OrdenDespacho[]> => {
  const response = await api.get('/OrdenDespacho');
  return response.data;
};

export const createOrdenDespacho = async (data: Omit<OrdenDespacho, 'ID_ORDEN_DESPACHO'>): Promise<void> => {
  await api.post('/OrdenDespacho', data);
};

export const updateOrdenDespacho = async (id: number, data: Omit<OrdenDespacho, 'ID_ORDEN_DESPACHO'>): Promise<void> => {
  await api.put('/OrdenDespacho', { ...data, ID_ORDEN_DESPACHO: id });
};

export const deleteOrdenDespacho = async (id: number): Promise<void> => {
  await api.delete(`/OrdenDespacho?id=${id}`);
};
