import api from './api';
 
// Los nombres deben coincidir EXACTAMENTE con las propiedades del objeto anónimo
// que devuelve UbicacionBodegaModel.Obtener() en VB.NET:
// New With { .ID, .PASILLO, .RACK, .NIVEL, .POSICION, .CAPACIDAD, .ID_BODEGA }
export interface UbicacionBodega {
  ID:        number;
  PASILLO:   string | null;
  RACK:      string | null;
  NIVEL:     string | null;
  POSICION:  string | null;
  CAPACIDAD: number | null;
  ID_BODEGA: number | null;
}
 
// Payload que espera el backend — debe coincidir con UbicacionBodegaRequest (VB.NET)
interface UbicacionBodegaPayload {
  pasillo:   string | null;
  rack:      string | null;
  nivel:     string | null;
  posicion:  string | null;
  capacidad: number | null;
  id_bodega: number | null;
}
 
const toPayload = (data: Omit<UbicacionBodega, 'ID'>): UbicacionBodegaPayload => ({
  pasillo:   data.PASILLO,
  rack:      data.RACK,
  nivel:     data.NIVEL,
  posicion:  data.POSICION,
  capacidad: data.CAPACIDAD,
  id_bodega: data.ID_BODEGA,
});
 
export const getUbicacionesBodega = async (): Promise<UbicacionBodega[]> => {
  try {
    const response = await api.get('/UbicacionBodega/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ubicaciones de bodega:', error);
    throw error;
  }
};
 
export const createUbicacionBodega = async (data: Omit<UbicacionBodega, 'ID'>): Promise<void> => {
  try {
    await api.post('/UbicacionBodega/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando ubicación de bodega:', error);
    throw error;
  }
};
 
export const updateUbicacionBodega = async (id: number, data: Omit<UbicacionBodega, 'ID'>): Promise<void> => {
  try {
    await api.put(`/UbicacionBodega/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando ubicación de bodega:', error);
    throw error;
  }
};
 
export const deleteUbicacionBodega = async (id: number): Promise<void> => {
  try {
    await api.delete(`/UbicacionBodega/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando ubicación de bodega:', error);
    throw error;
  }
};