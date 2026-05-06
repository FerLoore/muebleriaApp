import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve UnidadMedidaModel.Obtener():
// New With { .ID, .NOMBRE, .DESCRIPCION, .DESCUENTO }
export interface UnidadMedida {
  ID:          number;
  NOMBRE:      string | null;
  DESCRIPCION: string | null;
  DESCUENTO:   number | null;
}
 
// Coincide exactamente con UnidadMedidaRequest (VB.NET)
interface UnidadMedidaPayload {
  nombre:      string | null;
  descripcion: string | null;
  descuento:   number | null;
}
 
const toPayload = (data: Omit<UnidadMedida, 'ID'>): UnidadMedidaPayload => ({
  nombre:      data.NOMBRE,
  descripcion: data.DESCRIPCION,
  descuento:   data.DESCUENTO,
});
 
export const getUnidadesMedida = async (): Promise<UnidadMedida[]> => {
  try {
    const response = await api.get('/UnidadMedida/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo unidades de medida:', error);
    throw error;
  }
};
 
export const createUnidadMedida = async (data: Omit<UnidadMedida, 'ID'>): Promise<void> => {
  try {
    await api.post('/UnidadMedida/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando unidad de medida:', error);
    throw error;
  }
};
 
export const updateUnidadMedida = async (id: number, data: Omit<UnidadMedida, 'ID'>): Promise<void> => {
  try {
    await api.put(`/UnidadMedida/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando unidad de medida:', error);
    throw error;
  }
};
 
export const deleteUnidadMedida = async (id: number): Promise<void> => {
  try {
    await api.delete(`/UnidadMedida/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando unidad de medida:', error);
    throw error;
  }
};