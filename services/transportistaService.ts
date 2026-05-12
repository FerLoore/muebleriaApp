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

interface TransportistaPayload {
  nombreTransportista: string | null;
  apellidosTransportista: string | null;
  licenciaTransportista: string | null;
  dpiTransportista: string | null;
  tipoLicTransportista: string | null;
  estadoTransportista: string | null;
  idEmpleado: number | null;
}

const toPayload = (data: Omit<Transportista, 'ID_TRANSPORTISTA'>): TransportistaPayload => ({
  nombreTransportista:    data.NOMBRE_TRANSPORTISTA,
  apellidosTransportista: data.APELLIDOS_TRANSPORTISTA,
  licenciaTransportista:  data.LICENCIA_TRANSPORTISTA,
  dpiTransportista:       data.DPI_TRANSPORTISTA,
  tipoLicTransportista:   data.TIPO_LIC_TRANSPORTISTA,
  estadoTransportista:    data.ESTADO_TRANSPORTISTA,
  idEmpleado:             data.ID_EMPLEADO,
});

export const getTransportistas = async (): Promise<Transportista[]> => {
  const response = await api.get('/Transportista');
  return response.data;
};

export const createTransportista = async (data: Omit<Transportista, 'ID_TRANSPORTISTA'>): Promise<void> => {
  await api.post('/Transportista', toPayload(data));
};

export const updateTransportista = async (id: number, data: Omit<Transportista, 'ID_TRANSPORTISTA'>): Promise<void> => {
  await api.put(`/Transportista?id=${id}`, toPayload(data));
};

export const deleteTransportista = async (id: number): Promise<void> => {
  await api.delete(`/Transportista?id=${id}`);
};
