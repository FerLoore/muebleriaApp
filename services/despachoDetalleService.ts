import api from './api';

export interface DespachoDetalle {
  ID_ORDEN_DESPACHO: number;
  SECUENCIA_ENTREGA_DESPACHO_DETALLE: number;
  ESTADO_DESPACHO_DETALLE: string | null;
  ID_TRASLADO: number | null;
  ID_FACTURA_VENTA: number | null;
  ID_SUCURSAL_ENTR: number | null;
}

export const getDespachoDetalles = async (): Promise<DespachoDetalle[]> => {
  const response = await api.get('/DespachoDetalle');
  return response.data;
};

export const createDespachoDetalle = async (data: DespachoDetalle): Promise<void> => {
  // Enviar con los nombres exactos que espera el backend VB.NET
  await api.post('/DespachoDetalle', data);
};

export const updateDespachoDetalle = async (data: DespachoDetalle): Promise<void> => {
  await api.put('/DespachoDetalle', data);
};

export const deleteDespachoDetalle = async (idOrden: number, secuencia: number): Promise<void> => {
  await api.delete(`/DespachoDetalle/${idOrden}/${secuencia}`);
};
