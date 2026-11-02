import BootSplash from "react-native-bootsplash";
import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    useWindowDimensions,
    StatusBar,
    Platform,
    Image
} from 'react-native';
import { colors } from '../../theme/colors';


const SplashScreen = ({ onFinish }) => {
    const { width } = useWindowDimensions();
    
    // Calculate responsive sizes
    const isTabletOrTV = width >= 768;
    const logoWidth = isTabletOrTV ? 300 : width * 0.5;
    const logoHeight = logoWidth * 0.8; // Approximate aspect ratio


    // Animations
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const nameLogoScale = useRef(new Animated.Value(0.5)).current;
    const nameLogoOpacity = useRef(new Animated.Value(0)).current;
    const mainScale = useRef(new Animated.Value(1)).current;
    const mainOpacity = useRef(new Animated.Value(1)).current;

    // Removed letter animation definitions (no longer needed)

    useEffect(() => {
        // 1. Hide the native screen instantly (fade: false makes it a seamless cut)
    BootSplash.hide({ fade: false });
    
        // 1. Animate Logo In
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // 2. Animate Name Logo In
          Animated.parallel([
            Animated.spring(nameLogoScale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(nameLogoOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // 3. Wait, then animate out main container
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(mainScale, {
                  toValue: 1.2,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(mainOpacity, {
                  toValue: 0,
                  duration: 600,
                  delay: 200,
                  useNativeDriver: true,
                })
              ]).start(() => {
                if (onFinish) onFinish();
              });
            }, 1200);
          });
        });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.black} />
            
            <Animated.View style={[
                styles.contentContainer,
                {
                    opacity: mainOpacity,
                    transform: [{ scale: mainScale }]
                }
            ]}>
                {/* Logo */}
                <Animated.View style={{
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                    alignItems: 'center',
                    marginBottom: 15,
                }}>
                    <Image 
                        source={require('../../assets/images/logo1-wbg.png')}
                        style={{ width: logoWidth, height: logoHeight }}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Name Logo below main logo */}
                <Animated.Image
                    source={require('../../assets/images/name-logo.png')}
                    style={{
                        width: logoWidth * 1.2,
                        height: logoHeight * 0.4,
                        opacity: nameLogoOpacity,
                        transform: [{ scale: nameLogoScale }],
                    }}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Subtle glow effect behind the logo */}
            <View style={styles.glow} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: colors.primary,
        opacity: 0.08,
        zIndex: -1,
    }
});

export default SplashScreen;
