import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve StockArticuloModel.Obtener():
// New With { .ID, .CANTIDAD_DISPONIBLE, .CANTIDAD_RESERVADA, .CANTIDAD_TRANSITO,
//            .COSTO_PROMEDIO, .ULTIMO_MOVIMIENTO, .ID_ARTICULO, .ID_UBICACION }
export interface StockArticulo {
  ID:                  number;
  CANTIDAD_DISPONIBLE: number | null;
  CANTIDAD_RESERVADA:  number | null;
  CANTIDAD_TRANSITO:   number | null;
  COSTO_PROMEDIO:      number | null;
  ULTIMO_MOVIMIENTO:   string | null; // ISO string — DateTime serializado
  ID_ARTICULO:         number | null;
  ID_UBICACION:        number | null;
}
 
// Coincide exactamente con StockArticuloRequest (VB.NET)
interface StockArticuloPayload {
  disponible:        number | null;
  reservada:         number | null;
  transito:          number | null;
  costo:             number | null;
  ultimoMovimiento:  string | null;
  idArticulo:        number | null;
  idUbicacion:       number | null;
}
 
const toPayload = (data: Omit<StockArticulo, 'ID'>): StockArticuloPayload => ({
  disponible:       data.CANTIDAD_DISPONIBLE,
  reservada:        data.CANTIDAD_RESERVADA,
  transito:         data.CANTIDAD_TRANSITO,
  costo:            data.COSTO_PROMEDIO,
  ultimoMovimiento: data.ULTIMO_MOVIMIENTO,
  idArticulo:       data.ID_ARTICULO,
  idUbicacion:      data.ID_UBICACION,
});
 
export const getStockArticulos = async (): Promise<StockArticulo[]> => {
  try {
    const response = await api.get('/StockArticulo/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo stock de artículos:', error);
    throw error;
  }
};
 
export const createStockArticulo = async (data: Omit<StockArticulo, 'ID'>): Promise<void> => {
  try {
    await api.post('/StockArticulo/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando stock de artículo:', error);
    throw error;
  }
};
 
export const updateStockArticulo = async (id: number, data: Omit<StockArticulo, 'ID'>): Promise<void> => {
  try {
    await api.put(`/StockArticulo/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando stock de artículo:', error);
    throw error;
  }
};
 
export const deleteStockArticulo = async (id: number): Promise<void> => {
  try {
    await api.delete(`/StockArticulo/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando stock de artículo:', error);
    throw error;
  }
};