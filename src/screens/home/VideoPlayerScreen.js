import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
    const { videoUrl } = route.params;
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        // Lock to landscape on mount
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            // Unlock/Back to portrait on unmount
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
        };
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                resizeMode="contain"
                paused={paused}
                onLoad={() => setLoading(false)}
                onBuffer={({ isBuffering }) => setLoading(isBuffering)}
                controls={true} // Simple controls initially, can be customized later
            />

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {/* Simple Overlay Back Button */}
            {!loading && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Icon name="arrow-back" size={30} color={colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        zIndex: 10,
    },
});

export default VideoPlayerScreen;
