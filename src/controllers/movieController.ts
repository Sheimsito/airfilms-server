import { getMovieDetailsFromTMDB, getPopularMoviesFromTMDB, searchGenreMoviesFromTMDB, searchMoviesFromTMDB } from "../service/tmbdService.js";
import { getSearchVideo, getVideoById } from "../service/pexelsService.js";
import { Request, Response, NextFunction } from "express";
import { movieAssetsDAO } from "../dao/movieAssetsDAO.js";

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
    if (page === undefined || !Number.isFinite(page) || page < 1) {
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
 * @param req: Request<{ id: number }>
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
export async function getMovieDetails(req: Request<{ id: number }>, res: Response, next: NextFunction) {
  try {
    const movieId = Number(req.query.id);
    if (movieId === undefined || !Number.isFinite(movieId) || movieId < 1) {
      return res.status(400).json({ error: "El id no es válido, debe ser un número mayor a 0." });
    }
    const tmdb = await getMovieDetailsFromTMDB(movieId);
    
    let genre: string;
    if( tmdb.genres.length === 0){
      genre = tmdb.name;
    }else{
      genre = tmdb.genres[0].name;
    }
    
    const movieAssets = await movieAssetsDAO.findAssetsByMovieId(movieId);
    let video: any;
    video = await getSearchVideo(genre);

    const movieAssetsData = movieAssets ? movieAssets : [];
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
      ... (movieAssetsData.length > 0 ? { videoId: movieId, videoThumbnail: movieAssetsData[0].previewURL }
         : {videoId: video[0].id, videoThumbnail: video[0].thumbnail})
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
    if (name === undefined) {
      return res.status(400).json({ error: "El parámetro 'name' es obligatorio." });
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
 * @description Search movies using the genre ID
 * 
 * @async 
 * @function searchGenreMovies
 * @param req: Request<{}, { genre: string }>
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
export async function searchGenreMovies(req: Request<{}, { genre: string }>, res: Response, next: NextFunction) {
  try {
    const genre: string = String(req.query.genre);
    if (genre === undefined) {
      return res.status(400).json({ error: "El parámetro 'genre' es obligatorio" });
    }
    const tmdb = await searchGenreMoviesFromTMDB(genre);
    const movies = tmdb.results.map((m: any) => ({
      id: m.id,
      title: m.title,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
    }));
    
    if (movies.length === 0) {
      return res.status(404).json({ error: "No se encontraron películas para el género especificado" });
    }

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
export async function searchVideoById(req: Request<{}, { id: number }>, res: Response, next: NextFunction) {
  try {
    const id: number = Number(req.query.id);
    if (id === undefined || !Number.isFinite(id) || id < 1) {
      return res.status(400).json({ error: "El parámetro 'id' es obligatorio" });
    }
    const movieAssets = await movieAssetsDAO.findAssetsByMovieId(id);
    let pexels: any;
    if (movieAssets.length <= 0) {
       pexels = await getVideoById(id.toString());
       pexels.subtitles = 'null';
       if(pexels?.status === 404){
        return res.status(404).json({ error: "Video no encontrado" });
      }
    }

    const result = {
      id: pexels?.id ?? null,
      width: pexels?.width ?? null,
      height: pexels?.height ?? null,
      duration: pexels?.duration ?? null,
      fullres: pexels?.fullres ?? null,
      tags: pexels?.tags ?? null,
      url: pexels?.url ?? null,
      image: pexels?.image ?? null,
      avg_color: pexels?.avg_color ?? null,
      user: pexels?.user ?? null,
      video_files: pexels?.video_files ??
      [{
        id: id.toString(),
        quality: 'hd',
        file_type: "video/mp4",
        width: '1920',
        height: '1080',
        fps: '',
        link: movieAssets[0].videoURL,
        size: '',
      }],

      subtitles: pexels?.subtitles ?? 
      [{
        id: '1',
        lang: 'es',
        file_type: 'vtt',
        link: movieAssets[0].subEspURL,
      },
      {
        id: '2',
        lang: 'en',
        file_type: 'vtt',
        link: movieAssets[0].subEngURL,
      }],

    }

    return res.json(result);
   
  } catch (err) {
    next(err);
  }
}

export default { getPopularMovies, getMovieDetails, searchMovies, searchGenreMovies, searchVideoById };
