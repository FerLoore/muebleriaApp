import api from './api';
 
// Nombres exactos del objeto anónimo que devuelve ClienteModel.Obtener():
// New With { .ID_CLIENTE, .CODIGO_CLIENTE, .RAZON_SOCIAL_CLIENTE, .NIT_CLIENTE,
//            .LIMITE_CREDITO_CLIENTE, .TELEFON_CLIENTE, .EMAIL_CLIENTE,
//            .PLAZO_PAGO_CLIENTES, .ESTADO_CLIENTE, .ID_LISTA_PRECIOS, .ID_SUCURSAL }
export interface Cliente {
  ID_CLIENTE:             number;
  CODIGO_CLIENTE:         string | null;
  RAZON_SOCIAL_CLIENTE:   string | null;
  NIT_CLIENTE:            string | null;
  LIMITE_CREDITO_CLIENTE: number | null;
  TELEFON_CLIENTE:        string | null;
  EMAIL_CLIENTE:          string | null;
  PLAZO_PAGO_CLIENTES:    number | null;
  ESTADO_CLIENTE:         string | null;
  ID_LISTA_PRECIOS:       number | null;
  ID_SUCURSAL:            number | null;
}
 
// Coincide exactamente con ClienteRequest (VB.NET)
interface ClientePayload {
  codigo:          string | null;
  razonSocial:     string | null;
  nit:             string | null;
  limiteCredito:   number | null;
  telefono:        string | null;
  email:           string | null;
  plazoPago:       number | null;
  estado:          string | null;
  idListaPrecios:  number | null;
  idSucursal:      number | null;
}
 
const toPayload = (data: Omit<Cliente, 'ID_CLIENTE'>): ClientePayload => ({
  codigo:         data.CODIGO_CLIENTE,
  razonSocial:    data.RAZON_SOCIAL_CLIENTE,
  nit:            data.NIT_CLIENTE,
  limiteCredito:  data.LIMITE_CREDITO_CLIENTE,
  telefono:       data.TELEFON_CLIENTE,
  email:          data.EMAIL_CLIENTE,
  plazoPago:      data.PLAZO_PAGO_CLIENTES,
  estado:         data.ESTADO_CLIENTE,
  idListaPrecios: data.ID_LISTA_PRECIOS,
  idSucursal:     data.ID_SUCURSAL,
});
 
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await api.get('/Cliente/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
};
 
export const createCliente = async (data: Omit<Cliente, 'ID_CLIENTE'>): Promise<void> => {
  try {
    await api.post('/Cliente/Crear', toPayload(data));
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
};
 
export const updateCliente = async (id: number, data: Omit<Cliente, 'ID_CLIENTE'>): Promise<void> => {
  try {
    await api.put(`/Cliente/Editar?id=${id}`, toPayload(data));
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    throw error;
  }
};
 
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Cliente/Eliminar?id=${id}`);
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    throw error;
  }
};