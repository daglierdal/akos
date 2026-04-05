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
      boq_categories: {
        Row: {
          id: string;
          tenant_id: string;
          discipline_id: string;
          name: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          discipline_id: string;
          name?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          discipline_id?: string;
          name?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boq_categories_discipline_id_fkey";
            columns: ["discipline_id"];
            isOneToOne: false;
            referencedRelation: "boq_disciplines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boq_categories_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      boq_disciplines: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          name: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          name?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          name?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boq_disciplines_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boq_disciplines_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      boq_import_rows: {
        Row: {
          id: string;
          tenant_id: string;
          import_job_id: string;
          row_data: Json | null;
          validation_status: string | null;
          validation_message: string | null;
          mapped_boq_item_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          import_job_id: string;
          row_data?: Json | null;
          validation_status?: string | null;
          validation_message?: string | null;
          mapped_boq_item_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          import_job_id?: string;
          row_data?: Json | null;
          validation_status?: string | null;
          validation_message?: string | null;
          mapped_boq_item_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boq_import_rows_import_job_id_fkey";
            columns: ["import_job_id"];
            isOneToOne: false;
            referencedRelation: "import_jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boq_import_rows_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      boq_items: {
        Row: {
          id: string;
          tenant_id: string;
          subcategory_id: string;
          poz_no: string | null;
          is_tanimi: string | null;
          aciklama: string | null;
          birim: string | null;
          miktar: number | null;
          malzeme_bf: number | null;
          iscilik_bf: number | null;
          toplam_bf: number | null;
          tutar: number | null;
          tedarik_tipi: string | null;
          proje_marka: string | null;
          yuklenici_marka: string | null;
          urun_kodu: string | null;
          source_document_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          subcategory_id: string;
          poz_no?: string | null;
          is_tanimi?: string | null;
          aciklama?: string | null;
          birim?: string | null;
          miktar?: number | null;
          malzeme_bf?: number | null;
          iscilik_bf?: number | null;
          toplam_bf?: never;
          tutar?: never;
          tedarik_tipi?: string | null;
          proje_marka?: string | null;
          yuklenici_marka?: string | null;
          urun_kodu?: string | null;
          source_document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          subcategory_id?: string;
          poz_no?: string | null;
          is_tanimi?: string | null;
          aciklama?: string | null;
          birim?: string | null;
          miktar?: number | null;
          malzeme_bf?: number | null;
          iscilik_bf?: number | null;
          toplam_bf?: never;
          tutar?: never;
          tedarik_tipi?: string | null;
          proje_marka?: string | null;
          yuklenici_marka?: string | null;
          urun_kodu?: string | null;
          source_document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boq_items_subcategory_id_fkey";
            columns: ["subcategory_id"];
            isOneToOne: false;
            referencedRelation: "boq_subcategories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boq_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      boq_subcategories: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string;
          name: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id: string;
          name?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string;
          name?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boq_subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "boq_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boq_subcategories_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          tenant_id: string;
          session_id: string;
          role: "assistant" | "system" | "user";
          content: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          session_id: string;
          role: "assistant" | "system" | "user";
          content: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          role?: "assistant" | "system" | "user";
          content?: string;
          metadata?: Json | null;
          created_at?: string;
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
          {
            foreignKeyName: "fk_chat_messages_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
          persist_error_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          user_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
          persist_error_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          user_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
          persist_error_at?: string | null;
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
          {
            foreignKeyName: "fk_chat_sessions_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          tax_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          tax_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          tax_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_customers_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      document_annotations: {
        Row: {
          id: string;
          tenant_id: string;
          document_id: string;
          page_no: number | null;
          annotation_type: string | null;
          payload: Json | null;
          boq_item_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          document_id: string;
          page_no?: number | null;
          annotation_type?: string | null;
          payload?: Json | null;
          boq_item_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          document_id?: string;
          page_no?: number | null;
          annotation_type?: string | null;
          payload?: Json | null;
          boq_item_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_annotations_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_annotations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      document_processing_jobs: {
        Row: {
          id: string;
          tenant_id: string;
          document_id: string;
          job_type: string;
          status: string;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          document_id: string;
          job_type: string;
          status?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          document_id?: string;
          job_type?: string;
          status?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_processing_jobs_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_processing_jobs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      document_versions: {
        Row: {
          id: string;
          tenant_id: string;
          document_id: string;
          version_no: number;
          storage_path: string | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          document_id: string;
          version_no: number;
          storage_path?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          document_id?: string;
          version_no?: number;
          storage_path?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_versions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          proposal_id: string | null;
          title: string | null;
          category: string | null;
          storage_type: string | null;
          storage_path: string | null;
          original_filename: string | null;
          standard_filename: string | null;
          mime_type: string | null;
          file_size: number | null;
          parsed_text: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          proposal_id?: string | null;
          title?: string | null;
          category?: string | null;
          storage_type?: string | null;
          storage_path?: string | null;
          original_filename?: string | null;
          standard_filename?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          parsed_text?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          proposal_id?: string | null;
          title?: string | null;
          category?: string | null;
          storage_type?: string | null;
          storage_path?: string | null;
          original_filename?: string | null;
          standard_filename?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          parsed_text?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      drive_files: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          proposal_id: string | null;
          file_role: string | null;
          document_type: string | null;
          discipline: string | null;
          revision_label: string | null;
          drive_file_id: string;
          drive_parent_id: string | null;
          mime_type: string | null;
          web_view_link: string | null;
          size_bytes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          proposal_id?: string | null;
          file_role?: string | null;
          document_type?: string | null;
          discipline?: string | null;
          revision_label?: string | null;
          drive_file_id: string;
          drive_parent_id?: string | null;
          mime_type?: string | null;
          web_view_link?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          proposal_id?: string | null;
          file_role?: string | null;
          document_type?: string | null;
          discipline?: string | null;
          revision_label?: string | null;
          drive_file_id?: string;
          drive_parent_id?: string | null;
          mime_type?: string | null;
          web_view_link?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drive_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drive_files_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drive_files_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      import_jobs: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          file_name: string | null;
          status: string;
          row_count: number | null;
          error_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          file_name?: string | null;
          status?: string;
          row_count?: number | null;
          error_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          file_name?: string | null;
          status?: string;
          row_count?: number | null;
          error_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "import_jobs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "import_jobs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      price_lists: {
        Row: {
          id: string;
          tenant_id: string;
          supplier_name: string | null;
          list_date: string | null;
          source_type: string | null;
          document_id: string | null;
          currency: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          supplier_name?: string | null;
          list_date?: string | null;
          source_type?: string | null;
          document_id?: string | null;
          currency?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          supplier_name?: string | null;
          list_date?: string | null;
          source_type?: string | null;
          document_id?: string | null;
          currency?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_lists_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      price_records: {
        Row: {
          id: string;
          tenant_id: string;
          item_name: string | null;
          item_category: string | null;
          discipline: string | null;
          price_type: string | null;
          unit: string | null;
          unit_price: number | null;
          currency: string;
          source_type: string | null;
          source_name: string | null;
          source_date: string | null;
          city: string | null;
          supplier_name: string | null;
          project_id: string | null;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          item_name?: string | null;
          item_category?: string | null;
          discipline?: string | null;
          price_type?: string | null;
          unit?: string | null;
          unit_price?: number | null;
          currency?: string;
          source_type?: string | null;
          source_name?: string | null;
          source_date?: string | null;
          city?: string | null;
          supplier_name?: string | null;
          project_id?: string | null;
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          item_name?: string | null;
          item_category?: string | null;
          discipline?: string | null;
          price_type?: string | null;
          unit?: string | null;
          unit_price?: number | null;
          currency?: string;
          source_type?: string | null;
          source_name?: string | null;
          source_date?: string | null;
          city?: string | null;
          supplier_name?: string | null;
          project_id?: string | null;
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_records_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      progress_payments: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          payment_no: number;
          period_start: string;
          period_end: string;
          status: string;
          gross_amount: number;
          deductions: number;
          net_amount: number | null;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          payment_no: number;
          period_start: string;
          period_end: string;
          status?: string;
          gross_amount?: number;
          deductions?: number;
          net_amount?: never;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          payment_no?: number;
          period_start?: string;
          period_end?: string;
          status?: string;
          gross_amount?: number;
          deductions?: number;
          net_amount?: never;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_progress_payments_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "progress_payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_projects_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      proposal_boq_items: {
        Row: {
          id: string;
          tenant_id: string;
          proposal_id: string;
          revision_no: number;
          boq_item_id: string;
          quantity: number | null;
          malzeme_bf: number | null;
          iscilik_bf: number | null;
          is_excluded: boolean;
          discount_type: string | null;
          discount_value: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          proposal_id: string;
          revision_no: number;
          boq_item_id: string;
          quantity?: number | null;
          malzeme_bf?: number | null;
          iscilik_bf?: number | null;
          is_excluded?: boolean;
          discount_type?: string | null;
          discount_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          proposal_id?: string;
          revision_no?: number;
          boq_item_id?: string;
          quantity?: number | null;
          malzeme_bf?: number | null;
          iscilik_bf?: number | null;
          is_excluded?: boolean;
          discount_type?: string | null;
          discount_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proposal_boq_items_boq_item_id_fkey";
            columns: ["boq_item_id"];
            isOneToOne: false;
            referencedRelation: "boq_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposal_boq_items_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposal_boq_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      proposals: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          revision_no: number;
          revision_code: string;
          status: string;
          drive_revision_folder_id: string | null;
          margin_percent: number | null;
          discount_type: string | null;
          discount_value: number | null;
          total_cost: number | null;
          total_price: number | null;
          total_vat: number | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          revision_no?: number;
          revision_code?: string;
          status?: string;
          drive_revision_folder_id?: string | null;
          margin_percent?: number | null;
          discount_type?: string | null;
          discount_value?: number | null;
          total_cost?: number | null;
          total_price?: number | null;
          total_vat?: number | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          revision_no?: number;
          revision_code?: string;
          status?: string;
          drive_revision_folder_id?: string | null;
          margin_percent?: number | null;
          discount_type?: string | null;
          discount_value?: number | null;
          total_cost?: number | null;
          total_price?: number | null;
          total_vat?: number | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_orders: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          po_no: string;
          supplier: string;
          status: string;
          total_amount: number;
          currency: string;
          order_date: string | null;
          delivery_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          po_no: string;
          supplier: string;
          status?: string;
          total_amount?: number;
          currency?: string;
          order_date?: string | null;
          delivery_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          po_no?: string;
          supplier?: string;
          status?: string;
          total_amount?: number;
          currency?: string;
          order_date?: string | null;
          delivery_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_purchase_orders_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      site_reports: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          report_date: string;
          weather: string | null;
          workforce_count: number | null;
          summary: string | null;
          issues: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          report_date: string;
          weather?: string | null;
          workforce_count?: number | null;
          summary?: string | null;
          issues?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          report_date?: string;
          weather?: string | null;
          workforce_count?: number | null;
          summary?: string | null;
          issues?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_site_reports_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_reports_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_reports_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      subcontracts: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          contract_no: string;
          subcontractor: string;
          scope: string | null;
          status: string;
          total_amount: number;
          currency: string;
          start_date: string | null;
          end_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          contract_no: string;
          subcontractor: string;
          scope?: string | null;
          status?: string;
          total_amount?: number;
          currency?: string;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          contract_no?: string;
          subcontractor?: string;
          scope?: string | null;
          status?: string;
          total_amount?: number;
          currency?: string;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_subcontracts_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subcontracts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_memberships: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json | null;
          created_at: string;
          updated_at: string;
          project_code_prefix: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          project_code_prefix?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          project_code_prefix?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          full_name: string | null;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_users_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_documents_full_text: {
        Args: {
          p_project_id?: string | null;
          p_query: string;
        };
        Returns: {
          id: string;
          title: string | null;
          project_id: string | null;
          original_filename: string | null;
          mime_type: string | null;
          created_at: string;
          rank: number;
          snippet: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
