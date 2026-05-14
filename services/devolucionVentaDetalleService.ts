import api from './api';

// Campos devueltos por DevolucionVentaDetalleModel.Obtener()
export interface DevolucionVentaDetalle {
  ID_DEVOLUCION_VENTA_DETALLE:        number;
  CANTIDAD_DEVOLUCION_VENTA_DETALLE:  number | null;
  ESTADO_DEVOLUCION_VENTA_DETALLE:    string | null;
  ID_DEVOLUCION_VENTA:                number | null;
  ID_ARTICULO:                        number | null;
}

// Coincide con DevolucionVentaDetalleRequest (VB.NET)
interface DevolucionVentaDetallePayload {
  cantidad:          number | null;
  estado:            string | null;
  idDevolucionVenta: number | null;
  idArticulo:        number | null;
}

const toPayload = (data: Omit<DevolucionVentaDetalle, 'ID_DEVOLUCION_VENTA_DETALLE'>): DevolucionVentaDetallePayload => ({
  cantidad:          data.CANTIDAD_DEVOLUCION_VENTA_DETALLE,
  estado:            data.ESTADO_DEVOLUCION_VENTA_DETALLE,
  idDevolucionVenta: data.ID_DEVOLUCION_VENTA,
  idArticulo:        data.ID_ARTICULO,
});

export const getDevolucionVentaDetalles = async (): Promise<DevolucionVentaDetalle[]> => {
  try {
    const response = await api.get('/DevolucionVentaDetalle/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalles de devolución de venta:', error);
    throw error;
  }
};

export const createDevolucionVentaDetalle = async (data: Omit<DevolucionVentaDetalle, 'ID_DEVOLUCION_VENTA_DETALLE'>): Promise<void> => {
  try {
    await api.post('/DevolucionVentaDetalle/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando detalle de devolución:', error);
    throw error;
  }
};

export const updateDevolucionVentaDetalle = async (id: number, data: Omit<DevolucionVentaDetalle, 'ID_DEVOLUCION_VENTA_DETALLE'>): Promise<void> => {
  try {
    await api.put(`/DevolucionVentaDetalle/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando detalle de devolución:', error);
    throw error;
  }
};

export const deleteDevolucionVentaDetalle = async (id: number): Promise<void> => {
  try {
    await api.delete(`/DevolucionVentaDetalle/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando detalle de devolución:', error);
    throw error;
  }
};
