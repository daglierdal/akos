export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      drive_files: {
        Row: {
          created_at: string;
          external_file_id: string;
          id: string;
          is_folder: boolean;
          metadata: Json;
          mime_type: string;
          name: string;
          parent_external_file_id: string | null;
          path: string;
          project_code: string | null;
          project_name: string | null;
          provider: string;
          tenant_id: string;
          updated_at: string;
          web_view_link: string | null;
        };
        Insert: {
          created_at?: string;
          external_file_id: string;
          id?: string;
          is_folder?: boolean;
          metadata?: Json;
          mime_type: string;
          name: string;
          parent_external_file_id?: string | null;
          path: string;
          project_code?: string | null;
          project_name?: string | null;
          provider?: string;
          tenant_id: string;
          updated_at?: string;
          web_view_link?: string | null;
        };
        Update: {
          created_at?: string;
          external_file_id?: string;
          id?: string;
          is_folder?: boolean;
          metadata?: Json;
          mime_type?: string;
          name?: string;
          parent_external_file_id?: string | null;
          path?: string;
          project_code?: string | null;
          project_name?: string | null;
          provider?: string;
          tenant_id?: string;
          updated_at?: string;
          web_view_link?: string | null;
        };
        Relationships: [];
      };
      external_connections: {
        Row: {
          access_token_encrypted: string;
          created_at: string;
          expires_at: string | null;
          external_user_id: string | null;
          id: string;
          metadata: Json;
          provider: string;
          refresh_token_encrypted: string | null;
          scope: string | null;
          tenant_id: string;
          token_type: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token_encrypted: string;
          created_at?: string;
          expires_at?: string | null;
          external_user_id?: string | null;
          id?: string;
          metadata?: Json;
          provider: string;
          refresh_token_encrypted?: string | null;
          scope?: string | null;
          tenant_id: string;
          token_type?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_token_encrypted?: string;
          created_at?: string;
          expires_at?: string | null;
          external_user_id?: string | null;
          id?: string;
          metadata?: Json;
          provider?: string;
          refresh_token_encrypted?: string | null;
          scope?: string | null;
          tenant_id?: string;
          token_type?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "external_connections_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          role: "assistant" | "system" | "user";
          session_id: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          role: "assistant" | "system" | "user";
          session_id: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          role?: "assistant" | "system" | "user";
          session_id?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          created_at: string;
          id: string;
          persist_error_at: string | null;
          project_id: string | null;
          tenant_id: string;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          persist_error_at?: string | null;
          project_id?: string | null;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          persist_error_at?: string | null;
          project_id?: string | null;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
        };
        Insert: {
          id?: string;
        };
        Update: {
          id?: string;
        };
        Relationships: [];
      };
      tenant_memberships: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          tenant_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: string;
          tenant_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          tenant_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          settings: Json | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          settings?: Json | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          settings?: Json | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id?: string;
          role?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
