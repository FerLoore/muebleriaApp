import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve BodegasModel.Obtener():
// New With { .ID, .CODIGO, .NOMBRE, .TIPO, .DIRECCION, .ESTADO, .ID_SUCURSAL }
export interface Bodega {
  ID:          number;
  CODIGO:      string | null;
  NOMBRE:      string | null;
  TIPO:        string | null;
  DIRECCION:   string | null;
  ESTADO:      string | null;
  ID_SUCURSAL: number | null;
}
 
// Coincide exactamente con BodegasRequest (VB.NET)
interface BodegaPayload {
  codigo:      string | null;
  nombre:      string | null;
  tipo:        string | null;
  direccion:   string | null;
  estado:      string | null;
  idSucursal:  number | null;
}
 
const toPayload = (data: Omit<Bodega, 'ID'>): BodegaPayload => ({
  codigo:     data.CODIGO,
  nombre:     data.NOMBRE,
  tipo:       data.TIPO,
  direccion:  data.DIRECCION,
  estado:     data.ESTADO,
  idSucursal: data.ID_SUCURSAL,
});
 
export const getBodegas = async (): Promise<Bodega[]> => {
  try {
    const response = await api.get('/Bodegas/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo bodegas:', error);
    throw error;
  }
};
 
export const createBodega = async (data: Omit<Bodega, 'ID'>): Promise<void> => {
  try {
    await api.post('/Bodegas/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando bodega:', error);
    throw error;
  }
};
 
export const updateBodega = async (id: number, data: Omit<Bodega, 'ID'>): Promise<void> => {
  try {
    await api.put(`/Bodegas/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando bodega:', error);
    throw error;
  }
};
 
export const deleteBodega = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Bodegas/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando bodega:', error);
    throw error;
  }
};