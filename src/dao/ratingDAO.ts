import { MovieRatingsRow, MovieRatingsInsert, MovieRatingsUpdate } from "../types/database.js";
import { supabaseGeneric as supabase } from "../lib/supabaseClient.js";
import { BaseDAO } from "./baseDAO.js";


/**
 * @class
 * @extends BaseDAO <MovieRatingsRow, MovieRatingsInsert, MovieRatingsUpdate>
 * @description DAO for movie ratings
 */
export class RatingDAO extends BaseDAO<MovieRatingsRow, MovieRatingsInsert, MovieRatingsUpdate> {
    constructor() {
        super('movieRatings');
    }

    async listByMovieId(movieId: string): Promise<{ totalCount: number }> {
        const {  error, count } = await supabase.from(this.table).select('*', { count: 'exact' }).eq('movieId', movieId);
        if (error) throw new Error(`[${this.table}] listByMovieId: ${error.message}`);
        return { totalCount: count ?? 0 };
    }

    async listRatingNumbers(movieId: string): Promise<{ data: number[] }> {
        let data: number[] = [];
        for (let i = 1; i <= 5; i++) {
            const { count, error } = await supabase
                                                .from(this.table)
                                                .select('rating', { count: 'exact', head: true })
                                                .eq('rating', i)
                                                .eq('movieId', movieId);

            if (error) console.error(error);
            else data.push(count ?? 0);
        }
        return { data: data };
    }

    async createRating(rating: MovieRatingsInsert) {
    const { error } = await supabase
        .from(this.table)
        .upsert(
        [
            {
            movieId: rating.movieId,
            userId: rating.userId,
            rating: rating.rating,
            },
        ],
        { onConflict: 'userId,movieId' }
        );

    if (error) throw new Error(`[${this.table}] create: ${error.message}`);
    }


    async deleteByComposite(userId: number, movieId: number): Promise<boolean> {
        const ratingDeleted = await super.deleteByComposite(userId, movieId);
        return ratingDeleted;
    }
}

export const ratingDAO = new RatingDAO();
