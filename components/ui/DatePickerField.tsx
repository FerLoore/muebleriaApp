import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte 'YYYY-MM-DD' → Date (sin desfase de zona horaria) */
function strToDate(value: string): Date {
  if (!value) return new Date();
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Convierte Date → 'YYYY-MM-DD' */
function dateToStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Formato legible para mostrar en el botón, e.g. "lun 13 may 2026" */
function formatDisplay(value: string): string {
  if (!value) return '';
  const date = strToDate(value);
  return date.toLocaleDateString('es-GT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  label: string;
  value: string;           // 'YYYY-MM-DD' o ''
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  flex?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DatePickerField({
  label, value, onChange, error, required, flex, minimumDate, maximumDate,
}: Props) {
  const [show, setShow] = useState(false);
  // Fecha temporal para iOS (confirmamos al pulsar "Listo")
  const [tempDate, setTempDate] = useState<Date>(strToDate(value));

  const currentDate = value ? strToDate(value) : new Date();

  // ── Web: usamos <input type="date"> nativo del navegador ──────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, flex && { flex: 1 }]}>
        <Text style={styles.label}>
          {label}{required && <Text style={styles.req}> *</Text>}
        </Text>
        <View style={[styles.btn, !!error && styles.btnError, { padding: 0, overflow: 'hidden' }]}>
          <FontAwesome5
            name="calendar-alt"
            size={13}
            color={value ? Colors.primary : Colors.textMuted}
            style={{ marginLeft: 12, marginRight: 8 }}
          />
          {/* @ts-ignore: style prop works fine for web input */}
          <input
            type="date"
            value={value || ''}
            min={minimumDate ? dateToStr(minimumDate) : undefined}
            max={maximumDate ? dateToStr(maximumDate) : undefined}
            onChange={(e: any) => onChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              color: value ? Colors.text : Colors.textMuted,
              paddingTop: 11,
              paddingBottom: 11,
              paddingRight: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
            }}
          />
          {!!value && (
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onChange('')}
              style={{ paddingRight: 12 }}
            >
              <FontAwesome5 name="times" size={11} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // Android: el picker lanza onChange directamente al seleccionar
  const handleAndroid = (_: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (selected) onChange(dateToStr(selected));
  };

  // iOS: guardamos en estado temporal; el usuario confirma con "Listo"
  const handleIOS = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const confirmIOS = () => {
    onChange(dateToStr(tempDate));
    setShow(false);
  };

  const openPicker = () => {
    setTempDate(currentDate);
    setShow(true);
  };

  return (
    <View style={[styles.wrap, flex && { flex: 1 }]}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.req}> *</Text>}
      </Text>

      {/* Botón que abre el picker */}
      <TouchableOpacity
        style={[styles.btn, !!error && styles.btnError]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name="calendar-alt"
          size={13}
          color={value ? Colors.primary : Colors.textMuted}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.btnText, !value && styles.placeholder]}>
          {value ? formatDisplay(value) : 'Seleccionar fecha…'}
        </Text>
        {!!value && (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onChange('')}
          >
            <FontAwesome5 name="times" size={11} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* ── Android: picker nativo sin modal extra ── */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="calendar"
          onChange={handleAndroid}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* ── iOS: picker dentro de un modal con botón "Listo" ── */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.sheetCancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{label}</Text>
                <TouchableOpacity onPress={confirmIOS}>
                  <Text style={styles.sheetDone}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleIOS}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={{ width: '100%' }}
                locale="es-GT"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap:        { marginBottom: 14 },
  label:       { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  req:         { color: '#DC2626' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  btnError:    { borderColor: '#DC2626' },
  btnText:     { flex: 1, fontSize: 13, color: Colors.text },
  placeholder: { color: Colors.textMuted },
  errorText:   { fontSize: 11, color: '#DC2626', marginTop: 3 },

  // iOS modal sheet
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sheetTitle:  { fontSize: 15, fontWeight: '600', color: '#111827' },
  sheetCancel: { fontSize: 15, color: '#6B7280' },
  sheetDone:   { fontSize: 15, fontWeight: '700', color: Colors.primary },
});
