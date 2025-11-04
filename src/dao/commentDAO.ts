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
    }): Promise<Paginated<{ id: string, userId: string, users: { name: string; lastName: string }[], comment: string; createdAt: string }>> {
        const { filters = {}, limit = 20, offset = 0, page = 1, orderBy } = params ?? {};

        let query = supabase.from(this.table).select(' id, userId, users(name, lastName), comment, createdAt', { count: 'exact' })
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
    
    async deleteSpecificComentary(userId: string, id: string, movieId: number): Promise<boolean> {
    const { error, count } = await supabase
      .from(this.table)
      // @ts-ignore
      .delete({count: 'exact'})
      .eq('userId', userId)
      .eq('movieId', movieId)
      .eq('id', id);
    if (error) throw new Error(`[${this.table}] delete: ${error.message}`);
    return count! > 0;
    }
}

export const commentDAO = new CommentDAO();
