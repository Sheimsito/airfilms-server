import { BaseDAO } from './baseDAO';
import type { UserRow, UserInsert, UserUpdate } from '../types/database';

/**
 * User Data Access Object
 * Handles all database operations for users table
 */
export class UserDAO extends BaseDAO<UserRow, UserInsert, UserUpdate> {
  constructor() {
    super('users');
  }

  /**
   * Find a user by email
   * @param email - User email address
   * @returns User data or null if not found
   */
  async findByEmail(email: string): Promise<UserRow | null> {
    // TODO: Implement findByEmail method
    // const { data, error } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('email', email)
    //   .single();
    // return data;
    return null;
  }
}

export const userDAO = new UserDAO();

