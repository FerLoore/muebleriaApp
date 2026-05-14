import api from './api';

export interface Empleado {
  IdEmpleado:          number;
  NombresEmpleado:     string | null;
  ApellidosEmpleado:   string | null;
  NumeroEmpleado:      string | null;
  EstadoEmpleado:      string | null;
}

export const getEmpleados = async (): Promise<Empleado[]> => {
  try {
    const response = await api.get('/Empleados/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    throw error;
  }
};
