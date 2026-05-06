import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve CategoriasArticuloModel.Obtener():
// New With { .ID, .NOMBRE, .CODIGO, .NIVEL, .ID_PADRE }
export interface CategoriasArticulo {
  ID:       number;
  NOMBRE:   string | null;
  CODIGO:   string | null;
  NIVEL:    number | null;
  ID_PADRE: number | null;
}
 
// Coincide exactamente con CategoriasArticuloRequest (VB.NET)
interface CategoriasArticuloPayload {
  nombre:   string | null;
  codigo:   string | null;
  nivel:    number | null;
  id_padre: number | null;
}
 
const toPayload = (data: Omit<CategoriasArticulo, 'ID'>): CategoriasArticuloPayload => ({
  nombre:   data.NOMBRE,
  codigo:   data.CODIGO,
  nivel:    data.NIVEL,
  id_padre: data.ID_PADRE,
});
 
export const getCategoriasArticulo = async (): Promise<CategoriasArticulo[]> => {
  try {
    const response = await api.get('/CategoriasArticulo/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo categorías de artículo:', error);
    throw error;
  }
};
 
export const createCategoriaArticulo = async (data: Omit<CategoriasArticulo, 'ID'>): Promise<void> => {
  try {
    await api.post('/CategoriasArticulo/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando categoría de artículo:', error);
    throw error;
  }
};
 
export const updateCategoriaArticulo = async (id: number, data: Omit<CategoriasArticulo, 'ID'>): Promise<void> => {
  try {
    await api.put(`/CategoriasArticulo/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando categoría de artículo:', error);
    throw error;
  }
};
 
export const deleteCategoriaArticulo = async (id: number): Promise<void> => {
  try {
    await api.delete(`/CategoriasArticulo/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando categoría de artículo:', error);
    throw error;
  }
};