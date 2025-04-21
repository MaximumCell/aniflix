import axios from 'axios';
import { ENV_VARS } from '../config/envVars.js';

export const getMovieDetails = async (url) => {
    const options = {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + ENV_VARS.TMDB_API_KEY,
        }
      };
      const res = await axios.get(url, options)
      if (res.status !== 200) {
        throw new Error('Failed to fetch movie details '+res.statusText);
      }
      return res.data;
}