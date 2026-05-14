import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

export interface SelectOption {
  label: string;  // texto visible
  value: number;  // ID numérico
}

type Props = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  options: SelectOption[];
  loading?: boolean;
  placeholder?: string;
  error?: string;
};

export default function SelectPicker({ label, value, onChange, options, loading, placeholder = 'Seleccionar...', error }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find(o => o.value === value);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>

      {/* Trigger */}
      <TouchableOpacity
        style={[s.trigger, !!error && s.triggerError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={[s.triggerText, !selected && s.triggerPlaceholder]} numberOfLines={1}>
            {selected ? selected.label : placeholder}
          </Text>
        )}
        <View style={s.triggerIcons}>
          {selected && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5 name="times-circle" size={13} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          <FontAwesome5 name="chevron-down" size={11} color={Colors.textMuted} />
        </View>
      </TouchableOpacity>

      {!!error && <Text style={s.errorText}>{error}</Text>}

      {/* Modal picker */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => { setOpen(false); setSearch(''); }} />
        <View style={s.pickerSheet}>

          {/* Buscador */}
          <View style={s.searchRow}>
            <FontAwesome5 name="search" size={12} color={Colors.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <FontAwesome5 name="times" size={12} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista */}
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>Sin resultados</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => String(item.value)}
              style={{ maxHeight: 280 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[s.option, isSelected && s.optionActive]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.optionText, isSelected && s.optionTextActive]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {isSelected && <FontAwesome5 name="check" size={12} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:         { marginBottom: 14 },
  label:           { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  trigger:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, minHeight: 42 },
  triggerError:    { borderColor: '#DC2626' },
  triggerText:     { fontSize: 13, color: Colors.text, flex: 1 },
  triggerPlaceholder: { color: Colors.textMuted },
  triggerIcons:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  errorText:       { fontSize: 11, color: '#DC2626', marginTop: 3 },
  // Modal
  backdrop:        { ...StyleSheet.absoluteFillObject as any, backgroundColor: 'rgba(0,0,0,0.35)' },
  pickerSheet:     { position: 'absolute', left: 20, right: 20, top: '25%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  searchRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  searchInput:     { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
  empty:           { padding: 24, alignItems: 'center' },
  emptyText:       { fontSize: 13, color: Colors.textMuted },
  option:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderColor: Colors.border },
  optionActive:    { backgroundColor: Colors.primary + '10' },
  optionText:      { fontSize: 13, color: Colors.text, flex: 1 },
  optionTextActive:{ color: Colors.primary, fontWeight: '600' },
});
