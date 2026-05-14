import api from './api';

// Campos devueltos por AsistenciaModel.Obtener()
export interface Asistencia {
  ID_ASISTENCIA:              number;
  FECHA_ASISTENCIA:           string | null; // ISO DateTime
  HORA_IN_ASISTENCIA:         string | null;
  HORA_SAL_ASISTENCIA:        string | null;
  HORA_IN_DES_ASISTENCIA:     string | null;
  HORA_SAL_DES_ASISTENCIA:    string | null;
  HORAS_TRABAJO_ASISTENCIA:   number | null;
  HORAS_DES_ASISTENCIA:       number | null;
  HORAS_EXTR_ASISTENCIA:      number | null;
  ESTADO_ASISTENCIA:          string | null;
  ID_EMPLEADO:                number | null;
}

// El controlador usa el objeto Asistencia directamente (camelCase en JSON .NET)
interface AsistenciaPayload {
  iD_ASISTENCIA:           number;
  fECHA_ASISTENCIA:        string | null;
  hORA_IN_ASISTENCIA:      string | null;
  hORA_SAL_ASISTENCIA:     string | null;
  hORA_IN_DES_ASISTENCIA:  string | null;
  hORA_SAL_DES_ASISTENCIA: string | null;
  hORAS_TRABAJO_ASISTENCIA: number | null;
  hORAS_DES_ASISTENCIA:    number | null;
  hORAS_EXTR_ASISTENCIA:   number | null;
  eSTADO_ASISTENCIA:       string | null;
  iD_EMPLEADO:             number | null;
}

const toPayload = (id: number, data: Omit<Asistencia, 'ID_ASISTENCIA'>): AsistenciaPayload => ({
  iD_ASISTENCIA:            id,
  fECHA_ASISTENCIA:         data.FECHA_ASISTENCIA,
  hORA_IN_ASISTENCIA:       data.HORA_IN_ASISTENCIA,
  hORA_SAL_ASISTENCIA:      data.HORA_SAL_ASISTENCIA,
  hORA_IN_DES_ASISTENCIA:   data.HORA_IN_DES_ASISTENCIA,
  hORA_SAL_DES_ASISTENCIA:  data.HORA_SAL_DES_ASISTENCIA,
  hORAS_TRABAJO_ASISTENCIA: data.HORAS_TRABAJO_ASISTENCIA,
  hORAS_DES_ASISTENCIA:     data.HORAS_DES_ASISTENCIA,
  hORAS_EXTR_ASISTENCIA:    data.HORAS_EXTR_ASISTENCIA,
  eSTADO_ASISTENCIA:        data.ESTADO_ASISTENCIA,
  iD_EMPLEADO:              data.ID_EMPLEADO,
});

export const getAsistencias = async (): Promise<Asistencia[]> => {
  try {
    const response = await api.get('/Asistencia/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    throw error;
  }
};

export const createAsistencia = async (data: Omit<Asistencia, 'ID_ASISTENCIA'>): Promise<void> => {
  try {
    await api.post('/Asistencia/Create', toPayload(0, data));
  } catch (error) {
    console.error('Error creando asistencia:', error);
    throw error;
  }
};

export const updateAsistencia = async (id: number, data: Omit<Asistencia, 'ID_ASISTENCIA'>): Promise<void> => {
  try {
    await api.put(`/Asistencia/Edit?id=${id}`, toPayload(id, data));
  } catch (error) {
    console.error('Error actualizando asistencia:', error);
    throw error;
  }
};

export const deleteAsistencia = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Asistencia/Delete?id=${id}`);
  } catch (error) {
    console.error('Error eliminando asistencia:', error);
    throw error;
  }
};
