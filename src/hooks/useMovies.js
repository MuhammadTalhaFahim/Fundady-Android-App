import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';

export const useMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTrending = async () => {
        setLoading(true);
        try {
            const data = await movieService.getTrendingMovies();
            setMovies(data.results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return { movies, loading, fetchTrending };
};
