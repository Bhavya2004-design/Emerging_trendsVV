import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLOR_INACTIVE = '#534740';
const COLOR_ACTIVE = '#6f9f8a';

const tabs = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'scan', label: 'Scan', icon: null },
  { key: 'vault', label: 'Vault', icon: null },
  { key: 'community', label: 'Community', icon: null },
  { key: 'profile', label: 'Profile', icon: null },
];

function PersonOutline({ color, headSize, shoulderW, shoulderH }) {
  const r = headSize / 2;
  const topR = shoulderW / 2;
  return (
    <View style={personStyles.column}>
      <View
        style={[
          personStyles.headBase,
          {
            width: headSize,
            height: headSize,
            borderRadius: r,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          personStyles.shouldersBase,
          {
            width: shoulderW,
            height: shoulderH,
            borderTopLeftRadius: topR,
            borderTopRightRadius: topR,
            borderColor: color,
          },
        ]}
      />
    </View>
  );
}

function CommunityOutlineIcon({ color }) {
  return (
    <View style={communityStyles.wrap}>
      <View style={communityStyles.back}>
        <PersonOutline color={color} headSize={5} shoulderW={9} shoulderH={5} />
      </View>
      <View style={communityStyles.front}>
        <PersonOutline color={color} headSize={6} shoulderW={11} shoulderH={6} />
      </View>
    </View>
  );
}

function ProfileOutlineIcon({ color }) {
  return (
    <View style={profileStyles.wrap}>
      <PersonOutline color={color} headSize={7} shoulderW={13} shoulderH={7} />
    </View>
  );
}

function ScanCameraIcon({ color }) {
  return (
    <View style={cameraStyles.wrap}>
      <View style={[cameraStyles.viewfinder, { borderColor: color }]} />
      <View style={[cameraStyles.body, { borderColor: color }]}>
        <View style={[cameraStyles.lens, { borderColor: color }]} />
      </View>
    </View>
  );
}

function VaultClosetIcon({ color }) {
  return (
    <View style={[vaultStyles.frame, { borderColor: color }]}>
      <View style={vaultStyles.doorRow}>
        <View style={vaultStyles.doorHalf}>
          <View style={[vaultStyles.knobDot, { backgroundColor: color }]} />
        </View>
        <View style={[vaultStyles.vSplit, { backgroundColor: color }]} />
        <View style={vaultStyles.doorHalf}>
          <View style={[vaultStyles.knobDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const personStyles = StyleSheet.create({
  column: {
    alignItems: 'center',
  },
  headBase: {
    borderWidth: 1.35,
    backgroundColor: 'transparent',
  },
  shouldersBase: {
    marginTop: -0.5,
    borderWidth: 1.35,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
});

const communityStyles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 22,
    position: 'relative',
  },
  back: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  front: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

const profileStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const cameraStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 8,
    height: 3,
    marginBottom: -0.5,
    borderWidth: 1.35,
    borderBottomWidth: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: 'transparent',
  },
  body: {
    width: 22,
    height: 15,
    borderRadius: 4,
    borderWidth: 1.35,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lens: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.35,
    backgroundColor: 'transparent',
  },
});

const vaultStyles = StyleSheet.create({
  frame: {
    width: 19,
    height: 21,
    borderRadius: 2,
    borderWidth: 1.35,
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  doorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 13,
  },
  doorHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 12,
  },
  vSplit: {
    width: 1.35,
    height: 12,
    borderRadius: 0.5,
  },
  knobDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },
});

function TabIcon({ tab, active }) {
  const color = active ? COLOR_ACTIVE : COLOR_INACTIVE;

  if (tab.key === 'scan') {
    return <ScanCameraIcon color={color} />;
  }
  if (tab.key === 'vault') {
    return <VaultClosetIcon color={color} />;
  }
  if (tab.key === 'community') {
    return <CommunityOutlineIcon color={color} />;
  }
  if (tab.key === 'profile') {
    return <ProfileOutlineIcon color={color} />;
  }

  return <Text style={[styles.glyph, active && styles.glyphActive]}>{tab.icon}</Text>;
}

export default function BottomTabBar({ selectedTab, onNavigate }) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 12) + 10;

  return (
    <View style={[styles.bar, { paddingBottom }]}>
      {tabs.map((tab) => {
        const active = selectedTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onNavigate(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <TabIcon tab={tab} active={active} />
            </View>
            <Text
              style={[
                styles.label,
                { color: active ? COLOR_ACTIVE : COLOR_INACTIVE },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#fbf7f0',
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d9d3c8',
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabPressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: '#e8f2ed',
  },
  glyph: {
    fontSize: 22,
    color: COLOR_INACTIVE,
  },
  glyphActive: {
    color: COLOR_ACTIVE,
  },
  label: {
    fontSize: 10,
    fontFamily: 'serif',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '100%',
  },
});
