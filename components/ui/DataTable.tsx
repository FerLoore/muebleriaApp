import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

export type ColumnDef<T> = {
  key: string;
  header: string;
  flex?: number;
  width?: number;
  renderCell?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderMobileCard?: (item: T, actions: React.ReactNode) => React.ReactNode;
};

// Icono de ojo SVG
const EyeIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icono de lápiz SVG
const PenIcon = () => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icono de basurero SVG
const TrashIcon = () => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={Colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

function ActionButtons<T>({ item, onEdit, onDelete }: { item: T, onEdit?: (i: T) => void, onDelete?: (i: T) => void }) {
  return (
    <View style={styles.rowActions}>
      {onEdit && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
          <PenIcon />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => onDelete(item)}>
          <TrashIcon />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DataTable<T>({ data, columns, keyExtractor, onEdit, onDelete, renderMobileCard, totalCount }: DataTableProps<T> & { totalCount?: number }) {
  const total = totalCount ?? data.length;
  const showing = data.length;

  if (Layout.isMobile) {
    return (
      <ScrollView style={styles.list}>
        {data.map(item => (
          <View key={keyExtractor(item)}>
            {renderMobileCard ? (
              renderMobileCard(item, <ActionButtons item={item} onEdit={onEdit} onDelete={onDelete} />)
            ) : (
              <View style={styles.card}>
                <View style={styles.cardActions}>
                  <ActionButtons item={item} onEdit={onEdit} onDelete={onDelete} />
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.tableWrapper}>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          {columns.map(col => (
            <Text key={col.key} style={[styles.tableHeaderText, col.flex ? { flex: col.flex } : { width: col.width ?? 100 }]}>
              {col.header}
            </Text>
          ))}
          {(onEdit || onDelete) && (
            <Text style={[styles.tableHeaderText, { width: 120, textAlign: 'center' }]}>Acciones</Text>
          )}
        </View>

        {/* Rows */}
        <ScrollView style={styles.tableBody}>
          {data.map(item => (
            <View key={keyExtractor(item)} style={styles.row}>
              {columns.map(col => (
                <View key={col.key} style={col.flex ? { flex: col.flex } : { width: col.width ?? 100 }}>
                  {col.renderCell ? col.renderCell(item) : (
                    <Text style={styles.rowText}>{(item as any)[col.key]}</Text>
                  )}
                </View>
              ))}
              {(onEdit || onDelete) && (
                <View style={{ width: 120, justifyContent: 'center' }}>
                  <ActionButtons item={item} onEdit={onEdit} onDelete={onDelete} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Footer de paginación */}
        <View style={styles.tableFooter}>
          <Text style={styles.footerText}>Mostrando 1–{showing} de {total} registros</Text>
          <View style={styles.paginationBtns}>
            <TouchableOpacity style={[styles.pageBtn, styles.pageBtnActive]}>
              <Text style={styles.pageBtnActiveText}>1</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  card: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  tableWrapper: {
    flex: 1,
  },
  table: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.rowHover,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderLight,
  },
  tableHeaderText: {
    fontWeight: '500',
    color: '#aaa',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tableBody: { flex: 1 },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: Colors.background,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  rowText: {
    fontSize: 14,
    color: Colors.text,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#F7C1C1',
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.rowHover,
    borderTopWidth: 0.5,
    borderColor: Colors.borderLight,
  },
  footerText: {
    fontSize: 12,
    color: '#aaa',
  },
  paginationBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  pageBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnActive: {
    backgroundColor: Colors.text,
  },
  pageBtnActiveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
