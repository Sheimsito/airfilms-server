import { BaseDAO } from './baseDAO';
import { supabaseGeneric as supabase } from '../lib/supabaseClient';
import bcrypt from 'bcrypt';
import type { UserRow, UserInsert, UserUpdate } from '../types/database';

/**
 * User Data Access Object
 * Handles all database operations for users table
 */
export class UserDAO extends BaseDAO<UserRow, UserInsert, UserUpdate> {
  constructor() {
    super('users');
  }

  async create(user: UserInsert): Promise<UserRow> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userCreated = await super.create({ ...user, password: hashedPassword });
    return userCreated;
  }

  // This is the create method
  /**
   * Find a user by email
   * @param email - User email address
   * @returns User data or null if not found
   */
  async findByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*') // mejor evitar '*'
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error(`[UserDAO] findByEmail failed for ${email}:`, error.message);
      throw new Error(`[users] findByEmail: ${error.message}`);
    }

    return (data as UserRow | null) ?? null;
  }
}

export const userDAO = new UserDAO();
