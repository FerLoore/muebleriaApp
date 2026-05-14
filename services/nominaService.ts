import api from './api';

// Campos devueltos por NominaModel.Obtener() — nombres de columna Oracle
export interface Nomina {
  ID_NOMINA:                number;
  PERIODO_NOMINA:           string | null;
  FECHA_PAGO_NOMINA:        string | null; // ISO DateTime
  TOTAL_BRUTO_NOMINA:       number | null;
  TOTAL_DESCUENTOS_NOMINA:  number | null;
  TOTAL_NETO_NOMINA:        number | null;
  ESTADO_NOMINA:            string | null;
  ID_SUCURSAL:              number | null;
  ID_USUARIO_CREA:          number | null;
  ID_USUARIO_MODIFICA:      number | null;
}

// Coincide con el objeto Nomina de VB.NET (camelCase)
interface NominaPayload {
  idNomina:             number;
  periodoNomina:        string | null;
  fechaPagoNomina:      string | null;
  totalBrutoNomina:     number | null;
  totalDescuentosNomina: number | null;
  totalNetoNomina:      number | null;
  estadoNomina:         string | null;
  idSucursal:           number | null;
  idUsuarioCrea:        number | null;
  idUsuarioModifica:    number | null;
}

const toPayload = (id: number, data: Omit<Nomina, 'ID_NOMINA'>): NominaPayload => ({
  idNomina:              id,
  periodoNomina:         data.PERIODO_NOMINA,
  fechaPagoNomina:       data.FECHA_PAGO_NOMINA,
  totalBrutoNomina:      data.TOTAL_BRUTO_NOMINA,
  totalDescuentosNomina: data.TOTAL_DESCUENTOS_NOMINA,
  totalNetoNomina:       data.TOTAL_NETO_NOMINA,
  estadoNomina:          data.ESTADO_NOMINA,
  idSucursal:            data.ID_SUCURSAL,
  idUsuarioCrea:         data.ID_USUARIO_CREA,
  idUsuarioModifica:     data.ID_USUARIO_MODIFICA,
});

export const getNominas = async (): Promise<Nomina[]> => {
  try {
    const response = await api.get('/Nomina/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo nóminas:', error);
    throw error;
  }
};

export const createNomina = async (data: Omit<Nomina, 'ID_NOMINA'>): Promise<void> => {
  try {
    await api.post('/Nomina/Create', toPayload(0, data));
  } catch (error) {
    console.error('Error creando nómina:', error);
    throw error;
  }
};

export const updateNomina = async (id: number, data: Omit<Nomina, 'ID_NOMINA'>): Promise<void> => {
  try {
    await api.put(`/Nomina/Edit?id=${id}`, toPayload(id, data));
  } catch (error) {
    console.error('Error actualizando nómina:', error);
    throw error;
  }
};

export const deleteNomina = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Nomina/Delete?id=${id}`);
  } catch (error) {
    console.error('Error eliminando nómina:', error);
    throw error;
  }
};
