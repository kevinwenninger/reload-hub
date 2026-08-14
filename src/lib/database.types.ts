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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      components: {
        Row: {
          attrs: Json
          created_at: string
          id: string
          manufacturer: string
          mpn: string | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attrs?: Json
          created_at?: string
          id?: string
          manufacturer: string
          mpn?: string | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attrs?: Json
          created_at?: string
          id?: string
          manufacturer?: string
          mpn?: string | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      firearms: {
        Row: {
          barrel_round_count: number
          caliber: string
          created_at: string
          id: string
          name: string
          notes: string | null
          secondary_calibers: string[]
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          barrel_round_count?: number
          caliber: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          secondary_calibers?: string[]
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          barrel_round_count?: number
          caliber?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          secondary_calibers?: string[]
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_lots: {
        Row: {
          archived: boolean
          component_id: string
          created_at: string
          currency: string
          firings_count: number | null
          id: string
          lot_number: string | null
          price_total: number | null
          purchase_date: string | null
          qty_initial: number
          qty_remaining: number
          source: string | null
          trimmed_to_input: string | null
          trimmed_to_mm: number | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          component_id: string
          created_at?: string
          currency?: string
          firings_count?: number | null
          id?: string
          lot_number?: string | null
          price_total?: number | null
          purchase_date?: string | null
          qty_initial: number
          qty_remaining: number
          source?: string | null
          trimmed_to_input?: string | null
          trimmed_to_mm?: number | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          component_id?: string
          created_at?: string
          currency?: string
          firings_count?: number | null
          id?: string
          lot_number?: string | null
          price_total?: number | null
          purchase_date?: string | null
          qty_initial?: number
          qty_remaining?: number
          source?: string | null
          trimmed_to_input?: string | null
          trimmed_to_mm?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lots_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      load_versions: {
        Row: {
          bullet_component_id: string | null
          bullet_lot_id: string | null
          case_component_id: string | null
          case_lot_id: string | null
          cbto_input: string | null
          cbto_mm: number | null
          changelog: string | null
          charge_input: string | null
          charge_mg: number | null
          coal_input: string | null
          coal_mm: number | null
          created_at: string
          crimp: string
          finalized_at: string | null
          id: string
          load_id: string
          neck_bushing_input: string | null
          neck_bushing_mm: number | null
          notes: string | null
          powder_component_id: string | null
          powder_lot_id: string | null
          primer_component_id: string | null
          primer_lot_id: string | null
          shoulder_bump_input: string | null
          shoulder_bump_mm: number | null
          updated_at: string
          user_id: string
          version_no: number
        }
        Insert: {
          bullet_component_id?: string | null
          bullet_lot_id?: string | null
          case_component_id?: string | null
          case_lot_id?: string | null
          cbto_input?: string | null
          cbto_mm?: number | null
          changelog?: string | null
          charge_input?: string | null
          charge_mg?: number | null
          coal_input?: string | null
          coal_mm?: number | null
          created_at?: string
          crimp?: string
          finalized_at?: string | null
          id?: string
          load_id: string
          neck_bushing_input?: string | null
          neck_bushing_mm?: number | null
          notes?: string | null
          powder_component_id?: string | null
          powder_lot_id?: string | null
          primer_component_id?: string | null
          primer_lot_id?: string | null
          shoulder_bump_input?: string | null
          shoulder_bump_mm?: number | null
          updated_at?: string
          user_id: string
          version_no: number
        }
        Update: {
          bullet_component_id?: string | null
          bullet_lot_id?: string | null
          case_component_id?: string | null
          case_lot_id?: string | null
          cbto_input?: string | null
          cbto_mm?: number | null
          changelog?: string | null
          charge_input?: string | null
          charge_mg?: number | null
          coal_input?: string | null
          coal_mm?: number | null
          created_at?: string
          crimp?: string
          finalized_at?: string | null
          id?: string
          load_id?: string
          neck_bushing_input?: string | null
          neck_bushing_mm?: number | null
          notes?: string | null
          powder_component_id?: string | null
          powder_lot_id?: string | null
          primer_component_id?: string | null
          primer_lot_id?: string | null
          shoulder_bump_input?: string | null
          shoulder_bump_mm?: number | null
          updated_at?: string
          user_id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "load_versions_bullet_component_id_fkey"
            columns: ["bullet_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_bullet_lot_id_fkey"
            columns: ["bullet_lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_case_component_id_fkey"
            columns: ["case_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_case_lot_id_fkey"
            columns: ["case_lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_powder_component_id_fkey"
            columns: ["powder_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_powder_lot_id_fkey"
            columns: ["powder_lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_primer_component_id_fkey"
            columns: ["primer_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_versions_primer_lot_id_fkey"
            columns: ["primer_lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          caliber: string
          created_at: string
          firearm_id: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caliber: string
          created_at?: string
          firearm_id: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caliber?: string
          created_at?: string
          firearm_id?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loads_firearm_id_fkey"
            columns: ["firearm_id"]
            isOneToOne: false
            referencedRelation: "firearms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          case_amortization_firings: number
          created_at: string
          display_name: string | null
          id: string
          safety_ack_at: string | null
          unit_prefs: Json
          updated_at: string
        }
        Insert: {
          case_amortization_firings?: number
          created_at?: string
          display_name?: string | null
          id: string
          safety_ack_at?: string | null
          unit_prefs?: Json
          updated_at?: string
        }
        Update: {
          case_amortization_firings?: number
          created_at?: string
          display_name?: string | null
          id?: string
          safety_ack_at?: string | null
          unit_prefs?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
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
    Enums: {
      app_role: ["user", "moderator", "admin"],
    },
  },
} as const
