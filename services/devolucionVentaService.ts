import api from './api';

// Campos devueltos por DevolucionVentaModel.Obtener()
export interface DevolucionVenta {
  ID_DEVOLUCION_VENTA:           number;
  NUMERO_DEVOLUCION:             string | null;
  MOTIVO_DEVOLUCION:             string | null;
  FECHA_DEVOLUCION_VENTA:        string | null; // ISO DateTime
  TOTAL_DEVOLUCION_VENTA:        number | null;
  OBSERVACION_DEVOLUCION_VENTA:  string | null;
  ESTADO_DEVOLUCION_VENTA:       string | null;
  ID_SALIDA_MERCADERIA:          number | null;
  ID_USUARIO_CREA:               number | null;
  ID_USUARIO_MODIFICA:           number | null;
}

// Coincide exactamente con DevolucionVentaRequest (VB.NET)
interface DevolucionVentaPayload {
  numeroDevolucion:  string | null;
  motivo:            string | null;
  fechaDevolucion:   string | null;
  totalDevolucion:   number | null;
  observacion:       string | null;
  estado:            string | null;
  idSalidaMercaderia: number | null;
  idUsuarioCrea:     number | null;
  idUsuarioModifica: number | null;
}

const toPayload = (data: Omit<DevolucionVenta, 'ID_DEVOLUCION_VENTA'>): DevolucionVentaPayload => ({
  numeroDevolucion:   data.NUMERO_DEVOLUCION,
  motivo:             data.MOTIVO_DEVOLUCION,
  fechaDevolucion:    data.FECHA_DEVOLUCION_VENTA,
  totalDevolucion:    data.TOTAL_DEVOLUCION_VENTA,
  observacion:        data.OBSERVACION_DEVOLUCION_VENTA,
  estado:             data.ESTADO_DEVOLUCION_VENTA,
  idSalidaMercaderia: data.ID_SALIDA_MERCADERIA,
  idUsuarioCrea:      data.ID_USUARIO_CREA,
  idUsuarioModifica:  data.ID_USUARIO_MODIFICA,
});

export const getDevolucionesVenta = async (): Promise<DevolucionVenta[]> => {
  try {
    const response = await api.get('/DevolucionVenta/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo devoluciones de venta:', error);
    throw error;
  }
};

export const createDevolucionVenta = async (data: Omit<DevolucionVenta, 'ID_DEVOLUCION_VENTA'>): Promise<void> => {
  try {
    await api.post('/DevolucionVenta/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando devolución de venta:', error);
    throw error;
  }
};

export const updateDevolucionVenta = async (id: number, data: Omit<DevolucionVenta, 'ID_DEVOLUCION_VENTA'>): Promise<void> => {
  try {
    await api.put(`/DevolucionVenta/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando devolución de venta:', error);
    throw error;
  }
};

export const deleteDevolucionVenta = async (id: number): Promise<void> => {
  try {
    await api.delete(`/DevolucionVenta/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando devolución de venta:', error);
    throw error;
  }
};
