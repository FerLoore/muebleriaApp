import api from './api';

// Campos devueltos por NominaDetalleModel.Obtener()
export interface NominaDetalle {
  ID_NOMINA_DETALLE:               number;
  SALARIO_BASICO_NOMINA_DETALLE:   number | null;
  HORAS_EXTR_NOMINA_DETALLE:       number | null;
  BONIFICACION_NOMINA_DETALLE:     number | null;
  DESCUENTO_SEGURO_NOMINA_DETALLE: number | null;
  DESCUENTO_IMPUESTO_NOMINA_DETALLE: number | null;
  NETO_PAGAR_NOMINA_DETALLE:       number | null;
  ID_NOMINA:                       number | null;
  ID_EMPLEADO:                     number | null;
}

// Coincide con objeto NominaDetalle de VB.NET (camelCase)
interface NominaDetallePayload {
  idNominaDetalle:              number;
  salarioBasicoNominaDetalle:   number | null;
  horasExtrNominaDetalle:       number | null;
  bonificacionNominaDetalle:    number | null;
  descuentoSeguroNominaDetalle: number | null;
  descuentoImpuestoNominaDetalle: number | null;
  netoPagarNominaDetalle:       number | null;
  idNomina:                     number | null;
  idEmpleado:                   number | null;
}

const toPayload = (id: number, data: Omit<NominaDetalle, 'ID_NOMINA_DETALLE'>): NominaDetallePayload => ({
  idNominaDetalle:               id,
  salarioBasicoNominaDetalle:    data.SALARIO_BASICO_NOMINA_DETALLE,
  horasExtrNominaDetalle:        data.HORAS_EXTR_NOMINA_DETALLE,
  bonificacionNominaDetalle:     data.BONIFICACION_NOMINA_DETALLE,
  descuentoSeguroNominaDetalle:  data.DESCUENTO_SEGURO_NOMINA_DETALLE,
  descuentoImpuestoNominaDetalle: data.DESCUENTO_IMPUESTO_NOMINA_DETALLE,
  netoPagarNominaDetalle:        data.NETO_PAGAR_NOMINA_DETALLE,
  idNomina:                      data.ID_NOMINA,
  idEmpleado:                    data.ID_EMPLEADO,
});

export const getNominaDetalles = async (): Promise<NominaDetalle[]> => {
  try {
    const response = await api.get('/NominaDetalle/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalles de nómina:', error);
    throw error;
  }
};

export const createNominaDetalle = async (data: Omit<NominaDetalle, 'ID_NOMINA_DETALLE'>): Promise<void> => {
  try {
    await api.post('/NominaDetalle/Create', toPayload(0, data));
  } catch (error) {
    console.error('Error creando detalle de nómina:', error);
    throw error;
  }
};

export const updateNominaDetalle = async (id: number, data: Omit<NominaDetalle, 'ID_NOMINA_DETALLE'>): Promise<void> => {
  try {
    await api.put(`/NominaDetalle/Edit?id=${id}`, toPayload(id, data));
  } catch (error) {
    console.error('Error actualizando detalle de nómina:', error);
    throw error;
  }
};

export const deleteNominaDetalle = async (id: number): Promise<void> => {
  try {
    await api.delete(`/NominaDetalle/Delete?id=${id}`);
  } catch (error) {
    console.error('Error eliminando detalle de nómina:', error);
    throw error;
  }
};
