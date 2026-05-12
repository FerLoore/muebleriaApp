import api from './api';

export interface Vehiculo {
  ID_VEHICULO: number;
  PLACA_VEHICULO: string | null;
  MARCA_VEHICULO: string | null;
  MODELO_VEHICULO: string | null;
  TIPO_VEHICULO: string | null;
  CAPACIDAD_KG_VEHICULO: number | null;
  KM_ULT_SERV_VEHICULO: number | null;
  KM_SIG_SERV_VEHICULO: number | null;
  ESTADO_VEHICULO: string | null;
  ID_SUCURSAL: number | null;
}

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const response = await api.get('/Vehiculo');
  return response.data;
};

export const createVehiculo = async (data: Omit<Vehiculo, 'ID_VEHICULO'>): Promise<void> => {
  // El backend usa los nombres de columna directamente (SCREAMING_SNAKE_CASE)
  await api.post('/Vehiculo', data);
};

export const updateVehiculo = async (id: number, data: Omit<Vehiculo, 'ID_VEHICULO'>): Promise<void> => {
  // El controller Edit recibe el objeto completo con ID en el body
  await api.put('/Vehiculo', { ...data, ID_VEHICULO: id });
};

export const deleteVehiculo = async (id: number): Promise<void> => {
  await api.delete(`/Vehiculo?id=${id}`);
};
