import api from './api';

export interface ListaPrecios {
  ID_LISTA_PRECIOS?: number;
  NOMBRE_LISTA_PRECIOS: string;
  FECHA_DESDE?: string | null;
  FECHA_HASTA?: string | null;
  ID_MONEDA?: number | null;
}

export const getListasPrecios = async () => {
  try {
    const response = await api.get('/ListaPrecios');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo listas de precios:', error);
    throw error;
  }
};

export const createListaPrecios = async (data: ListaPrecios) => {
  try {
    // Map properties to backend Request model
    const payload = {
      nombre: data.NOMBRE_LISTA_PRECIOS,
      fechaDesde: data.FECHA_DESDE,
      fechaHasta: data.FECHA_HASTA,
      idMoneda: data.ID_MONEDA
    };
    const response = await api.post('/ListaPrecios', payload);
    return response.data;
  } catch (error) {
    console.error('Error creando lista de precios:', error);
    throw error;
  }
};

export const updateListaPrecios = async (id: number, data: ListaPrecios) => {
  try {
    const payload = {
      nombre: data.NOMBRE_LISTA_PRECIOS,
      fechaDesde: data.FECHA_DESDE,
      fechaHasta: data.FECHA_HASTA,
      idMoneda: data.ID_MONEDA
    };
    const response = await api.put(`/ListaPrecios/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error actualizando lista de precios:', error);
    throw error;
  }
};

export const deleteListaPrecios = async (id: number) => {
  try {
    const response = await api.delete(`/ListaPrecios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando lista de precios:', error);
    throw error;
  }
};
