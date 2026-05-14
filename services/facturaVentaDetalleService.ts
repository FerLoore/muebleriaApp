import api from './api';

// Campos devueltos por FacturaVentaDetalleModel.Obtener()
export interface FacturaVentaDetalle {
  ID_FACTURA_VENTA_DETALLE: number;
  CANTIDAD_FACTURA_VENTA_DETALLE:     number | null;
  PRECIO_UNITARIO_FACTURA_VENTA_DET:  number | null;
  ESTADO_FACTURA_VENTA_DETALLE:       string | null;
  ID_FACTURA_VENTA:                   number | null;
  ID_ARTICULO:                        number | null;
}

// Coincide exactamente con FacturaVentaDetalleRequest (VB.NET)
interface FacturaVentaDetallePayload {
  cantidad:        number | null;
  precioUnitario:  number | null;
  estado:          string | null;
  idFacturaVenta:  number | null;
  idArticulo:      number | null;
}

const toPayload = (data: Omit<FacturaVentaDetalle, 'ID_FACTURA_VENTA_DETALLE'>): FacturaVentaDetallePayload => ({
  cantidad:       data.CANTIDAD_FACTURA_VENTA_DETALLE,
  precioUnitario: data.PRECIO_UNITARIO_FACTURA_VENTA_DET,
  estado:         data.ESTADO_FACTURA_VENTA_DETALLE,
  idFacturaVenta: data.ID_FACTURA_VENTA,
  idArticulo:     data.ID_ARTICULO,
});

export const getFacturaVentaDetalles = async (): Promise<FacturaVentaDetalle[]> => {
  try {
    const response = await api.get('/FacturaVentaDetalle/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalles de factura de venta:', error);
    throw error;
  }
};

export const createFacturaVentaDetalle = async (data: Omit<FacturaVentaDetalle, 'ID_FACTURA_VENTA_DETALLE'>): Promise<void> => {
  try {
    await api.post('/FacturaVentaDetalle/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando detalle de factura:', error);
    throw error;
  }
};

export const updateFacturaVentaDetalle = async (id: number, data: Omit<FacturaVentaDetalle, 'ID_FACTURA_VENTA_DETALLE'>): Promise<void> => {
  try {
    await api.put(`/FacturaVentaDetalle/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando detalle de factura:', error);
    throw error;
  }
};

export const deleteFacturaVentaDetalle = async (id: number): Promise<void> => {
  try {
    await api.delete(`/FacturaVentaDetalle/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando detalle de factura:', error);
    throw error;
  }
};
