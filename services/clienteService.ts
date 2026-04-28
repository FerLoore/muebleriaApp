import api from './api';

export interface Cliente {
  codigo: string;
  razonSocial: string;
  nit: string;
  limiteCredito?: number;
  telefono: string;
  email: string;
  plazoPago?: number;
  estado: string;
  idListaPrecios?: number;
  idSucursal?: number;
}

export const getClientes = async () => {
  try {
    const response = await api.get('/Cliente');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
};

export const createCliente = async (cliente: Cliente) => {
  try {
    const response = await api.post('/Cliente', cliente);
    return response.data;
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
};
