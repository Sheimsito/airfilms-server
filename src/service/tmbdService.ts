import config from '../config/config.js';


/**
 * @async
 * @function getPopularMoviesFromTMDB
 * @returns {Promise<Object>} Popular movies data from TMDB API.
 * @throws {Error} Throws an error if the HTTP response is not OK.
 */

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = config.apiKeyTmdb;

/**
 * @async
 * @function getPopularMoviesFromTMDB
 * @returns {Promise<Object>} Popular movies data from TMDB API.
 * @throws {Error} Throws an error if the HTTP response is not OK.
 */
export async function getPopularMoviesFromTMDB(page: number) {
  const url = `${BASE_URL}/movie/popular?page=${page}&language=es-MX`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`TMDB Error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data; 
}

/**
 * @async
 * @function getMovieDetailsFromTMDB
 * @returns {Promise<Object>} Movie details data from TMDB API.
 * @throws {Error} Throws an error if the HTTP response is not OK.
 */
export async function getMovieDetailsFromTMDB(movieId: number) {
  const url = `${BASE_URL}/movie/${movieId}?language=es-MX`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`TMDB Error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data; 
}

/**
 * @async
 * @function searchMoviesFromTMDB
 * @returns {Promise<Object>} Search movies data from TMDB API.
 * @throws {Error} Throws an error if the HTTP response is not OK.
 */
export async function searchMoviesFromTMDB(name: string) {
  const url = `${BASE_URL}/search/movie?query=${name}&language=es-MX`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`TMDB Error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data; 
}