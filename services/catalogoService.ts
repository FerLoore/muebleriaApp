import api from './api';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ArticuloCatalogo {
  idArticulo:      number | null;
  referencia:      string | null;
  codigo:          string | null;
  nombre:          string | null;
  descripcion:     string | null;
  tipoArticulo:    string | null;
  tipoUso:         string | null;
  color:           string | null;
  material:        string | null;
  pesoKg:          number | null;
  alto:            number | null;
  ancho:           number | null;
  profundo:        number | null;
  fotoUrl:         string | null;
  stockMinimo:     number | null;
  stockMaximo:     number | null;
  precioActual:    number | null;
  stockDisponible: number | null;
  categoria:       string | null;
  estado:          string | null;
}

export interface FiltrosCatalogo {
  tipoUso?:   string;
  color?:     string;
  precioMin?: number;
  precioMax?: number;
  conStock?:  'S' | 'N';
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/** GET api/catalogo — lista con filtros opcionales */
export const getCatalogo = async (filtros?: FiltrosCatalogo): Promise<ArticuloCatalogo[]> => {
  const params: Record<string, string | number> = {};
  if (filtros?.tipoUso)          params.tipoUso  = filtros.tipoUso;
  if (filtros?.color)            params.color    = filtros.color;
  if (filtros?.precioMin != null) params.precioMin = filtros.precioMin;
  if (filtros?.precioMax != null) params.precioMax = filtros.precioMax;
  if (filtros?.conStock)         params.conStock  = filtros.conStock;

  const response = await api.get<ArticuloCatalogo[]>('/catalogo', { params });
  return response.data;
};

/** GET api/catalogo/{id} — detalle de un artículo */
export const getCatalogoById = async (id: number): Promise<ArticuloCatalogo> => {
  const response = await api.get<ArticuloCatalogo>(`/catalogo/${id}`);
  return response.data;
};

/** GET api/catalogo/buscar — búsqueda por texto / referencia / categoría */
export const buscarCatalogo = async (
  texto?: string,
  referencia?: string,
  idCategoria?: number,
): Promise<ArticuloCatalogo[]> => {
  const params: Record<string, string | number> = {};
  if (texto)       params.texto       = texto;
  if (referencia)  params.referencia  = referencia;
  if (idCategoria) params.idCategoria = idCategoria;

  const response = await api.get<ArticuloCatalogo[]>('/catalogo/buscar', { params });
  return response.data;
};
