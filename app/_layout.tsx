import { Slot } from 'expo-router';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      {/* Sidebar - Oculta en móviles muy pequeños, o se puede adaptar a bottom tab */}
      {!isMobile && (
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="box" size={32} color="#C8960C" />
            <Text style={styles.logoText}>Mueblería</Text>
          </View>
          <View style={styles.navItem}>
            <FontAwesome5 name="tags" size={20} color="#C8960C" />
            <Text style={[styles.navText, { color: '#C8960C' }]}>Listas Precios</Text>
          </View>
        </View>
      )}
      
      {/* Contenido Principal */}
      <View style={styles.mainContent}>
        <Slot />
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#1a1a1a',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
  },
  navText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
});
