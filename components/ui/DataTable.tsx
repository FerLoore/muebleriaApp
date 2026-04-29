import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

export type ColumnDef<T> = {
  key: string;
  header: string;
  flex?: number;
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

export default function DataTable<T>({ data, columns, keyExtractor, onEdit, onDelete, renderMobileCard }: DataTableProps<T>) {

  const renderActions = (item: T) => (
    <>
      {onEdit && (
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}>
          <FontAwesome5 name="pen" size={16} color={Colors.info} />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(item)}>
          <FontAwesome5 name="trash" size={16} color={Colors.danger} />
        </TouchableOpacity>
      )}
    </>
  );

  if (Layout.isMobile) {
    return (
      <ScrollView style={styles.list}>
        {data.map(item => (
          <View key={keyExtractor(item)}>
            {renderMobileCard ? (
              renderMobileCard(item, renderActions(item))
            ) : (
              <View style={styles.card}>
                <Text>Please provide renderMobileCard prop</Text>
                <View style={styles.cardActions}>{renderActions(item)}</View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {columns.map(col => (
          <Text key={col.key} style={[styles.tableHeaderText, { flex: col.flex || 1 }]}>
            {col.header}
          </Text>
        ))}
        {(onEdit || onDelete) && (
          <Text style={[styles.tableHeaderText, { width: 100, textAlign: 'center' }]}>Acciones</Text>
        )}
      </View>
      <ScrollView style={styles.tableBody}>
        {data.map(item => (
          <View key={keyExtractor(item)} style={styles.row}>
            {columns.map(col => (
              <View key={col.key} style={{ flex: col.flex || 1 }}>
                {col.renderCell ? col.renderCell(item) : <Text style={styles.rowText}>{(item as any)[col.key]}</Text>}
              </View>
            ))}
            {(onEdit || onDelete) && (
              <View style={[styles.rowActions, { width: 100 }]}>
                {renderActions(item)}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: Layout.borderRadius,
    marginBottom: 10,
    borderWidth: Layout.borderWidth,
    borderColor: Colors.border,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: Layout.borderWidth,
    borderColor: '#eee',
    gap: 15,
  },
  table: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    borderWidth: Layout.borderWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    padding: 15,
    borderBottomWidth: Layout.borderWidth,
    borderColor: Colors.border,
  },
  tableHeaderText: {
    fontWeight: '600',
    color: '#555',
    fontSize: 14,
  },
  tableBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: Layout.borderWidth,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 14,
    color: Colors.text,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconBtn: {
    padding: 5,
  },
});
