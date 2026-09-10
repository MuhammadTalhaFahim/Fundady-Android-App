import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    Linking,
    ActivityIndicator,
    Image,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from '../common/SvgIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../common/AppText';

const LOGO = require('../../assets/images/fundady_logo.png');

const UpdateModal = ({ visible, updateData, onDismiss }) => {
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpdate = async () => {
        if (!updateData?.url) return;
        try {
            setError(null);
            await Linking.openURL(updateData.url);
        } catch (err) {
            console.error('Error opening update URL:', err);
            setError('Could not open update link. Please try again.');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                        <AppText variant="bold" size="xxl" style={styles.title}>New Update Available!</AppText>
                        <AppText color={colors.textSecondary} size="lg">V {updateData?.versionName}</AppText>
                    </View>

                    <View style={styles.content}>
                        {/* <AppText style={styles.message}>
                            {updateData?.message || 'A new version of Fundady is available with new features and improvements.'}
                        </AppText> */}

                        {updateData?.releaseNotes && (
                            <View style={styles.notesContainer}>
                                <AppText variant="bold" size="lg" color={colors.textSecondary}>WHAT'S NEW:</AppText>
                                <AppText size="md" style={styles.notesText}>{updateData.releaseNotes}</AppText>
                            </View>
                        )}
                    </View>

                    {isDownloading ? (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarWrapper}>
                                <View style={[styles.progressBar, { width: `${downloadProgress}%` }]} />
                            </View>
                            <AppText size="md" color={colors.primary} style={styles.progressText}>
                                Downloading... {downloadProgress}%
                            </AppText>
                        </View>
                    ) : (
                        <View style={styles.footer}>
                            {!updateData?.forceUpdate && (
                                <TouchableOpacity style={styles.laterButton} onPress={onDismiss} activeOpacity={0.7}>
                                    <AppText color={colors.textSecondary} size="md" variant="medium" numberOfLines={1}>LATER</AppText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.8}>
                                <AppText variant="bold" color={colors.white} size="md" numberOfLines={1}>UPDATE NOW</AppText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {error && (
                        <AppText color={colors.primary} size="xs" style={styles.errorText}>{error}</AppText>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    container: {
        width: '90%',
        maxWidth: 380,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    logo: {
        width: 170,
        height: 54,
    },
    title: {
        marginTop: spacing.sm,
        marginBottom: 4,
        textAlign: 'center',
    },
    content: {
        marginBottom: spacing.lg,
    },
    message: {
        textAlign: 'center',
        lineHeight: 20,
    },
    notesContainer: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    notesText: {
        marginTop: 4,
        lineHeight: 18,
    },
    progressContainer: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    progressBarWrapper: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        marginTop: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: spacing.xs,
    },
    laterButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    updateButton: {
        flex: 1.2,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    errorText: {
        textAlign: 'center',
        marginTop: spacing.md,
    }
});

export default UpdateModal;
