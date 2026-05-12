import api from './api';

export interface DespachoDetalle {
  ID_ORDEN_DESPACHO: number;
  SECUENCIA_ENTREGA_DESPACHO_DETALLE: number;
  ESTADO_DESPACHO_DETALLE: string | null;
  ID_TRASLADO: number | null;
  ID_FACTURA_VENTA: number | null;
  ID_SUCURSAL_ENTR: number | null;
}

interface DespachoDetallePayload {
  idOrdenDespacho: number;
  secuenciaEntregaDespachoDetalle: number;
  estadoDespachoDetalle: string | null;
  idTraslado: number | null;
  idFacturaVenta: number | null;
  idSucursalEntr: number | null;
}

const toPayload = (data: DespachoDetalle): DespachoDetallePayload => ({
  idOrdenDespacho:                   data.ID_ORDEN_DESPACHO,
  secuenciaEntregaDespachoDetalle:   data.SECUENCIA_ENTREGA_DESPACHO_DETALLE,
  estadoDespachoDetalle:             data.ESTADO_DESPACHO_DETALLE,
  idTraslado:                        data.ID_TRASLADO,
  idFacturaVenta:                    data.ID_FACTURA_VENTA,
  idSucursalEntr:                    data.ID_SUCURSAL_ENTR,
});

export const getDespachoDetalles = async (): Promise<DespachoDetalle[]> => {
  const response = await api.get('/DespachoDetalle');
  return response.data;
};

export const createDespachoDetalle = async (data: DespachoDetalle): Promise<void> => {
  await api.post('/DespachoDetalle', toPayload(data));
};

export const updateDespachoDetalle = async (data: DespachoDetalle): Promise<void> => {
  await api.put('/DespachoDetalle', toPayload(data));
};

export const deleteDespachoDetalle = async (idOrden: number, secuencia: number): Promise<void> => {
  await api.delete(`/DespachoDetalle/${idOrden}/${secuencia}`);
};
