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
      checklist_runs: {
        Row: {
          batch_size: number
          completed_at: string | null
          created_at: string
          id: string
          load_version_id: string
          loaded_batch_id: string | null
          started_at: string
          steps_state: Json
          template_id: string | null
          template_name: string
          template_snapshot: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_size: number
          completed_at?: string | null
          created_at?: string
          id?: string
          load_version_id: string
          loaded_batch_id?: string | null
          started_at?: string
          steps_state?: Json
          template_id?: string | null
          template_name: string
          template_snapshot: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_size?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          load_version_id?: string
          loaded_batch_id?: string | null
          started_at?: string
          steps_state?: Json
          template_id?: string | null
          template_name?: string
          template_snapshot?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_runs_load_version_id_fkey"
            columns: ["load_version_id"]
            isOneToOne: false
            referencedRelation: "load_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_runs_loaded_batch_id_fkey"
            columns: ["loaded_batch_id"]
            isOneToOne: false
            referencedRelation: "loaded_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_runs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "process_templates"
            referencedColumns: ["id"]
          },
        ]
      }
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
          rounds_loaded: number
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
          rounds_loaded?: number
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
          rounds_loaded?: number
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
      loaded_batches: {
        Row: {
          created_at: string
          date: string
          humidity_pct: number | null
          id: string
          load_version_id: string
          notes: string | null
          qty: number
          qty_remaining: number
          room_temperature_c: number | null
          room_temperature_input: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          humidity_pct?: number | null
          id?: string
          load_version_id: string
          notes?: string | null
          qty: number
          qty_remaining: number
          room_temperature_c?: number | null
          room_temperature_input?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          humidity_pct?: number | null
          id?: string
          load_version_id?: string
          notes?: string | null
          qty?: number
          qty_remaining?: number
          room_temperature_c?: number | null
          room_temperature_input?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loaded_batches_load_version_id_fkey"
            columns: ["load_version_id"]
            isOneToOne: false
            referencedRelation: "load_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          caliber: string
          created_at: string
          favorite_version_id: string | null
          firearm_id: string | null
          id: string
          name: string
          purpose: string[]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caliber: string
          created_at?: string
          favorite_version_id?: string | null
          firearm_id?: string | null
          id?: string
          name: string
          purpose?: string[]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caliber?: string
          created_at?: string
          favorite_version_id?: string | null
          firearm_id?: string | null
          id?: string
          name?: string
          purpose?: string[]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loads_favorite_version_id_fkey"
            columns: ["favorite_version_id"]
            isOneToOne: false
            referencedRelation: "load_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_firearm_id_fkey"
            columns: ["firearm_id"]
            isOneToOne: false
            referencedRelation: "firearms"
            referencedColumns: ["id"]
          },
        ]
      }
      process_templates: {
        Row: {
          created_at: string
          description: string | null
          forked_from: string | null
          id: string
          name: string
          steps: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          forked_from?: string | null
          id?: string
          name: string
          steps?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          forked_from?: string | null
          id?: string
          name?: string
          steps?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_templates_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "process_templates"
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
      range_sessions: {
        Row: {
          ammo_note: string | null
          created_at: string
          date: string
          distance_input: string | null
          distance_m: number | null
          firearm_id: string
          group_size_input: string | null
          group_size_mm: number | null
          id: string
          lessons_learned: string | null
          load_version_id: string | null
          location: string | null
          photos: string[]
          pressure_flags: string[]
          rating: number | null
          rounds_fired: number
          temperature_c: number | null
          temperature_input: string | null
          updated_at: string
          user_id: string
          weather_notes: string | null
          wind: string | null
        }
        Insert: {
          ammo_note?: string | null
          created_at?: string
          date?: string
          distance_input?: string | null
          distance_m?: number | null
          firearm_id: string
          group_size_input?: string | null
          group_size_mm?: number | null
          id?: string
          lessons_learned?: string | null
          load_version_id?: string | null
          location?: string | null
          photos?: string[]
          pressure_flags?: string[]
          rating?: number | null
          rounds_fired?: number
          temperature_c?: number | null
          temperature_input?: string | null
          updated_at?: string
          user_id: string
          weather_notes?: string | null
          wind?: string | null
        }
        Update: {
          ammo_note?: string | null
          created_at?: string
          date?: string
          distance_input?: string | null
          distance_m?: number | null
          firearm_id?: string
          group_size_input?: string | null
          group_size_mm?: number | null
          id?: string
          lessons_learned?: string | null
          load_version_id?: string | null
          location?: string | null
          photos?: string[]
          pressure_flags?: string[]
          rating?: number | null
          rounds_fired?: number
          temperature_c?: number | null
          temperature_input?: string | null
          updated_at?: string
          user_id?: string
          weather_notes?: string | null
          wind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "range_sessions_firearm_id_fkey"
            columns: ["firearm_id"]
            isOneToOne: false
            referencedRelation: "firearms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "range_sessions_load_version_id_fkey"
            columns: ["load_version_id"]
            isOneToOne: false
            referencedRelation: "load_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      shot_strings: {
        Row: {
          created_at: string
          id: string
          label: string | null
          notes: string | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          notes?: string | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          notes?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shot_strings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "range_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          created_at: string
          id: string
          seq: number
          string_id: string
          user_id: string
          velocity_input: string | null
          velocity_mps: number
        }
        Insert: {
          created_at?: string
          id?: string
          seq: number
          string_id: string
          user_id: string
          velocity_input?: string | null
          velocity_mps: number
        }
        Update: {
          created_at?: string
          id?: string
          seq?: number
          string_id?: string
          user_id?: string
          velocity_input?: string | null
          velocity_mps?: number
        }
        Relationships: [
          {
            foreignKeyName: "shots_string_id_fkey"
            columns: ["string_id"]
            isOneToOne: false
            referencedRelation: "shot_strings"
            referencedColumns: ["id"]
          },
        ]
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
      shot_string_stats: {
        Row: {
          avg_mps: number | null
          es_mps: number | null
          max_mps: number | null
          min_mps: number | null
          n: number | null
          sd_mps: number | null
          string_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_string_id_fkey"
            columns: ["string_id"]
            isOneToOne: false
            referencedRelation: "shot_strings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      complete_checklist_run: {
        Args: { p_run_id: string }
        Returns: string
      }
      delete_own_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
