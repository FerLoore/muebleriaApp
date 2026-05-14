import api from './api';

export interface Usuario {
  IdUsuario:    number;
  NombreUsuario: string | null;
  Email:        string | null;
}

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get('/Usuarios/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};
