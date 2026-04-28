import axios from 'axios';
import { Platform } from 'react-native';

// La URL base ahora se lee del archivo .env
// En Expo, las variables de entorno deben empezar con EXPO_PUBLIC_

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Usa la variable para Android (10.0.2.2)
    return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'https://10.0.2.2:44371/api/';
  } else {
    // Usa la variable para Web / iOS (localhost)
    return process.env.EXPO_PUBLIC_API_URL_WEB || 'https://localhost:44371/api/';
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
