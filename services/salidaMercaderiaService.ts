import api from './api';

export interface SalidaMercaderia {
  ID_SALIDA_MERCADERIA:    number;
  NUMERO_SALIDA_MERCADERIA: string | null;
  ESTADO_SALIDA_MERCADERIA: string | null;
}

export const getSalidasMercaderia = async (): Promise<SalidaMercaderia[]> => {
  try {
    const response = await api.get('/SalidaMercaderia/Index');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo salidas de mercadería:', error);
    throw error;
  }
};
