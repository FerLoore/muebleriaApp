import api from './api';

// Nombres exactos del objeto anónimo que devuelve TransferenciaBodegaModel.Obtener():
// New With { .ID, .CODIGO, .CANTIDAD, .FECHA_ENVIO, .FECHA_ENTREGA, .ESTADO,
//            .ID_ORIGEN, .ID_DESTINO, .ID_ARTICULO, .ID_USUARIO_CREA, .ID_USUARIO_MODIFICA }
export interface TransferenciaBodega {
  ID:                  number;
  CODIGO:              string | null;
  CANTIDAD:            number | null;
  FECHA_ENVIO:         string | null; // ISO string — el backend devuelve DateTime serializado
  FECHA_ENTREGA:       string | null;
  ESTADO:              string | null;
  ID_ORIGEN:           number | null;
  ID_DESTINO:          number | null;
  ID_ARTICULO:         number | null;
  ID_USUARIO_CREA:     number | null;
  ID_USUARIO_MODIFICA: number | null;
}

// Coincide exactamente con TransferenciaBodegaRequest (VB.NET)
interface TransferenciaBodegaPayload {
  codigo:              string | null;
  cantidad:            number | null;
  fechaEnvio:          string | null;
  fechaEntrega:        string | null;
  estado:              string | null;
  idOrigen:            number | null;
  idDestino:           number | null;
  idArticulo:          number | null;
  idUsuarioCrea:       number | null;
  idUsuarioModifica:   number | null;
}

const toPayload = (data: Omit<TransferenciaBodega, 'ID'>): TransferenciaBodegaPayload => ({
  codigo:            data.CODIGO,
  cantidad:          data.CANTIDAD,
  fechaEnvio:        data.FECHA_ENVIO,
  fechaEntrega:      data.FECHA_ENTREGA,
  estado:            data.ESTADO,
  idOrigen:          data.ID_ORIGEN,
  idDestino:         data.ID_DESTINO,
  idArticulo:        data.ID_ARTICULO,
  idUsuarioCrea:     data.ID_USUARIO_CREA,
  idUsuarioModifica: data.ID_USUARIO_MODIFICA,
});

export const getTransferenciasBodega = async (): Promise<TransferenciaBodega[]> => {
  try {
    const response = await api.get('/TransferenciaBodega/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo transferencias de bodega:', error);
    throw error;
  }
};

export const createTransferenciaBodega = async (data: Omit<TransferenciaBodega, 'ID'>): Promise<void> => {
  try {
    await api.post('/TransferenciaBodega/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando transferencia de bodega:', error);
    throw error;
  }
};

export const updateTransferenciaBodega = async (id: number, data: Omit<TransferenciaBodega, 'ID'>): Promise<void> => {
  try {
    await api.put(`/TransferenciaBodega/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando transferencia de bodega:', error);
    throw error;
  }
};

export const deleteTransferenciaBodega = async (id: number): Promise<void> => {
  try {
    await api.delete(`/TransferenciaBodega/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando transferencia de bodega:', error);
    throw error;
  }
};