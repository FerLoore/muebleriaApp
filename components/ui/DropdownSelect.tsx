import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

export interface DropdownOption {
  label: string;
  value: number;
}

type Props = {
  label:        string;
  value:        number | null;
  onChange:     (value: number | null) => void;
  options:      DropdownOption[];
  loading?:     boolean;
  placeholder?: string;
  error?:       string;
  flex?:        boolean;
};

export default function DropdownSelect({
  label, value, onChange, options, loading, placeholder = 'Seleccionar...', error, flex,
}: Props) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');

  const selected = options.find(o => o.value === value);

  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (opt: DropdownOption) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
    setSearch('');
  };

  return (
    <View style={[s.wrapper, flex && { flex: 1 }]}>
      {/* Label */}
      <Text style={s.label}>{label}</Text>

      {/* Trigger button */}
      <TouchableOpacity
        style={[s.trigger, open && s.triggerOpen, !!error && s.triggerError]}
        onPress={() => { setOpen(o => !o); setSearch(''); }}
        activeOpacity={0.75}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 4 }} />
        ) : (
          <Text style={[s.triggerText, !selected && s.placeholder]} numberOfLines={1}>
            {selected ? selected.label : placeholder}
          </Text>
        )}
        <View style={s.icons}>
          {selected && !open && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome5 name="times-circle" size={12} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          <FontAwesome5
            name={open ? 'chevron-up' : 'chevron-down'}
            size={11}
            color={open ? Colors.primary : Colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {!!error && <Text style={s.errorText}>{error}</Text>}

      {/* Inline dropdown list */}
      {open && (
        <View style={s.dropdown}>
          {/* Search box */}
          <View style={s.searchRow}>
            <FontAwesome5 name="search" size={11} color={Colors.textMuted} />
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
                <FontAwesome5 name="times" size={11} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Options list — scrollable, max 5 items */}
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>Sin resultados</Text>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 200 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {filtered.map(opt => {
                const isSelected = opt.value === value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.option, isSelected && s.optionActive]}
                    onPress={() => handleSelect(opt)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[s.optionText, isSelected && s.optionTextActive]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <FontAwesome5 name="check" size={11} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:          { marginBottom: 14 },
  label:            { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },

  trigger:          {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, minHeight: 42,
  },
  triggerOpen:      { borderColor: Colors.primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  triggerError:     { borderColor: '#DC2626' },
  triggerText:      { fontSize: 13, color: Colors.text, flex: 1 },
  placeholder:      { color: Colors.textMuted },
  icons:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  errorText:        { fontSize: 11, color: '#DC2626', marginTop: 3 },

  dropdown:         {
    borderWidth: 1, borderColor: Colors.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    // subtle shadow
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 4,
    zIndex: 999,
  },
  searchRow:        {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
  },
  searchInput:      { flex: 1, fontSize: 12, color: Colors.text, padding: 0 },
  empty:            { padding: 16, alignItems: 'center' },
  emptyText:        { fontSize: 12, color: Colors.textMuted },
  option:           {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderColor: Colors.border,
  },
  optionActive:     { backgroundColor: Colors.primary + '12' },
  optionText:       { fontSize: 13, color: Colors.text, flex: 1 },
  optionTextActive: { color: Colors.primary, fontWeight: '600' },
});
