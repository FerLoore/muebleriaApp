import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve OrdenVentaModel.Obtener():
// New With { .ID_ORDEN_VENTA, .NUMERO_ORDEN_VENTA, .FECHA_SOLICITUD_ORDEN_VENTA,
//            .FECHA_ENTREGA_ORDEN_VENTA, .SUBTOTAL_ORDEN_VENTA, .DESCUENTO_ORDEN_VENTA,
//            .IMPUESTO_ORDEN_VENTA, .TOTAL_ORDEN_VENTA, .ESTADO_ORDEN_VENTA,
//            .ID_SUCURSAL_CLIENTE, .ID_USUARIO_CREA, .ID_USUARIO_MODIFICA }
export interface OrdenVenta {
  ID_ORDEN_VENTA:              number;
  NUMERO_ORDEN_VENTA:          string | null;
  FECHA_SOLICITUD_ORDEN_VENTA: string | null; // ISO DateTime
  FECHA_ENTREGA_ORDEN_VENTA:   string | null; // ISO DateTime
  SUBTOTAL_ORDEN_VENTA:        number | null;
  DESCUENTO_ORDEN_VENTA:       number | null;
  IMPUESTO_ORDEN_VENTA:        number | null;
  TOTAL_ORDEN_VENTA:           number | null;
  ESTADO_ORDEN_VENTA:          string | null;
  ID_SUCURSAL_CLIENTE:         number | null;
  ID_USUARIO_CREA:             number | null;
  ID_USUARIO_MODIFICA:         number | null;
}
 
// Coincide exactamente con OrdenVentaRequest (VB.NET)
interface OrdenVentaPayload {
  numero:             string | null;
  fechaSolicitud:     string | null;
  fechaEntrega:       string | null;
  subtotal:           number | null;
  descuento:          number | null;
  impuesto:           number | null;
  total:              number | null;
  estado:             string | null;
  idSucursalCliente:  number | null;
  idUsuarioCrea:      number | null;
  idUsuarioModifica:  number | null;
}
 
const toPayload = (data: Omit<OrdenVenta, 'ID_ORDEN_VENTA'>): OrdenVentaPayload => ({
  numero:            data.NUMERO_ORDEN_VENTA,
  fechaSolicitud:    data.FECHA_SOLICITUD_ORDEN_VENTA,
  fechaEntrega:      data.FECHA_ENTREGA_ORDEN_VENTA,
  subtotal:          data.SUBTOTAL_ORDEN_VENTA,
  descuento:         data.DESCUENTO_ORDEN_VENTA,
  impuesto:          data.IMPUESTO_ORDEN_VENTA,
  total:             data.TOTAL_ORDEN_VENTA,
  estado:            data.ESTADO_ORDEN_VENTA,
  idSucursalCliente: data.ID_SUCURSAL_CLIENTE,
  idUsuarioCrea:     data.ID_USUARIO_CREA,
  idUsuarioModifica: data.ID_USUARIO_MODIFICA,
});
 
export const getOrdenesVenta = async (): Promise<OrdenVenta[]> => {
  try {
    const response = await api.get('/OrdenVenta/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo órdenes de venta:', error);
    throw error;
  }
};
 
export const createOrdenVenta = async (data: Omit<OrdenVenta, 'ID_ORDEN_VENTA'>): Promise<void> => {
  try {
    await api.post('/OrdenVenta/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando orden de venta:', error);
    throw error;
  }
};
 
export const updateOrdenVenta = async (id: number, data: Omit<OrdenVenta, 'ID_ORDEN_VENTA'>): Promise<void> => {
  try {
    await api.put(`/OrdenVenta/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando orden de venta:', error);
    throw error;
  }
};
 
export const deleteOrdenVenta = async (id: number): Promise<void> => {
  try {
    await api.delete(`/OrdenVenta/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando orden de venta:', error);
    throw error;
  }
};