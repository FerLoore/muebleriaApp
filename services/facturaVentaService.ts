import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve FacturaVentaModel.Obtener():
// New With { .ID_FACTURA_VENTA, .SERIE_FACTURA_VENTA, .CORRELATIVO_FACTURA_VENTA,
//            .FECHA_SALIDA_FACTURA_VENTA, .FECHA_FACTURA_VENTA,
//            .OBSERVACION_SALIDA_MERCADERIA, .ESTADO_SALIDA_MERCADERIA,
//            .TOTAL_FACTURA_VENTA, .ID_SALIDA_MERCADERIA,
//            .ID_USUARIO_CREA, .ID_USUARIO_MODIFICA }
export interface FacturaVenta {
  ID_FACTURA_VENTA:             number;
  SERIE_FACTURA_VENTA:          string | null;
  CORRELATIVO_FACTURA_VENTA:    number | null;
  FECHA_SALIDA_FACTURA_VENTA:   string | null; // ISO DateTime
  FECHA_FACTURA_VENTA:          string | null; // ISO DateTime
  OBSERVACION_SALIDA_MERCADERIA: string | null;
  ESTADO_SALIDA_MERCADERIA:     string | null;
  TOTAL_FACTURA_VENTA:          number | null;
  ID_SALIDA_MERCADERIA:         number | null;
  ID_USUARIO_CREA:              number | null;
  ID_USUARIO_MODIFICA:          number | null;
}
 
// Coincide exactamente con FacturaVentaRequest (VB.NET)
interface FacturaVentaPayload {
  serie:               string | null;
  correlativo:         number | null;
  fechaSalida:         string | null;
  fechaFactura:        string | null;
  observacion:         string | null;
  estado:              string | null;
  totalFactura:        number | null;
  idSalidaMercaderia:  number | null;
  idUsuarioCrea:       number | null;
  idUsuarioModifica:   number | null;
}
 
const toPayload = (data: Omit<FacturaVenta, 'ID_FACTURA_VENTA'>): FacturaVentaPayload => ({
  serie:              data.SERIE_FACTURA_VENTA,
  correlativo:        data.CORRELATIVO_FACTURA_VENTA,
  fechaSalida:        data.FECHA_SALIDA_FACTURA_VENTA,
  fechaFactura:       data.FECHA_FACTURA_VENTA,
  observacion:        data.OBSERVACION_SALIDA_MERCADERIA,
  estado:             data.ESTADO_SALIDA_MERCADERIA,
  totalFactura:       data.TOTAL_FACTURA_VENTA,
  idSalidaMercaderia: data.ID_SALIDA_MERCADERIA,
  idUsuarioCrea:      data.ID_USUARIO_CREA,
  idUsuarioModifica:  data.ID_USUARIO_MODIFICA,
});
 
export const getFacturasVenta = async (): Promise<FacturaVenta[]> => {
  try {
    const response = await api.get('/FacturaVenta/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo facturas de venta:', error);
    throw error;
  }
};
 
export const createFacturaVenta = async (data: Omit<FacturaVenta, 'ID_FACTURA_VENTA'>): Promise<void> => {
  try {
    await api.post('/FacturaVenta/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando factura de venta:', error);
    throw error;
  }
};
 
export const updateFacturaVenta = async (id: number, data: Omit<FacturaVenta, 'ID_FACTURA_VENTA'>): Promise<void> => {
  try {
    await api.put(`/FacturaVenta/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando factura de venta:', error);
    throw error;
  }
};
 
export const deleteFacturaVenta = async (id: number): Promise<void> => {
  try {
    await api.delete(`/FacturaVenta/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando factura de venta:', error);
    throw error;
  }
};