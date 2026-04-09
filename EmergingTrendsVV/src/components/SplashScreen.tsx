import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Text,
  View,
} from 'react-native';
import { splashStyles } from './SplashScreen.styles';

type SplashScreenProps = {
  onFinish: () => void;
  durationMs?: number;
  logoSize?: number;
  logoSource?: ImageSourcePropType | null;
};

export default function SplashScreen({
  onFinish,
  durationMs = 4000,
  logoSize = 280,
  logoSource = null,
}: SplashScreenProps) {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    let isMounted = true;
    let animation: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) {
        setReduceMotionEnabled(enabled);
      }
    });

    const reduceMotionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduceMotionEnabled(enabled),
    );

    const runAnimation = () => {
      opacity.setValue(0);
      scale.setValue(reduceMotionEnabled ? 1 : 0.94);

      if (reduceMotionEnabled) {
        animation = Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]);
      } else {
        const fadeInMs = Math.round(durationMs * 0.225); // 900ms for 4s total
        const pulseMs = Math.round(durationMs * 0.425); // 1700ms for 4s total
        const fadeOutMs = durationMs - fadeInMs - pulseMs; // 1400ms for 4s total

        animation = Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: fadeInMs,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.03,
              duration: fadeInMs,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.06,
              duration: Math.round(pulseMs / 2),
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.02,
              duration: Math.round(pulseMs / 2),
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(opacity, {
            toValue: 0,
            duration: fadeOutMs,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]);
      }

      animation.start(({ finished }) => {
        if (finished) {
          onFinish();
        }
      });
    };

    runAnimation();

    return () => {
      isMounted = false;
      animation?.stop();
      reduceMotionSub.remove();
    };
  }, [durationMs, onFinish, opacity, reduceMotionEnabled, scale]);

  return (
    <View style={splashStyles.container}>
      <Animated.View
        style={[
          splashStyles.logoWrap,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {logoSource ? (
          <Image
            source={logoSource}
            style={[splashStyles.logoImage, { width: logoSize, height: logoSize }]}
          />
        ) : (
          <View
            style={[
              splashStyles.placeholderLogo,
              { width: logoSize, height: logoSize },
            ]}
          >
            <Text style={[splashStyles.placeholderText, { fontSize: Math.round(logoSize * 0.26) }]}>
              VV
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
