import { StyleSheet, ActivityIndicator, View, Text, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { getClientes } from '../services/clienteService';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await getClientes();
        setError(null);
      } catch (err: any) {
        setError('Error de conexión con el backend.');
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/LogoMuebleria_homeConfort.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        Bienvenido a Proyecto de Mueblería
      </Text>
      
      <View style={styles.statusContainer}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={{ marginTop: 10 }}>Verificando conexión...</Text>
          </>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={{ color: '#D8000C', fontWeight: 'bold' }}>❌ {error}</Text>
            <Text style={{ color: '#D8000C', fontSize: 13, marginTop: 5, textAlign: 'center' }}>
              Asegúrate de que tu backend en VB.NET esté en ejecución.
            </Text>
          </View>
        ) : (
          <View style={styles.successBox}>
            <Text style={{ color: '#4F8A10', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
              ✅ Frontend y Backend conectados con éxito
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  successBox: {
    backgroundColor: '#DFF2BF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4F8A10',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBox: {
    backgroundColor: '#FFBABA',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8000C',
    width: '100%',
    alignItems: 'center',
  }
});
