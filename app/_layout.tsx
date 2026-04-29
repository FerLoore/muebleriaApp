import { Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Lista Precios', icon: 'tags', route: '/lista-precios' },
    { name: 'Clientes', icon: 'users', route: '/clientes' },
    { name: 'Pedidos', icon: 'shopping-cart', route: '/pedidos' },
    { name: 'Sucursales', icon: 'building', route: '/sucursales' },
  ];

  return (
    <View style={styles.container}>
      {/* Sidebar - Oculta en móviles muy pequeños */}
      {!Layout.isMobile && (
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="box" size={32} color={Colors.primary} />
            <Text style={styles.logoText}>Mueblería</Text>
          </View>
          
          <View style={styles.navMenu}>
            {menuItems.map((item, index) => {
              const isActive = pathname.startsWith(item.route);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(item.route as any)}
                >
                  <FontAwesome5 
                    name={item.icon} 
                    size={20} 
                    color={isActive ? Colors.primary : Colors.textMuted} 
                    style={{ width: 25, textAlign: 'center' }}
                  />
                  <Text style={[styles.navText, isActive && { color: Colors.primary }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    backgroundColor: Colors.background,
  },
  sidebar: {
    width: 250,
    backgroundColor: Colors.sidebar,
    paddingTop: Layout.spacing.xlarge,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xlarge,
    paddingHorizontal: Layout.spacing.large,
    gap: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  navMenu: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    gap: 15,
  },
  navItemActive: {
    backgroundColor: 'rgba(200, 150, 12, 0.1)',
    borderRightWidth: 3,
    borderColor: Colors.primary,
  },
  navText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
});
