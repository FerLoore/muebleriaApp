import { FontAwesome5 } from '@expo/vector-icons';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  // Leemos en tiempo real para que funcione si rotas el dispositivo
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const menuItems = [
    { name: 'Precios', icon: 'tags', route: '/lista-precios' },
    { name: 'Clientes', icon: 'users', route: '/clientes' },
    { name: 'Pedidos', icon: 'shopping-cart', route: '/pedidos' },
    { name: 'Sucursales', icon: 'building', route: '/sucursales' },
    { name: 'Articulos', icon: 'shopping-cart', route: '/articulo' },//(edonis)
    { name: 'Ubucacion Bodega', icon: 'map', route: '/ubicacion-bodega' },//(edonis)
    { name: 'Categoria Articulos', icon: 'list-alt', route: '/categorias-articulo' },//(edonis)
    { name: 'Transferencias Bodega', icon: 'exchange-alt', route: '/transferencia-bodega' },//(edonis)
    { name: 'Stock Articulo', icon: 'cubes', route: '/stock-articulo' },//(edonis)
    { name: 'Unidad Medida', icon: 'ruler', route: '/unidad-medida' }//(edonis)
  ];

  const getBreadcrumb = () => {
    if (pathname.includes('lista-precios')) return 'Home › Inventario › Lista de Precios';
    if (pathname.includes('clientes')) return 'Home › Ventas › Clientes';
    if (pathname.includes('pedidos')) return 'Home › Ventas › Pedidos';
    if (pathname.includes('sucursales')) return 'Home › Config › Sucursales';
    return 'Home';
  };

  return (
    <View style={styles.container}>
      {/* Sidebar - solo desktop */}
      {!isMobile && (
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <FontAwesome5 name="box" size={20} color="#fff" />
            </View>
          </View>
          <View style={styles.navMenu}>
            {menuItems.map((item, index) => {
              const isActive = pathname.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <FontAwesome5
                    name={item.icon}
                    size={20}
                    color="#fff"
                    style={{ opacity: isActive ? 1 : 0.4 }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Contenido Principal */}
      <View style={styles.mainContent}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbText} numberOfLines={1}>
              {getBreadcrumb()}
            </Text>
          </View>
          <View style={styles.userBadge}>
            {!isMobile && <Text style={styles.companyName}>Mueblería Central</Text>}
            <View style={styles.avatar}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4" stroke={Colors.text} strokeWidth="1.8"/>
                <Path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={Colors.text} strokeWidth="1.8" strokeLinecap="round"/>
              </Svg>
            </View>
          </View>
        </View>

        {/* Página actual */}
        <View style={styles.pageContent}>
          <Slot />
        </View>

        {/* Bottom Tab Bar - solo móvil */}
        {isMobile && (
          <View style={styles.bottomBar}>
            {menuItems.map((item, index) => {
              const isActive = pathname.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.bottomTab}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <FontAwesome5
                    name={item.icon}
                    size={18}
                    color={isActive ? Colors.primary : '#999'}
                  />
                  <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  // Sidebar (desktop)
  sidebar: {
    width: 72,
    backgroundColor: Colors.sidebar,
    paddingTop: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navMenu: {
    flex: 1,
    width: '100%',
  },
  navItem: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderColor: 'transparent',
    marginBottom: 5,
  },
  navItemActive: {
    backgroundColor: 'rgba(200, 150, 12, 0.18)',
    borderColor: Colors.primary,
  },
  // Layout principal
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  pageContent: {
    flex: 1,
  },
  // Top Nav
  topNav: {
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  breadcrumbContainer: {
    flex: 1,
    marginRight: 10,
  },
  breadcrumbText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyName: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E3DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom Tab Bar (móvil)
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderColor: Colors.border,
    height: 64,
    paddingBottom: 8,
  },
  bottomTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bottomTabLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  bottomTabLabelActive: {
    color: Colors.primary,
  },
});
