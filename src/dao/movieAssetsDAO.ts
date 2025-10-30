import { BaseDAO } from "./baseDAO.js";
import { supabaseGeneric as supabase } from "../lib/supabaseClient.js";
import type { MovieAssetsRow, MovieAssetsInsert, MovieAssetsUpdate } from "../types/database.js";


export class MovieAssetsDAO extends BaseDAO<MovieAssetsRow, MovieAssetsInsert, MovieAssetsUpdate> {
    constructor() {
        super('movieAssets');
    }

    async findAssetsByMovieId(movieId: number): Promise<MovieAssetsRow[]> {
        const { data, error } = await supabase
            .from('movieAssets')
            .select('*')
            .eq('movieId', movieId);

        if (error) {
            console.error(`[MovieAssetsDAO] findAssetsByMovieId failed for ${movieId}:`, error.message);
            throw new Error(`[movieAssets] findAssetsByMovieId: ${error.message}`);
        }
        if (!data) {
            return [];
        }
        return data as MovieAssetsRow[];
    }
}

export const movieAssetsDAO = new MovieAssetsDAO();
