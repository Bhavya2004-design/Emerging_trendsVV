import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenBackButton from './ScreenBackButton';

/** Min width reserved on the right so title + back align across screens (bell, search, or empty). */
export const APP_SCREEN_HEADER_RIGHT_MIN = 44;

export default function AppScreenHeader({
  onBack,
  title,
  subtitle,
  right = null,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.backSlot}>
        <ScreenBackButton onPress={onBack} />
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightSlot}>
        {right != null ? (
          right
        ) : (
          <View style={styles.rightSpacer} pointerEvents="none" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
    minHeight: 44,
  },
  backSlot: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 27,
    lineHeight: 33,
    color: '#534740',
    fontFamily: 'serif',
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 2,
    color: '#6e6258',
    fontSize: 13,
    fontFamily: 'serif',
  },
  rightSlot: {
    minWidth: APP_SCREEN_HEADER_RIGHT_MIN,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: APP_SCREEN_HEADER_RIGHT_MIN,
    height: 1,
  },
});
