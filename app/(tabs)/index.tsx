import { Image } from 'expo-image';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getClientes } from '../../services/clienteService';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Hacemos una llamada rápida para verificar que el backend responde
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0E1F9', dark: '#1A2A3A' }}
      headerImage={
        <View style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
            contentFit="contain"
          />
        </View>
      }>
      
      <ThemedView style={styles.mainContainer}>
        <ThemedText type="title" style={styles.title}>
          Bienvenido a Proyecto de Mueblería
        </ThemedText>
        
        <View style={styles.statusContainer}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <ThemedText style={{ marginTop: 10 }}>Verificando conexión...</ThemedText>
            </>
          ) : error ? (
            <ThemedView style={styles.errorBox}>
              <ThemedText style={{ color: '#D8000C', fontWeight: 'bold' }}>❌ {error}</ThemedText>
              <ThemedText style={{ color: '#D8000C', fontSize: 13, marginTop: 5 }}>
                Asegúrate de que tu backend en VB.NET esté en ejecución.
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.successBox}>
              <ThemedText style={{ color: '#4F8A10', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
                ✅ Frontend y Backend conectados con éxito
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ThemedView>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  reactLogo: {
    height: 150,
    width: 250,
  },
  mainContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 30,
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
