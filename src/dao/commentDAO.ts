import { MovieCommentsRow, MovieCommentsInsert, MovieCommentsUpdate } from "../types/database.js";
import { supabaseGeneric as supabase } from "../lib/supabaseClient.js";
import { BaseDAO } from "./baseDAO.js";
import { QueryFilters, Paginated } from "./baseDAO.js";

export class CommentDAO extends BaseDAO<MovieCommentsRow, MovieCommentsInsert, MovieCommentsUpdate> {
    constructor() {
        super('movieComments');
    }

    async listByMovieId(movieId: number, params?: {
        filters?: QueryFilters<MovieCommentsRow>;
        limit?: number;
        offset?: number;
        page?: number;
        orderBy?: { column: keyof MovieCommentsRow; ascending?: boolean };
    }): Promise<Paginated<{ users: { name: string; lastName: string }[], comment: string; createdAt: string }>> {
        const { filters = {}, limit = 20, offset = 0, page = 1, orderBy } = params ?? {};

        let query = supabase.from(this.table).select('users(name, lastName), comment, createdAt', { count: 'exact' })
            .eq('movieId', movieId);
        
        // filtros simples igualdad
        for (const [k, v] of Object.entries(filters)) {
            // @ts-ignore - simplificado para igualdad
            query = query.eq(k as keyof MovieCommentsRow, v);
        }

        if (orderBy) {
            query = query.order(orderBy.column as string, {
                ascending: orderBy.ascending ?? true,
            });
        }

        query = query.range((page - 1) * limit, page * limit - 1);

        const { data, error, count } = await query;
        if (error) throw new Error(`[${this.table}] listByMovieId: ${error.message}`);

        return { data: data ?? [], count: count ?? 0 };
    }


    async create(comment: MovieCommentsInsert): Promise<MovieCommentsRow> {
        const commentCreated = await super.create(comment);
        return commentCreated;
    }

    async deleteByComposite(userId: number, movieId: number): Promise<boolean> {
        const commentDeleted = await super.deleteByComposite(userId, movieId);
        return commentDeleted;
    }
}

export const commentDAO = new CommentDAO();
