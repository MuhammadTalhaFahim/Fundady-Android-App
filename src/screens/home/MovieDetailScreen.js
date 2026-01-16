import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import MainHeader from '../../components/headers/MainHeader';

const { width } = Dimensions.get('window');
const POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';

const MovieDetailScreen = ({ route, navigation }) => {
    const { movie } = route.params;

    return (
        <View style={styles.container}>
            <MainHeader variant="inner" />
            <ScrollView style={styles.scrollView}>
                <View>
                    <Image
                        source={{ uri: `${POSTER_BASE_URL}${movie.poster}` }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.content}>
                    <AppText variant="bold" size="headingLg">{movie.title}</AppText>
                    <View style={styles.infoRow}>
                        <AppText color={colors.success} variant="bold">{movie.release_date?.split('-')[0]}</AppText>
                        <AppText color={colors.textMuted} style={styles.badge}>{movie.imdb_rating || 'N/A'}</AppText>
                        <AppText color={colors.textSecondary}>{movie.runtime ? `${movie.runtime} min` : 'N/A'}</AppText>
                    </View>

                    <AppButton
                        title="Play"
                        style={styles.playButton}
                        textStyle={{ color: colors.black }}
                        onPress={() => {
                            const videoUrl = movie.links && movie.links.length > 0 ? movie.links[0].movie_link : null;
                            if (videoUrl) {
                                navigation.navigate('VideoPlayer', { videoUrl });
                            } else {
                                alert('Video link not available');
                            }
                        }}
                    />
                    <AppButton title="Download" variant="secondary" style={styles.downloadButton} />

                    <AppText variant="bold" size="md" style={styles.categoryLabel}>
                        Categories: <AppText size="md" color={colors.textSecondary}>{movie.categories}</AppText>
                    </AppText>

                    <AppText style={styles.description}>
                        {movie.description}
                    </AppText>

                    <View style={styles.detailsSection}>
                        <AppText color={colors.textMuted}>Directed by: <AppText color={colors.textSecondary}>{movie.director}</AppText></AppText>
                        <AppText color={colors.textMuted} style={{ marginTop: spacing.xs }}>Starring: <AppText color={colors.textSecondary}>{movie.actors}</AppText></AppText>
                    </View>
                </View>
            </ScrollView >
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    poster: {
        width: width,
        height: 450,
    },
    content: {
        padding: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.sm,
    },
    badge: {
        backgroundColor: colors.backgroundCard,
        paddingHorizontal: spacing.sm,
        marginHorizontal: spacing.md,
        borderRadius: 4,
    },
    playButton: {
        backgroundColor: colors.white,
        marginVertical: spacing.sm,
    },
    downloadButton: {
        marginBottom: spacing.md,
    },
    categoryLabel: {
        marginVertical: spacing.sm,
    },
    description: {
        lineHeight: 22,
        color: colors.textPrimary,
    },
    detailsSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.backgroundCard,
    }
});

export default MovieDetailScreen;
