import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    Platform,
    StatusBar,
    FlatList,
    Modal,
    Linking,
    PermissionsAndroid,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import { movieService } from '../../services/movieService';
import { TV_SHOWS_POSTER_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const SeriesDetailScreen = ({ route, navigation }) => {
    const { movie } = route.params;
    const [showVideo, setShowVideo] = useState(true);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isInMyList, setIsInMyList] = useState(false);
    const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
    const [currentDownloadLinks, setCurrentDownloadLinks] = useState({ eng: null, hin: null });

    const handlePlayPress = (index = 0) => {
        const ep = movie.links?.[index];
        if (ep) {
            navigation.navigate('VideoPlayer', {
                videoUrl: ep.tvShow_link,
                dualaudioUrl: ep.dual_link,
                movieTitle: movie.title,
                isSeries: true,
                episodes: movie.links,
                initialIndex: index,
                posterUrl: `${TV_SHOWS_POSTER_BASE_URL}${movie.poster}`,
            });
        } else {
            alert('Video link not available');
        }
    };

    const handleDownloadRequest = (eng, hin) => {
        setCurrentDownloadLinks({ eng, hin });
        if (hin && hin !== '') {
            setIsDownloadModalVisible(true);
        } else if (eng) {
            executeDownload(eng);
        } else {
            alert('Download link not available');
        }
    };

    const executeDownload = async (url) => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'Fundady needs access to your storage to download the movie.',
                        buttonPositive: 'OK',
                    }
                );
                
                if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.Version < 33) {
                    alert('Storage Permission Denied');
                    return;
                }
            }

            ReactNativeBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: `${movie.title} - Fundady`,
                    description: 'Downloading episode...',
                    mime: 'video/mp4',
                    mediaScannable: true,
                }
            })
            .fetch('GET', url)
            .then((res) => {
                if (Platform.OS === 'ios') {
                    ReactNativeBlobUtil.ios.previewDocument(res.path());
                }
            })
            .catch((err) => {
                console.error("Download Error", err);
                alert('Download failed to start.');
            });
        } catch (err) {
            console.warn(err);
        }
    };

    const toggleDescription = () => setIsDescriptionExpanded(!isDescriptionExpanded);
    const toggleMyList = () => setIsInMyList(!isInMyList);

    const descriptionText = movie.description || '';
    const shouldShowMore = descriptionText.length > 150;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <View style={styles.headerContainer}>
                <MainHeader variant="inner" />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Media Section */}
                <View style={styles.mediaContainer}>
                    {showVideo ? (
                        <Video
                            source={require('../../assets/videos/intro.mp4')}
                            style={styles.introVideo}
                            resizeMode="cover"
                            muted={false}
                            onEnd={() => setShowVideo(false)}
                            onError={() => setShowVideo(false)}
                        />
                    ) : (
                        <View style={styles.posterWrapper}>
                            <Image
                                source={{ uri: `${TV_SHOWS_POSTER_BASE_URL}${movie.poster}` }}
                                style={styles.poster}
                                resizeMode="cover"
                            />
                            <TouchableOpacity style={styles.playOverlay} onPress={() => handlePlayPress(0)}>
                                <Icon name="play-circle-outline" size={70} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Content Details */}
                <View style={styles.contentContainer}>
                    <AppText variant="bold" size="headingLg" style={styles.movieTitle}>{movie.title}</AppText>
                    
                    <View style={styles.infoRow}>
                        <AppText color={colors.textSecondary} style={styles.infoItem}>
                            {movie.release_date?.split('-')[0] || 'N/A'}
                        </AppText>
                        <View style={styles.ratingBadge}>
                            <AppText color={colors.black} size="xs" variant="bold">IMDb {movie.imdb_rating || 'N/A'}</AppText>
                        </View>
                        <AppText color={colors.textSecondary} style={styles.infoItem}>{movie.tvqualities || 'HD'}</AppText>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <AppText style={styles.description} numberOfLines={isDescriptionExpanded ? undefined : 3}>
                            {descriptionText}
                        </AppText>
                        {shouldShowMore && (
                            <TouchableOpacity onPress={toggleDescription}>
                                <AppText color={colors.white} variant="bold" style={styles.moreButton}>
                                    {isDescriptionExpanded ? 'less' : 'more'}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionItem} onPress={toggleMyList}>
                            <Icon name={isInMyList ? "check" : "add"} size={28} color={colors.white} />
                            <AppText size="xs" color={colors.textSecondary} style={styles.actionLabel}>My List</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <Icon name="thumb-up-off-alt" size={26} color={colors.white} />
                            <AppText size="xs" color={colors.textSecondary} style={styles.actionLabel}>Rate</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <Icon name="share" size={26} color={colors.white} />
                            <AppText size="xs" color={colors.textSecondary} style={styles.actionLabel}>Share</AppText>
                        </TouchableOpacity>
                    </View>

                    {/* Episodes List Section */}
                    <View style={styles.episodesSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.activeIndicator} />
                            <AppText variant="bold" color={colors.white} style={styles.sectionTitle}>Episodes</AppText>
                        </View>

                        {movie.links?.map((item, index) => (
                            <View key={index} style={styles.episodeCard}>
                                <View style={styles.episodeMain}>
                                    <TouchableOpacity style={styles.episodeImageWrapper} onPress={() => handlePlayPress(index)}>
                                        <Image
                                            source={{ uri: `${TV_SHOWS_POSTER_BASE_URL}${movie.poster}` }}
                                            style={styles.episodeThumb}
                                        />
                                        <View style={styles.miniPlayIcon}>
                                            <Icon name="play-arrow" size={24} color={colors.white} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.episodeInfo}>
                                        <AppText variant="bold" color={colors.white}>{item.season}</AppText>
                                        <AppText color={colors.textSecondary} size="sm">{item.episode}</AppText>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.episodeDownloadBtn} 
                                        onPress={() => handleDownloadRequest(item.download_link, item.dual_download_link)}
                                    >
                                        <Icon name="file-download" size={26} color={colors.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Download Modal */}
            <Modal
                visible={isDownloadModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDownloadModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Select Audio</AppText>
                        <TouchableOpacity style={styles.modalOption} onPress={() => { executeDownload(currentDownloadLinks.eng); setIsDownloadModalVisible(false); }}>
                            <AppText color={colors.white}>English (Default)</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => { executeDownload(currentDownloadLinks.hin); setIsDownloadModalVisible(false); }}>
                            <AppText color={colors.white}>Hindi (Dual Audio)</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsDownloadModalVisible(false)}>
                            <AppText variant="bold" color={colors.primary}>CANCEL</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerContainer: {
        backgroundColor: colors.black,
        paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
        paddingBottom: spacing.sm,
    },
    backButton: { padding: 5 },
    scrollView: { flex: 1 },
    mediaContainer: { width: '100%', height: 250, backgroundColor: colors.black },
    introVideo: { width: '100%', height: '100%' },
    posterWrapper: { width: '100%', height: 250, justifyContent: 'center', alignItems: 'center' },
    poster: { ...StyleSheet.absoluteFillObject, opacity: 0.7 },
    playOverlay: { zIndex: 5 },
    contentContainer: { padding: spacing.md },
    movieTitle: { marginBottom: spacing.sm },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    infoItem: { marginRight: spacing.md },
    ratingBadge: { backgroundColor: '#f5c518', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: spacing.md },
    descriptionSection: { marginBottom: spacing.lg },
    description: { color: colors.white, lineHeight: 20 },
    moreButton: { marginTop: 4 },
    actionRow: { flexDirection: 'row', marginBottom: spacing.xl },
    actionItem: { alignItems: 'center', marginRight: 40 },
    actionLabel: { marginTop: 4 },
    episodesSection: { marginTop: spacing.md },
    sectionHeader: { marginBottom: spacing.lg },
    activeIndicator: { height: 4, backgroundColor: colors.primary, width: 80, position: 'absolute', top: -10 },
    sectionTitle: { fontSize: 18 },
    episodeCard: { marginBottom: 20 },
    episodeMain: { flexDirection: 'row', alignItems: 'center' },
    episodeImageWrapper: { width: 120, height: 70, borderRadius: 4, overflow: 'hidden', marginRight: spacing.md },
    episodeThumb: { width: '100%', height: '100%', opacity: 0.8 },
    miniPlayIcon: { position: 'absolute', top: '50%', left: '50%', marginLeft: -12, marginTop: -12 },
    episodeInfo: { flex: 1 },
    episodeDownloadBtn: { padding: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '70%', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 24 },
    modalTitle: { fontSize: 18, marginBottom: 20 },
    modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    modalCancelButton: { alignSelf: 'flex-end', marginTop: 15, padding: 10 },
});

export default SeriesDetailScreen;
