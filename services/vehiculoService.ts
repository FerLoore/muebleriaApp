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

interface VehiculoPayload {
  placaVehiculo: string | null;
  marcaVehiculo: string | null;
  modeloVehiculo: string | null;
  tipoVehiculo: string | null;
  capacidadKgVehiculo: number | null;
  kmUltServVehiculo: number | null;
  kmSigServVehiculo: number | null;
  estadoVehiculo: string | null;
  idSucursal: number | null;
}

const toPayload = (data: Omit<Vehiculo, 'ID_VEHICULO'>): VehiculoPayload => ({
  placaVehiculo:       data.PLACA_VEHICULO,
  marcaVehiculo:       data.MARCA_VEHICULO,
  modeloVehiculo:      data.MODELO_VEHICULO,
  tipoVehiculo:        data.TIPO_VEHICULO,
  capacidadKgVehiculo: data.CAPACIDAD_KG_VEHICULO,
  kmUltServVehiculo:   data.KM_ULT_SERV_VEHICULO,
  kmSigServVehiculo:   data.KM_SIG_SERV_VEHICULO,
  estadoVehiculo:      data.ESTADO_VEHICULO,
  idSucursal:          data.ID_SUCURSAL,
});

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const response = await api.get('/Vehiculo');
  return response.data;
};

export const createVehiculo = async (data: Omit<Vehiculo, 'ID_VEHICULO'>): Promise<void> => {
  await api.post('/Vehiculo', toPayload(data));
};

export const updateVehiculo = async (id: number, data: Omit<Vehiculo, 'ID_VEHICULO'>): Promise<void> => {
  await api.put(`/Vehiculo?id=${id}`, toPayload(data));
};

export const deleteVehiculo = async (id: number): Promise<void> => {
  await api.delete(`/Vehiculo?id=${id}`);
};
