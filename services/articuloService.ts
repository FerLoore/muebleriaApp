import api from './api';

export interface Articulo {
  ID: number;
  CODIGO: string;
  CODIGO_BARRA: string;
  NOMBRE: string;
  DESCRIPCION: string;
  TIPO: string;
  MANEJA_LOTE: string;
  MANEJA_SERIE: string;
  STOCK_MIN: number | null;
  STOCK_MAX: number | null;
  PESO: number | null;
  ESTADO: string;
  FACTOR_CAJA: number | null;
  FACTOR_CAMA: number | null;
  FACTOR_TARIMA: number | null;
  ID_CATEGORIA: number | null;
}

// Payload que espera el backend (camelCase)
interface ArticuloPayload {
  codigo: string;
  codigoBarra: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  manejaLote: string;
  manejaSerie: string;
  stockMin: number | null;
  stockMax: number | null;
  peso: number | null;
  estado: string;
  factorCaja: number | null;
  factorCama: number | null;
  factorTarima: number | null;
  idCategoria: number | null;
}

const toPayload = (data: Omit<Articulo, 'ID'>): ArticuloPayload => ({
  codigo:       data.CODIGO,
  codigoBarra:  data.CODIGO_BARRA,
  nombre:       data.NOMBRE,
  descripcion:  data.DESCRIPCION,
  tipo:         data.TIPO,
  manejaLote:   data.MANEJA_LOTE,
  manejaSerie:  data.MANEJA_SERIE,
  stockMin:     data.STOCK_MIN,
  stockMax:     data.STOCK_MAX,
  peso:         data.PESO,
  estado:       data.ESTADO,
  factorCaja:   data.FACTOR_CAJA,
  factorCama:   data.FACTOR_CAMA,
  factorTarima: data.FACTOR_TARIMA,
  idCategoria:  data.ID_CATEGORIA,
});

export const getArticulos = async (): Promise<Articulo[]> => {
  try {
    const response = await api.get('/Articulo/Index');
    return response.data;
  } catch (error: any) {
    // ASP.NET Web API devuelve { Message: "...", MessageDetail: "..." }
    const data = error?.response?.data;
    const msg =
      (typeof data === 'string' ? data : null)
      ?? data?.Message
      ?? data?.MessageDetail
      ?? data?.message
      ?? error?.message
      ?? JSON.stringify(data)
      ?? 'Error desconocido';
    console.error('[articuloService] Error real:', JSON.stringify(data ?? error?.message));
    throw new Error(String(msg));
  }
};

export const createArticulo = async (data: Omit<Articulo, 'ID'>): Promise<void> => {
  try {
    await api.post('/Articulo/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando artículo:', error);
    throw error;
  }
};

export const updateArticulo = async (id: number, data: Omit<Articulo, 'ID'>): Promise<void> => {
  try {
    await api.put(`/Articulo/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando artículo:', error);
    throw error;
  }
};

export const deleteArticulo = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Articulo?id=${id}`);
  } catch (error) {
    console.error('Error eliminando artículo:', error);
    throw error;
  }
};