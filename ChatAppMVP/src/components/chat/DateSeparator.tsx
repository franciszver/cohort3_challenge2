// Date Separator Component - shows date labels between message groups
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { getDateLabel } from '../../utils';

interface DateSeparatorProps {
  date: string;
  style?: any;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ 
  date,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {getDateLabel(date)}
        </Text>
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
  },
  labelContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DateSeparator;

