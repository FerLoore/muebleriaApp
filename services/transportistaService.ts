import api from './api';

export interface Transportista {
  ID_TRANSPORTISTA: number;
  NOMBRE_TRANSPORTISTA: string | null;
  APELLIDOS_TRANSPORTISTA: string | null;
  LICENCIA_TRANSPORTISTA: string | null;
  DPI_TRANSPORTISTA: string | null;
  TIPO_LIC_TRANSPORTISTA: string | null;
  ESTADO_TRANSPORTISTA: string | null;
  ID_EMPLEADO: number | null;
}

export const getTransportistas = async (): Promise<Transportista[]> => {
  const response = await api.get('/Transportista');
  return response.data;
};

export const createTransportista = async (data: Omit<Transportista, 'ID_TRANSPORTISTA'>): Promise<void> => {
  await api.post('/Transportista', data);
};

export const updateTransportista = async (id: number, data: Omit<Transportista, 'ID_TRANSPORTISTA'>): Promise<void> => {
  await api.put('/Transportista', { ...data, ID_TRANSPORTISTA: id });
};

export const deleteTransportista = async (id: number): Promise<void> => {
  await api.delete(`/Transportista?id=${id}`);
};
