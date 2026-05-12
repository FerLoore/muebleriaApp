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

interface OrdenDespachoPayload {
  nombreOrdenDespacho: string | null;
  fechaCreaOrdenDespacho: string | null;
  fechaEntregaOrdenDespacho: string | null;
  pesoKgTotalOrdenDespacho: number | null;
  estadoOrdenDespachado: string | null;
  idVehiculo: number | null;
  idTransportista: number | null;
  idSucursal: number | null;
}

const toPayload = (data: Omit<OrdenDespacho, 'ID_ORDEN_DESPACHO'>): OrdenDespachoPayload => ({
  nombreOrdenDespacho:       data.NOMBRE_ORDEN_DESPACHO,
  fechaCreaOrdenDespacho:    data.FECHA_CREA_ORDEN_DESPACHO,
  fechaEntregaOrdenDespacho: data.FECHA_ENTREGA_ORDEN_DESPACHO,
  pesoKgTotalOrdenDespacho:  data.PESO_KG_TOTAL_ORDEN_DESPACHO,
  estadoOrdenDespachado:     data.ESTADO_ORDEN_DESPACHADO,
  idVehiculo:                data.ID_VEHICULO,
  idTransportista:           data.ID_TRANSPORTISTA,
  idSucursal:                data.ID_SUCURSAL,
});

export const getOrdenesDespacho = async (): Promise<OrdenDespacho[]> => {
  const response = await api.get('/OrdenDespacho');
  return response.data;
};

export const createOrdenDespacho = async (data: Omit<OrdenDespacho, 'ID_ORDEN_DESPACHO'>): Promise<void> => {
  await api.post('/OrdenDespacho', toPayload(data));
};

export const updateOrdenDespacho = async (id: number, data: Omit<OrdenDespacho, 'ID_ORDEN_DESPACHO'>): Promise<void> => {
  await api.put(`/OrdenDespacho?id=${id}`, toPayload(data));
};

export const deleteOrdenDespacho = async (id: number): Promise<void> => {
  await api.delete(`/OrdenDespacho?id=${id}`);
};
