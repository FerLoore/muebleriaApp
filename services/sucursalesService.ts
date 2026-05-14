import api from './api';

export interface Sucursal {
  IdSucursal:    number;
  NombreSucursal: string | null;
}

export const getSucursales = async (): Promise<Sucursal[]> => {
  try {
    const response = await api.get('/Sucursales/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sucursales:', error);
    throw error;
  }
};
