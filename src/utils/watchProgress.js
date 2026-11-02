import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'fundady_watch_progress';

// Below this fraction watched, we don't bother saving.
const MIN_PROGRESS = 0;
// With this many seconds (or fewer) left, the video counts as finished.
const COMPLETE_REMAINING_SECONDS = 10;
const MAX_ENTRIES = 20;

// Non-movie, non-series content. 'sports' / 'video' / 'music' are the notification item types.
const SPORTS_TYPES = ['cricket', 'wwe', 'ufc', 'aew', 'football', 'sports', 'video', 'music'];
const SERIES_TYPES = ['web_series', 'tv_show', 'tv_serial'];

// Only the episode fields the player actually reads — keeps the stored value small.
const trimEpisode = ep => ({
  season: ep.season,
  episode: ep.episode,
  tvShow_link: ep.tvShow_link,
  movie_link: ep.movie_link,
  videoUrl: ep.videoUrl,
  dual_link: ep.dual_link,
  dualaudio_link: ep.dualaudio_link,
  dualaudioUrl: ep.dualaudioUrl,
});

/**
 * One key per movie / show / sports video. Series are tracked per show
 * (the entry remembers which episode), not per episode.
 */
export const makeProgressKey = ({ contentType, contentId, isSeries, title }) => {
  let type = 'movie';
  if (SPORTS_TYPES.includes(contentType) || SERIES_TYPES.includes(contentType)) {
    type = contentType;
  } else if (isSeries) {
    type = 'series';
  }
  const id =
    contentId !== undefined && contentId !== null && contentId !== ''
      ? String(contentId)
      : `t-${String(title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`;
  return `${type}:${id}`;
};

const readAll = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('[WatchProgress] read failed:', error);
    return {};
  }
};

// Writes go through one queue so a save on unmount can't race with another save.
let writeQueue = Promise.resolve();
const update = mutator => {
  writeQueue = writeQueue
    .then(async () => {
      const all = await readAll();
      const next = mutator(all);
      if (next) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    })
    .catch(error => console.warn('[WatchProgress] write failed:', error));
  return writeQueue;
};

export const getProgress = async key => {
  const all = await readAll();
  return all[key] || null;
};

export const removeProgress = key =>
  update(all => {
    if (!(key in all)) return null;
    delete all[key];
    return all;
  });

/**
 * entry: { position, duration, contentId, contentType, title, posterUrl,
 *          videoUrl, dualaudioUrl, isSeries, episodes, episodeIndex }
 * Saves, or settles the entry if the video is (almost) finished: a series moves on to
 * the next episode, anything else is removed from Continue Watching.
 * Does nothing if too little was watched, so an existing resume point is never overwritten by a ~0 position.
 */
export const saveProgress = (key, entry) => {
  const { position, duration } = entry;
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) {
    return Promise.resolve();
  }
  if (duration - position <= COMPLETE_REMAINING_SECONDS) {
    const episodes = entry.episodes || [];
    const episodeIndex = entry.episodeIndex || 0;
    if (entry.isSeries && episodeIndex < episodes.length - 1) {
      // Left during the last seconds of an episode — resume at the start of the next one
      const next = episodes[episodeIndex + 1];
      return saveNextEpisode(key, {
        ...entry,
        videoUrl: next.tvShow_link || next.movie_link || next.videoUrl,
        dualaudioUrl: next.dual_link || next.dualaudio_link || next.dualaudioUrl,
        episodeIndex: episodeIndex + 1,
      });
    }
    return removeProgress(key);
  }
  const ratio = position / duration;
  if (ratio < MIN_PROGRESS) return Promise.resolve();

  return update(all => {
    all[key] = {
      contentId: entry.contentId,
      contentType: entry.contentType,
      title: entry.title,
      posterUrl: entry.posterUrl,
      videoUrl: entry.videoUrl,
      dualaudioUrl: entry.dualaudioUrl,
      isSeries: !!entry.isSeries,
      episodes: entry.isSeries && entry.episodes ? entry.episodes.map(trimEpisode) : [],
      episodeIndex: entry.episodeIndex || 0,
      position,
      duration,
      updatedAt: Date.now(),
    };

    const keys = Object.keys(all);
    if (keys.length > MAX_ENTRIES) {
      keys
        .sort((a, b) => (all[b].updatedAt || 0) - (all[a].updatedAt || 0))
        .slice(MAX_ENTRIES)
        .forEach(k => delete all[k]);
    }
    return all;
  });
};

/**
 * For series: the previous episode ended and there's a next one, so the "resume point"
 * becomes the start of the next episode. Position 0 bypasses the MIN_PROGRESS check on purpose.
 */
export const saveNextEpisode = (key, entry) =>
  update(all => {
    all[key] = {
      contentId: entry.contentId,
      contentType: entry.contentType,
      title: entry.title,
      posterUrl: entry.posterUrl,
      videoUrl: entry.videoUrl,
      dualaudioUrl: entry.dualaudioUrl,
      isSeries: true,
      episodes: (entry.episodes || []).map(trimEpisode),
      episodeIndex: entry.episodeIndex,
      position: 0,
      duration: 0,
      updatedAt: Date.now(),
    };
    return all;
  });

/** Most recently watched first. Each item includes its storage `key`. */
export const getContinueWatching = async () => {
  const all = await readAll();
  return Object.keys(all)
    .map(key => ({ key, ...all[key] }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};
