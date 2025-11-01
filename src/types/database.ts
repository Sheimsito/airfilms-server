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

      movieAssets: {
        Row: {
          movieId: number;
          videoURL: string;
          subEspURL: string;
          subEngURL: string;
          previewURL: string;
          createdAt: Date;
        };
        Insert: {
          movieId: number;
          videoURL: string;
          subEspURL: string;
          subEngURL: string;
          previewURL: string;
        };
        Update: {
          movieId?: number;
          videoURL?: string;
          subEspURL?: string;
          subEngURL?: string;
          previewURL?: string;
        };
      };

      movieComments: {
        Row: {
          id: string;
          movieId: number;
          userId: string;
          comment: string;
          createdAt: Date;
        };
        Insert: {
          movieId: number;
          userId: string;
          comment: string;
        };
        Update: {
          movieId?: number;
          userId?: string;
          comment?: string;
        };
      };

      movieRatings: {
        Row: {
          movieId: number;
          userId: string;
          rating: number;
          createdAt: Date;
        };
        Insert: {
          movieId: number;
          userId: string;
          rating: number;
        };
        Update: {
          movieId?: number;
          userId?: string;
          rating?: number;
        };
        
      };
    };
  };
}

// Helper types for easy access (extracted from Database schema)

// User
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// MovieFav
export type MovieFavRow = Database['public']['Tables']['moviesFav']['Row'];
export type MovieFavInsert = Database['public']['Tables']['moviesFav']['Insert'];
export type MovieFavUpdate = Database['public']['Tables']['moviesFav']['Update'];

// MovieAssets
export type MovieAssetsRow = Database['public']['Tables']['movieAssets']['Row'];
export type MovieAssetsInsert = Database['public']['Tables']['movieAssets']['Insert'];
export type MovieAssetsUpdate = Database['public']['Tables']['movieAssets']['Update'];

// MovieComments
export type MovieCommentsRow = Database['public']['Tables']['movieComments']['Row'];
export type MovieCommentsInsert = Database['public']['Tables']['movieComments']['Insert'];
export type MovieCommentsUpdate = Database['public']['Tables']['movieComments']['Update'];

// MovieRatings
export type MovieRatingsRow = Database['public']['Tables']['movieRatings']['Row'];
export type MovieRatingsInsert = Database['public']['Tables']['movieRatings']['Insert'];
export type MovieRatingsUpdate = Database['public']['Tables']['movieRatings']['Update'];





