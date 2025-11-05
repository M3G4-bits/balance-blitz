export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_transfer_settings: {
        Row: {
          created_at: string
          force_success: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          force_success?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          force_success?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_transactions: {
        Row: {
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string
          description: string
          email: string | null
          id: string
          otp_code: string | null
          otp_expires_at: string | null
          recipient: string
          sort_code: string | null
          transfer_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          description: string
          email?: string | null
          id?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          recipient: string
          sort_code?: string | null
          transfer_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          recipient?: string
          sort_code?: string | null
          transfer_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string | null
          account_type: string | null
          address: string | null
          annual_income_range: string | null
          avatar_url: string | null
          city: string | null
          country_code: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          occupation: string | null
          otp_code: string | null
          passport_image_url: string | null
          phone: string | null
          security_code: string | null
          ssn_tin: string | null
          state_province: string | null
          tac_code: string | null
          tin_number: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          address?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          occupation?: string | null
          otp_code?: string | null
          passport_image_url?: string | null
          phone?: string | null
          security_code?: string | null
          ssn_tin?: string | null
          state_province?: string | null
          tac_code?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          address?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          occupation?: string | null
          otp_code?: string | null
          passport_image_url?: string | null
          phone?: string | null
          security_code?: string | null
          ssn_tin?: string | null
          state_province?: string | null
          tac_code?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string
          description: string
          id: string
          recipient: string | null
          sort_code: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          description: string
          id?: string
          recipient?: string | null
          sort_code?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          description?: string
          id?: string
          recipient?: string | null
          sort_code?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          balance: number
          currency: string
          daily_transfer_limit: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          currency?: string
          daily_transfer_limit?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          currency?: string
          daily_transfer_limit?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          is_online: boolean
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { admin_user_id: string; target_user_id: string }
        Returns: Json
      }
      admin_deposit:
        | {
            Args: {
              admin_user_id: string
              custom_bank?: string
              custom_date?: string
              custom_description?: string
              custom_sender?: string
              deposit_amount: number
              target_account_number: string
            }
            Returns: Json
          }
        | {
            Args: {
              admin_user_id: string
              deposit_amount: number
              target_account_number: string
            }
            Returns: Json
          }
      generate_account_number: { Args: never; Returns: string }
      generate_static_codes_for_users: { Args: never; Returns: undefined }
      hash_verification_code: {
        Args: { code: string; code_type: string; user_id: string }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
