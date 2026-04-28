import axios from 'axios';
import { Platform } from 'react-native';

// La URL base depende de dónde se esté ejecutando la aplicación.
// Si es en un emulador de Android, usa 10.0.2.2. Si es web o iOS, puedes usar localhost o la IP de tu máquina.
// Reemplaza '192.168.x.x' con tu IP local si vas a probar en un dispositivo físico.

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // 10.0.2.2 es el alias del emulador de Android para localhost del host
    return 'https://10.0.2.2:44371/api/'; 
  } else {
    // Para web o emulador de iOS
    return 'https://localhost:44371/api/';
  }
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la llamada a la API:', error);
    return Promise.reject(error);
  }
);

export default api;
