import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';

const { width } = Dimensions.get('window');
const POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';

const MovieDetailScreen = ({ route, navigation }) => {
    const { movie } = route.params;

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <View>
                <Image
                    source={{ uri: `${POSTER_BASE_URL}${movie.poster}` }}
                    style={styles.poster}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Icon name="arrow-back" size={28} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <AppText variant="bold" size="headingLg">{movie.title}</AppText>
                <View style={styles.infoRow}>
                    <AppText color={colors.success} variant="bold">{movie.release_date?.split('-')[0]}</AppText>
                    <AppText color={colors.textMuted} style={styles.badge}>{movie.imdb_rating || 'N/A'}</AppText>
                    <AppText color={colors.textSecondary}>{movie.runtime ? `${movie.runtime} min` : 'N/A'}</AppText>
                </View>

                <AppButton title="Play" style={styles.playButton} textStyle={{ color: colors.black }} />
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    poster: {
        width: width,
        height: 450,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
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
