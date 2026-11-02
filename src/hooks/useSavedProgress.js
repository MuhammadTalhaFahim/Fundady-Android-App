import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../utils/watchProgress';

/**
 * Saved watch progress for one movie / show (or null). Reloads whenever the screen
 * regains focus, so returning from the player updates "Play" -> "Resume" right away.
 */
export const useSavedProgress = key => {
  const [saved, setSaved] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getProgress(key).then(entry => {
        if (!cancelled) setSaved(entry);
      });
      return () => {
        cancelled = true;
      };
    }, [key]),
  );

  return saved;
};
