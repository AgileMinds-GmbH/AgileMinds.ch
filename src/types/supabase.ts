export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          thumbnail_url: string | null
          duration: string
          start_time: string
          end_time: string
          start_date: string
          end_date: string
          price: number
          early_bird_price: number | null
          early_bird_deadline: string | null
          instructor_id: string | null
          spots_available: number
          language: string
          skill_level: string
          status: string
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
          version: number
          is_latest: boolean
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          thumbnail_url?: string | null
          duration: string
          start_time: string
          end_time: string
          start_date: string
          end_date: string
          price: number
          instructor_id?: string | null
          spots_available?: number
          language: string
          skill_level: string
          status?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          version?: number
          is_latest?: boolean
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          thumbnail_url?: string | null
          duration?: string
          start_time?: string
          end_time?: string
          start_date?: string
          end_date?: string
          price?: number
          instructor_id?: string | null
          spots_available?: number
          language?: string
          skill_level?: string
          status?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          version?: number
          is_latest?: boolean
        }
      }
      course_sections: {
        Row: {
          id: string
          course_id: string
          title: string
          content: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          content: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          content?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          auth_user_id: string | null
          name: string
          slug: string
          title: string
          bio: string
          profile_image_url: string | null
          email: string | null
          phone: string | null
          linkedin_url: string | null
          twitter_url: string | null
          github_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          name: string
          slug: string
          title: string
          bio: string
          profile_image_url?: string | null
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          github_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          name?: string
          slug?: string
          title?: string
          bio?: string
          profile_image_url?: string | null
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          github_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      expertise_areas: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      team_member_expertise: {
        Row: {
          team_member_id: string
          expertise_id: string
          created_at: string
        }
        Insert: {
          team_member_id: string
          expertise_id: string
          created_at?: string
        }
        Update: {
          team_member_id?: string
          expertise_id?: string
          created_at?: string
        }
      }
    }
  }
}