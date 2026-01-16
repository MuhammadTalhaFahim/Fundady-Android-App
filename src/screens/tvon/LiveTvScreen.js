import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import ChannelListItem from '../../components/tv/ChannelListItem';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16;

const MOCK_CHANNELS = [
    { id: '1', title: 'ARY News', logo: 'https://cdn.worldvectorlogo.com/logos/ary-news.svg', url: 'https://cdn-gf.fundady.com/DM/dual-m2/Dracula-A-Love-Tale-2025-DualAudio/Dracula-A-Love-Tale-2025-eng.mp4' },
    { id: '2', title: 'PTV Sports', logo: 'https://upload.wikimedia.org/wikipedia/en/3/3d/PTV_Sports_logo.png', url: 'https://cdn-gf.fundady.com/DM/dual-m2/People-We-Meet-On-Vacation-2026-DualAudio/People-We-Meet-On-Vacation-2026-eng.mp4' },
    { id: '3', title: 'Geo Super', logo: null, url: 'https://cdn-gf.fundady.com/DM/dual-m2/The-Internship-2026-DualAudio/The-Internship-2026-eng.mp4' },
    { id: '4', title: 'PTV News', logo: null, url: 'https://cdn-gf.fundady.com/DM/dual-m2/Five-Nights-at-Freddys-Collection-DualAudio/Five-Nights-at-Freddys-2-2025-eng.mp4' },
    { id: '5', title: 'Madani TV', logo: null, url: 'https://cdn-ga.fundady.com/HM/holly-2025/Avatar-Fire-and-Ash-Holly2025/Avatar-Fire-and-Ash-2025.mp4' },
    { id: '6', title: 'ARY Qtv', logo: null, url: 'https://cdn-ga.fundady.com/HM/holly-2025/A-Royal-Christmas-Tail-Holly2025/A-Royal-Christmas-Tail-2025.mp4' },
    { id: '7', title: 'TEN Sports', logo: null, url: 'https://cdn-gf.fundady.com/DM/dual-m2/Merv-2025-DualAudio/Merv-2025-eng.mp4' },
    { id: '8', title: 'GEO News', logo: null, url: 'https://cdn-gf.fundady.com/DM/dual-m2/Champagne-Problems-2025-DualAudio/Champagne-Problems-2025-eng.mp4' },
];

const LiveTvScreen = () => {
    const [selectedChannel, setSelectedChannel] = useState(MOCK_CHANNELS[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredChannels, setFilteredChannels] = useState(MOCK_CHANNELS);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);

    const handleSearch = (text) => {
        setSearchQuery(text);
        const filtered = MOCK_CHANNELS.filter(ch =>
            ch.title.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredChannels(filtered);
    };

    return (
        <View style={styles.container}>
            <MainHeader variant="inner" />

            {/* Video Player Section */}
            <View style={styles.playerContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: selectedChannel.url }}
                    style={styles.video}
                    resizeMode="contain"
                    controls={true}
                    onLoad={() => setLoading(false)}
                    onLoadStart={() => setLoading(true)}
                />
                {loading && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
            </View>

            {/* Selection Header */}
            <View style={styles.selectionHeader}>
                <View style={styles.selectionTitleContainer}>
                    <AppText variant="bold" size="lg">Select Channel</AppText>
                    <Icon name="keyboard-arrow-down" size={24} color={colors.white} />
                </View>

                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Channel"
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            {/* Channel List */}
            <FlatList
                data={filteredChannels}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChannelListItem
                        item={item}
                        isActive={selectedChannel.id === item.id}
                        onPress={() => setSelectedChannel(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    playerContainer: {
        width: '100%',
        height: PLAYER_HEIGHT,
        backgroundColor: colors.black,
        marginTop: spacing.xxl + 40, // Header offset
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    selectionHeader: {
        backgroundColor: colors.backgroundLight,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundCard,
    },
    selectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#991b1b', // Dark red from image
        padding: spacing.md,
        borderRadius: 4,
        marginBottom: spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 4,
        paddingHorizontal: spacing.sm,
        height: 40,
    },
    searchIcon: {
        marginRight: spacing.xs,
    },
    searchInput: {
        flex: 1,
        color: colors.black,
        fontSize: 14,
        padding: 0,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
});

export default LiveTvScreen;

