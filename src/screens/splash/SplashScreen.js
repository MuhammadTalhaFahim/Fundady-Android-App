import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import AppText from '../../components/common/AppText';

const { width } = Dimensions.get('window');
const TEXT = "FUNDADY";
const LETTERS = TEXT.split("");

const SplashScreen = ({ onFinish }) => {
    // Create animated values for each letter
    const animations = useRef(LETTERS.map(() => ({
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(30),
        letterSpacing: new Animated.Value(20),
    }))).current;

    const logoOpacity = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animation sequence starts from the middle index (3)
        const entranceAnimations = animations.map((anim, index) => {
            const distanceFromMiddle = Math.abs(index - 3);
            const delay = distanceFromMiddle * 120;

            return Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.spring(anim.scale, {
                        toValue: 1,
                        friction: 6,
                        tension: 40,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ]);
        });

        // Start all letter animations
        Animated.parallel(entranceAnimations).start(() => {
            // After letters appear, do a slight "zoom out and fade" transition
            Animated.parallel([
                Animated.timing(logoScale, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 0,
                    duration: 800,
                    delay: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                onFinish && onFinish();
            });
        });
    }, []);

    const getArchedStyle = (index) => {
        // Calculate curve: middle letters are slightly higher or lower
        // To create the Netflix arch (bottom curved), we offset the outer letters downwards
        const midPoint = 3;
        const dist = Math.abs(index - midPoint);
        // Quadratic curve: 0, 1, 4, 9...
        const curveOffset = dist * dist * 1.5;

        return {
            marginTop: curveOffset,
        };
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.black} />
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }]
                    }
                ]}
            >
                {LETTERS.map((letter, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.letterWrapper,
                            getArchedStyle(index),
                            {
                                opacity: animations[index].opacity,
                                transform: [
                                    { scale: animations[index].scale },
                                    { translateY: animations[index].translateY }
                                ],
                            },
                        ]}
                    >
                        <AppText
                            style={styles.logoText}
                            variant="bold"
                        >
                            {letter}
                        </AppText>
                    </Animated.View>
                ))}
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
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    letterWrapper: {
        marginHorizontal: 1,
    },
    logoText: {
        color: colors.primary,
        fontSize: width * 0.14,
        fontWeight: '900',
        textTransform: 'uppercase',
        // Mimicking the condensed look
        transform: [{ scaleX: 0.85 }],
        textShadowColor: 'rgba(229, 9, 20, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed',
    },
    glow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.primary,
        opacity: 0.05,
        zIndex: -1,
    }
});

export default SplashScreen;
