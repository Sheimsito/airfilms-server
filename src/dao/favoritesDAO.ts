import { BaseDAO } from "./baseDAO.js";
import { supabaseGeneric as supabase } from "../lib/supabaseClient.js";
import type { MovieFavRow, MovieFavInsert, MovieFavUpdate } from "../types/database.js";

export class FavoritesDAO extends BaseDAO<MovieFavRow, MovieFavInsert, MovieFavUpdate> {
    constructor() {
        super('moviesFav');
    }

    async findFavorites(userId: string): Promise<MovieFavRow[]> {
        const { data, error } = await supabase
            .from('moviesFav')
            .select('*')
            .eq('userId', userId);

        if (error) {
            console.error(`[FavoritesDAO] findFavorites failed for ${userId}:`, error.message);
            throw new Error(`[moviesFav] findFavorites: ${error.message}`);
        }

        return data as MovieFavRow[];
    }

    async create(favorite: MovieFavInsert): Promise<MovieFavRow> {
        const favoriteCreated = await super.create(favorite);
        return favoriteCreated;
    }

    async deleteByComposite(userId: string | number, movieId: string | number) {
    const { error, count } = await supabase
      .from('moviesFav')
      // @ts-ignore
      .delete({count: 'exact'})
      .eq('userId', userId)
      .eq('movieId', movieId);
    if (error) throw new Error(`[${this.table}] deleteByComposite: ${error.message}`);
    return count! > 0;
  }

}



export const favoritesDAO = new FavoritesDAO();

