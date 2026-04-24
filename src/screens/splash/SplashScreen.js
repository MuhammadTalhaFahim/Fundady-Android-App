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
import AppText from '../../components/common/AppText';


const TEXT = "FUNDADDY";
const LETTERS = TEXT.split("");


const SplashScreen = ({ onFinish }) => {
    const { width } = useWindowDimensions();
    
    // Calculate responsive sizes
    const isTabletOrTV = width >= 768;
    const logoWidth = isTabletOrTV ? 300 : width * 0.5;
    const logoHeight = logoWidth * 0.8; // Approximate aspect ratio
    const textSize = isTabletOrTV ? 60 : width * 0.11;

    // Animations
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const mainScale = useRef(new Animated.Value(1)).current;
    const mainOpacity = useRef(new Animated.Value(1)).current;

    const letterAnimations = useRef(LETTERS.map(() => ({
        translateY: new Animated.Value(30),
        opacity: new Animated.Value(0),
    }))).current;

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
            // 2. Animate Letters In (Wave effect)
            const letterAnims = letterAnimations.map((anim, index) => {
                return Animated.sequence([
                    Animated.delay(index * 70), // Cascade delay
                    Animated.parallel([
                        Animated.timing(anim.opacity, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.spring(anim.translateY, {
                            toValue: 0,
                            friction: 5,
                            useNativeDriver: true,
                        })
                    ])
                ]);
            });

            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                ...letterAnims
            ]).start(() => {
                // 3. Wait, then animate out
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

                {/* Text below logo */}
                <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                    {LETTERS.map((letter, index) => (
                        <Animated.View
                            key={index}
                            style={{
                                opacity: letterAnimations[index].opacity,
                                transform: [{ translateY: letterAnimations[index].translateY }]
                            }}
                        >
                            <AppText
                                style={[styles.logoText, { fontSize: textSize }]}
                                variant="bold"
                            >
                                {letter}
                            </AppText>
                        </Animated.View>
                    ))}
                </Animated.View>
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
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoText: {
        color: colors.primary,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginHorizontal: 1,
        textShadowColor: 'rgba(229, 9, 20, 0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed',
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
