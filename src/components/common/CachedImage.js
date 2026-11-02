import React, { useState, useCallback, useEffect } from 'react';
import FastImage from '@d11/react-native-fast-image';
import { colors } from '../../theme/colors';

const MAX_IMAGE_RETRIES = 2;

// Drop-in replacement for <Image> with disk/memory caching and automatic
// retry, so posters keep loading on slow public connections.
const CachedImage = ({ source, style, resizeMode = 'cover', ...rest }) => {
    const uri = source && source.uri;
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        setAttempt(0);
    }, [uri]);

    const handleError = useCallback(() => {
        if (attempt < MAX_IMAGE_RETRIES) {
            setTimeout(() => setAttempt(a => a + 1), 1500 * (attempt + 1));
        }
    }, [attempt]);

    if (!uri) {
        return <FastImage style={[{ backgroundColor: colors.backgroundCard }, style]} />;
    }

    return (
        <FastImage
            // Changing the key forces a fresh load attempt after an error
            key={`${uri}-${attempt}`}
            {...rest}
            source={{
                uri,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
            }}
            style={[{ backgroundColor: colors.backgroundCard }, style]}
            resizeMode={FastImage.resizeMode[resizeMode] || FastImage.resizeMode.cover}
            onError={handleError}
        />
    );
};

export default CachedImage;
