import { getMovieDetailsFromTMDB, getPopularMoviesFromTMDB, searchMoviesFromTMDB } from "../service/tmbdService";
import { getSearchVideo, getVideoById } from "../service/pexelsService";
import { Request, Response, NextFunction } from "express";

interface GetPopularMoviesParams {
    page?: number;
}

/**
 * @description Get popular movies from TMDB
 * 
 * @async 
 * @function getPopularMovies
 * @param req: Request<{} , GetPopularMoviesParams>
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
export async function getPopularMovies(req: Request<{} , GetPopularMoviesParams>, res: Response,next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    if (!Number.isFinite(page) || page < 1) {
        return res.status(400).json({ error: "Invalid 'page' query parameter" });
    }
    const tmdb = await getPopularMoviesFromTMDB(page); 
    const movies = tmdb.results.map((m: any) => ({
      id: m.id,
      title: m.title,
      releaseDate: m.release_date,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
    }));

    return res.json({
      page: tmdb.page,
      total_pages: tmdb.total_pages,
      results: movies
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @description Get movie details with movie id from TMDB
 * 
 * @async 
 * @function getMovieDetails
 * @param req: Request<{ id: string }>
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
export async function getMovieDetails(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const movieId = Number(req.query.id);
    if (!Number.isFinite(movieId) || movieId < 1) {
      return res.status(400).json({ error: "Invalid 'id' route parameter" });
    }
    const tmdb = await getMovieDetailsFromTMDB(movieId);
    const genre: string = tmdb.genres[0].name;
    const video = await getSearchVideo(genre);

    const data = {
      id: tmdb.id,             // Movie ID 
      title: tmdb.title,       // Movie title
      poster: tmdb.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
        : null, // Movie poster url 
      genres: tmdb.genres.map((g: any) => g.name), // Movie genres
      overview: tmdb.overview, // Movie overview
      releaseDate: tmdb.release_date, // Movie release date
      runtime:  tmdb.runtime, // Movie time in minutes
      original_language: (tmdb.original_language).toUpperCase(), // Movie original language
      status: tmdb.status, // Movie status      
      videoId: video[0].id, // Video id
      videoThumbnail: video[0].thumbnail, // Video thumbnail
    };
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * @description Search movies using the name
 * 
 * @async 
 * @function searchMovies
 * @param req: Request<{}, { name: string }>
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
export async function searchMovies(req: Request<{}, { name: string }>, res: Response, next: NextFunction) {
  try {
    const name: string = String(req.query.name);
    if (!name) {
      return res.status(400).json({ error: "Missing 'name' query parameter" });
    }
    const tmdb = await searchMoviesFromTMDB(name);
    const movies = tmdb.results.map((m: any) => ({
      id: m.id,
      title: m.title,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
    }));
    return res.json({
      page: tmdb.page,
      total_pages: tmdb.total_pages,
      results: movies
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @description IMPORTANT: Search video using any genre on the movie to simulate the videos
 * 
 * @async 
 * @function searchVideo
 * @param req: Request<{}, { id: string }>
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
export async function searchVideoById(req: Request<{}, { id: string }>, res: Response, next: NextFunction) {
  try {
    const id: string = String(req.query.id);
    if (!id) {
      return res.status(400).json({ error: "Missing 'id' query parameter" });
    }
    const pexels = await getVideoById(id);
    return res.json(pexels);
  } catch (err) {
    next(err);
  }
}

export default { getPopularMovies, getMovieDetails, searchMovies, searchVideoById };
