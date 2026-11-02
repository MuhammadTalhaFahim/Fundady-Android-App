import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getContinueWatching, removeProgress } from '../utils/watchProgress';

/**
 * Continue Watching list from local storage. Reloads every time the screen gains focus,
 * so coming back from the player shows the fresh position immediately.
 */
export const useContinueWatching = () => {
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    try {
      const data = await getContinueWatching();
      setItems(data);
    } catch (e) {
      console.error('Failed to load Continue Watching data:', e);
      setItems([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const remove = useCallback(
    async key => {
      await removeProgress(key);
      await reload();
    },
    [reload],
  );

  return { items, remove, reload };
};
