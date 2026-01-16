import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieGridItem from '../../components/common/MovieGridItem';

const API_URL = 'https://fundady.com/api/v1/movies';
const TABS = ['Web Series', 'TV Shows', 'TV Serials'];

const WebSeriesScreen = () => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    }, [activeTab, allData]);

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL);
            const json = await response.json();
            if (json.status) {
                setAllData(json.data);
            }
        } catch (error) {
            console.error('Error fetching series data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        if (!allData.length) return;

        let filtered = [];
        if (activeTab === 'Web Series') {
            filtered = allData.filter(item =>
                item.categories?.toLowerCase().includes('web series') ||
                item.genre?.toLowerCase().includes('web series')
            );
        } else if (activeTab === 'TV Shows') {
            // For now, if no explicit tag, show a subset or specific genre
            filtered = allData.filter(item =>
                item.categories?.toLowerCase().includes('show') ||
                item.genre?.toLowerCase().includes('reality-tv')
            );
            if (filtered.length === 0) filtered = allData.slice(10, 20); // Dummy for variety
        } else {
            // TV Serials
            filtered = allData.filter(item =>
                item.categories?.toLowerCase().includes('serial') ||
                item.genre?.toLowerCase().includes('family')
            );
            if (filtered.length === 0) filtered = allData.slice(20, 30); // Dummy for variety
        }
        setFilteredData(filtered);
    };

    return (
        <View style={styles.container}>
            <MainHeader variant="inner" />

            <View style={styles.tabsContainer}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <AppText
                            variant={activeTab === tab ? 'bold' : 'medium'}
                            size="md"
                            color={activeTab === tab ? colors.textPrimary : colors.textSecondary}
                        >
                            {tab}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={({ item }) => <MovieGridItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AppText color={colors.textSecondary}>No content found for {activeTab}</AppText>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xxl + 50, // Offset for absolute header
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundCard,
    },
    tab: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: colors.primary,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        paddingTop: 100,
        alignItems: 'center',
    },
});

export default WebSeriesScreen;

