// This is the type for the database for maintaining the consistency of the data
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          lastName: string;
          age: number;
          email: string;
          password: string;
          resetPasswordJti: string;
          isDeleted: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: {
          name: string;
          lastName: string;
          age: number;
          email: string;
          password: string;
        };
        Update: {
          name?: string;
          lastName?: string;
          age?: number;
          email?: string;
          password?: string;
          resetPasswordJti?: string;
          isDeleted?: boolean;
        };
      };

      moviesFav: {  
        Row: {
          userId: string;
          movieId: number;
          movieName: string;
          posterURL: string;
          createdAt: Date;
          updatedAt: Date;
          isDeleted: boolean;
        };
        Insert: {
          userId: string;
          movieId: number;
          movieName: string;
          posterURL: string;
        };
        Update: {
          userId?: string;
          movieId?: number;
          movieName?: string;
          posterURL?: string;
          isDeleted?: boolean;
        };
      };
    };
  };
}

// Helper types for easy access (extracted from Database schema)
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type MovieFavRow = Database['public']['Tables']['moviesFav']['Row'];
export type MovieFavInsert = Database['public']['Tables']['moviesFav']['Insert'];
export type MovieFavUpdate = Database['public']['Tables']['moviesFav']['Update'];


