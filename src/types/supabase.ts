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
      artists: {
        Row: {
          country: string | null
          has_avatar: boolean
          id: number
          name: string
        }
        Insert: {
          country?: string | null
          has_avatar?: boolean
          id: number
          name: string
        }
        Update: {
          country?: string | null
          has_avatar?: boolean
          id?: number
          name?: string
        }
        Relationships: []
      }
      artists_releases: {
        Row: {
          artist_id: number
          release_id: number
        }
        Insert: {
          artist_id: number
          release_id: number
        }
        Update: {
          artist_id?: number
          release_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "artists_releases_artist_id_fkey"
            columns: ["artist_id"]
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artists_releases_artist_id_fkey"
            columns: ["artist_id"]
            referencedRelation: "get_featured_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artists_releases_release_id_fkey"
            columns: ["release_id"]
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artists_releases_release_id_fkey"
            columns: ["release_id"]
            referencedRelation: "get_featured_releases"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      groups_releases: {
        Row: {
          group_id: number
          release_id: number
        }
        Insert: {
          group_id?: number
          release_id: number
        }
        Update: {
          group_id?: number
          release_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "groups_releases_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_releases_release_id_fkey"
            columns: ["release_id"]
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_releases_release_id_fkey"
            columns: ["release_id"]
            referencedRelation: "get_featured_releases"
            referencedColumns: ["id"]
          }
        ]
      }
      releases: {
        Row: {
          external_links: Json[] | null
          graphics_type: string | null
          has_screenshot: boolean
          id: number
          name: string
          release_day: string | null
          release_month: string | null
          release_year: string | null
        }
        Insert: {
          external_links?: Json[] | null
          graphics_type?: string | null
          has_screenshot?: boolean
          id: number
          name: string
          release_day?: string | null
          release_month?: string | null
          release_year?: string | null
        }
        Update: {
          external_links?: Json[] | null
          graphics_type?: string | null
          has_screenshot?: boolean
          id?: number
          name?: string
          release_day?: string | null
          release_month?: string | null
          release_year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      get_featured_artists: {
        Row: {
          id: number | null
          name: string | null
          releasescount: number | null
        }
        Relationships: []
      }
      get_featured_releases: {
        Row: {
          artists: unknown | null
          external_links: Json[] | null
          graphics_type: string | null
          has_screenshot: boolean | null
          id: number | null
          name: string | null
          release_day: string | null
          release_month: string | null
          release_year: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
