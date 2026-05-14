import { FontAwesome5 } from '@expo/vector-icons';
import { Slot, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutInner />
    </SafeAreaProvider>
  );
}

function RootLayoutInner() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      module: 'Ventas',
      item: [
        { name: 'Precios', icon: 'tags', route: '/lista-precios' },
        { name: 'Clientes', icon: 'users', route: '/clientes' },
        { name: 'Orden de Venta', icon: 'dollar-sign', route: '/orden-venta' },
        { name: 'Factura Venta', icon: 'file-invoice', route: '/factura-venta' },
        { name: 'Det. Factura', icon: 'file-invoice-dollar', route: '/factura-venta-detalle' },
        { name: 'Devoluciones', icon: 'undo-alt', route: '/devolucion-venta' },
        { name: 'Det. Devolución', icon: 'list-alt', route: '/devolucion-venta-detalle' },
      ],
    },
    {
      module: 'Inventario',
      item: [
        { name: 'Artículos', icon: 'shopping-cart', route: '/articulo' },
        { name: 'Ubicación Bodega', icon: 'map-marker-alt', route: '/ubicacion-bodega' },
        { name: 'Categorías', icon: 'list-alt', route: '/categorias-articulo' },
        { name: 'Transferencias', icon: 'exchange-alt', route: '/transferencia-bodega' },
        { name: 'Stock', icon: 'cubes', route: '/stock-articulo' },
        { name: 'Unidad Medida', icon: 'ruler', route: '/unidad-medida' },
        { name: 'Bodegas', icon: 'warehouse', route: '/bodegas' },
      ],
    },
    {
      module: 'Logística',
      item: [
        { name: 'Orden Despacho', icon: 'clipboard-list', route: '/orden-despachado' },
        { name: 'Despacho Detalle', icon: 'shipping-fast', route: '/despacho-detalle' },
        { name: 'Entrega', icon: 'box-open', route: '/entrega' },
        { name: 'Seguimiento', icon: 'route', route: '/seguimiento-envio' },
        { name: 'Transportistas', icon: 'id-badge', route: '/transportista' },
        { name: 'Vehículos', icon: 'truck', route: '/vehiculo' },
      ],
    },
    {
      module: 'RRHH',
      item: [
        { name: 'Tipo Contrato', icon: 'file-contract', route: '/tipo-contrato' },
        { name: 'Nómina', icon: 'file-alt', route: '/nomina' },
        { name: 'Det. Nómina', icon: 'user-alt', route: '/nomina-detalle' },
        { name: 'Asistencia', icon: 'calendar-check', route: '/asistencia' },
      ],
    },
  ];

  // 4 tabs fijos + botón "Más"
  const bottomTabs = [
    { name: 'Ventas',     icon: 'shopping-bag',  route: '/clientes' },
    { name: 'Inventario', icon: 'cubes',          route: '/articulo' },
    { name: 'Despacho',   icon: 'truck',          route: '/orden-despachado' },
    { name: 'Logística',  icon: 'route',          route: '/seguimiento-envio' },
  ];

  const toggleModule = (mod: string) => {
    setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const navigate = (route: string) => {
    setMenuOpen(false);
    router.push(route as any);
  };

  const getPageTitle = () => {
    for (const mod of menuItems)
      for (const item of mod.item)
        if (pathname.startsWith(item.route)) return item.name;
    return 'Mueblería Central';
  };

  const getBreadcrumb = () => {
    for (const mod of menuItems)
      for (const item of mod.item)
        if (pathname.startsWith(item.route)) return `${mod.module} › ${item.name}`;
    return 'Inicio';
  };

  return (
    <View style={[s.container, isMobile && { paddingTop: insets.top }]}>

      {/* ── SIDEBAR DESKTOP ── */}
      {!isMobile && (
        <View style={s.sidebar}>
          <View style={s.logoContainer}>
            <View style={s.logoBox}>
              <FontAwesome5 name="box" size={20} color="#fff" />
            </View>
            <Text style={s.logoText}>Mueblería</Text>
          </View>
          <ScrollView style={s.navMenu} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {menuItems.map((module, mIdx) => (
              <View key={mIdx} style={s.moduleContainer}>
                <TouchableOpacity style={s.moduleHeader} onPress={() => toggleModule(module.module)} activeOpacity={0.7}>
                  <Text style={s.moduleTitle}>{module.module}</Text>
                  <FontAwesome5 name={expandedModules[module.module] ? 'chevron-up' : 'chevron-down'} size={11} color="#666" />
                </TouchableOpacity>
                {expandedModules[module.module] && (
                  <View style={s.moduleItems}>
                    {module.item.map((item, iIdx) => {
                      const active = pathname.startsWith(item.route);
                      return (
                        <TouchableOpacity key={iIdx} style={[s.navItem, active && s.navItemActive]} onPress={() => router.push(item.route as any)} activeOpacity={0.7}>
                          <FontAwesome5 name={item.icon} size={14} color="#fff" style={{ opacity: active ? 1 : 0.45 }} />
                          <Text style={[s.navText, active && s.navTextActive]}>{item.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <View style={s.mainContent}>

        {/* Top bar */}
        <View style={[s.topNav, !isMobile && { paddingTop: insets.top, height: 56 + insets.top }]}>
          {isMobile ? (
            <>
              <Text style={s.topNavTitle}>{getPageTitle()}</Text>
              <View style={s.avatar}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="8" r="4" stroke={Colors.text} strokeWidth="1.8" />
                  <Path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={Colors.text} strokeWidth="1.8" strokeLinecap="round" />
                </Svg>
              </View>
            </>
          ) : (
            <>
              <Text style={s.breadcrumb}>{getBreadcrumb()}</Text>
              <View style={s.userBadge}>
                <Text style={s.companyName}>Mueblería Central</Text>
                <View style={s.avatar}>
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="8" r="4" stroke={Colors.text} strokeWidth="1.8" />
                    <Path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={Colors.text} strokeWidth="1.8" strokeLinecap="round" />
                  </Svg>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Contenido de la página */}
        <View style={s.pageContent}>
          <Slot />
        </View>

        {/* ── BOTTOM BAR MÓVIL ── */}
        {isMobile && (
          <View style={[s.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
            {bottomTabs.map((tab, idx) => {
              const active = pathname.startsWith(tab.route);
              return (
                <TouchableOpacity key={idx} style={s.bottomTab} onPress={() => router.push(tab.route as any)} activeOpacity={0.7}>
                  <View style={[s.tabIconWrap, active && s.tabIconWrapActive]}>
                    <FontAwesome5 name={tab.icon} size={17} color={active ? Colors.primary : '#9CA3AF'} />
                  </View>
                  <Text style={[s.bottomTabLabel, active && s.bottomTabLabelActive]}>{tab.name}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Botón Más */}
            <TouchableOpacity style={s.bottomTab} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
              <View style={[s.tabIconWrap, menuOpen && s.tabIconWrapActive]}>
                <FontAwesome5 name="th" size={17} color={menuOpen ? Colors.primary : '#9CA3AF'} />
              </View>
              <Text style={[s.bottomTabLabel, menuOpen && s.bottomTabLabelActive]}>Más</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── MENÚ DRAWER COMPLETO (MÓVIL) ── */}
      <Modal visible={menuOpen} transparent={false} animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <View style={s.menuOverlay}>
          <View style={s.menuSheet}>

            {/* Handle */}


            {/* Cabecera del drawer */}
            <View style={s.menuSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={s.menuLogoBox}>
                  <FontAwesome5 name="box" size={13} color="#fff" />
                </View>
                <Text style={s.menuSheetTitle}>Mueblería Central</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuOpen(false)} style={{ padding: 6 }}>
                <FontAwesome5 name="times" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Lista scrolleable de módulos */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={s.menuScrollContent} showsVerticalScrollIndicator={false}>
              {menuItems.map((module, mIdx) => (
                <View key={mIdx} style={s.menuModule}>

                  {/* Título del módulo */}
                  <View style={s.menuModuleHeader}>
                    <Text style={s.menuModuleTitle}>{module.module}</Text>
                    <View style={s.menuModuleLine} />
                  </View>

                  {/* Grid 3 columnas */}
                  <View style={s.menuGrid}>
                    {module.item.map((item, iIdx) => {
                      const active = pathname.startsWith(item.route);
                      return (
                        <TouchableOpacity key={iIdx} style={[s.menuGridItem, active && s.menuGridItemActive]} onPress={() => navigate(item.route)} activeOpacity={0.75}>
                          <View style={[s.menuGridIcon, active && s.menuGridIconActive]}>
                            <FontAwesome5 name={item.icon} size={18} color={active ? '#fff' : Colors.primary} />
                          </View>
                          <Text style={[s.menuGridLabel, active && s.menuGridLabelActive]} numberOfLines={2}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },

  // Sidebar desktop
  sidebar:          { width: 250, backgroundColor: Colors.sidebar, paddingTop: 20 },
  logoContainer:    { marginBottom: 32, alignItems: 'center', gap: 8 },
  logoBox:          { width: 40, height: 40, backgroundColor: Colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoText:         { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  navMenu:          { flex: 1, paddingHorizontal: 14 },
  moduleContainer:  { marginBottom: 8 },
  moduleHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 4 },
  moduleTitle:      { color: Colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  moduleItems:      { marginLeft: 8 },
  navItem:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8, marginVertical: 1, gap: 10 },
  navItemActive:    { backgroundColor: 'rgba(200,150,12,0.18)' },
  navText:          { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500', flex: 1 },
  navTextActive:    { color: '#fff' },

  // Layout principal
  mainContent:      { flex: 1, flexDirection: 'column' },
  pageContent:      { flex: 1 },

  // Top Nav
  topNav:           { height: 56, backgroundColor: '#fff', borderBottomWidth: 0.5, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  topNavTitle:      { fontSize: 17, fontWeight: '700', color: Colors.text },
  breadcrumb:       { fontSize: 12, color: Colors.textMuted, flex: 1 },
  userBadge:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  companyName:      { fontSize: 13, color: Colors.text, fontWeight: '500' },
  avatar:           { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E3DC', justifyContent: 'center', alignItems: 'center' },

  // Bottom bar
  bottomBar:        { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: Colors.border, paddingBottom: 18, paddingTop: 8, paddingHorizontal: 6 },
  bottomTab:        { flex: 1, alignItems: 'center', gap: 3 },
  tabIconWrap:      { width: 38, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  tabIconWrapActive:{ backgroundColor: Colors.primary + '18' },
  bottomTabLabel:   { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  bottomTabLabelActive: { color: Colors.primary, fontWeight: '700' },

  // Menu drawer
  menuOverlay:      { flex: 1 },
  menuSheet:        { flex: 1, backgroundColor: '#fff' },
  menuSheetHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.sidebar },
  menuLogoBox:      { width: 30, height: 30, backgroundColor: Colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuSheetTitle:   { fontSize: 15, fontWeight: '700', color: '#fff' },
  menuScrollContent:{ paddingHorizontal: 18, paddingBottom: 40 },
  menuModule:       { marginTop: 22 },
  menuModuleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  menuModuleTitle:  { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  menuModuleLine:   { flex: 1, height: 1, backgroundColor: Colors.border },
  menuGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuGridItem:     { width: '30%', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 6, borderWidth: 1, borderColor: Colors.border },
  menuGridItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  menuGridIcon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  menuGridIconActive: { backgroundColor: Colors.primary },
  menuGridLabel:    { fontSize: 11, color: Colors.text, fontWeight: '500', textAlign: 'center' },
  menuGridLabelActive: { color: Colors.primary, fontWeight: '700' },
});