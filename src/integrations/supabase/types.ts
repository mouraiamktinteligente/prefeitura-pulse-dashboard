export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analisados: {
        Row: {
          analisado_em: string
          comment_id: string
          id: number
          post_id: string | null
          username: string | null
        }
        Insert: {
          analisado_em?: string
          comment_id: string
          id?: number
          post_id?: string | null
          username?: string | null
        }
        Update: {
          analisado_em?: string
          comment_id?: string
          id?: number
          post_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      "analysis-comments": {
        Row: {
          comment: string | null
          comment_id: string | null
          comment_url: string | null
          created_at: string
          id: number
          likes_count: string | null
          post_id: string | null
          postUrl: string | null
          profile: string | null
          sentiment: string | null
          username: string | null
        }
        Insert: {
          comment?: string | null
          comment_id?: string | null
          comment_url?: string | null
          created_at?: string
          id?: number
          likes_count?: string | null
          post_id?: string | null
          postUrl?: string | null
          profile?: string | null
          sentiment?: string | null
          username?: string | null
        }
        Update: {
          comment?: string | null
          comment_id?: string | null
          comment_url?: string | null
          created_at?: string
          id?: number
          likes_count?: string | null
          post_id?: string | null
          postUrl?: string | null
          profile?: string | null
          sentiment?: string | null
          username?: string | null
        }
        Relationships: []
      }
      logs_acesso: {
        Row: {
          created_at: string
          data_hora_login: string
          data_hora_logout: string | null
          email_usuario: string
          id: string
          ip_address: string | null
          session_id: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          data_hora_login?: string
          data_hora_logout?: string | null
          email_usuario: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          data_hora_login?: string
          data_hora_logout?: string | null
          email_usuario?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      "perfil-negative": {
        Row: {
          comment: string | null
          comment_url: string | null
          created_at: string
          followers: string | null
          id: number
          postUrl: string | null
          profile: string | null
          username: string | null
        }
        Insert: {
          comment?: string | null
          comment_url?: string | null
          created_at?: string
          followers?: string | null
          id?: number
          postUrl?: string | null
          profile?: string | null
          username?: string | null
        }
        Update: {
          comment?: string | null
          comment_url?: string | null
          created_at?: string
          followers?: string | null
          id?: number
          postUrl?: string | null
          profile?: string | null
          username?: string | null
        }
        Relationships: []
      }
      pesquisa_status: {
        Row: {
          id: number
          mensagem: string | null
          profile: string | null
          quantidade_resultados: number | null
          status: string | null
          ultima_pesquisa: string
        }
        Insert: {
          id?: number
          mensagem?: string | null
          profile?: string | null
          quantidade_resultados?: number | null
          status?: string | null
          ultima_pesquisa: string
        }
        Update: {
          id?: number
          mensagem?: string | null
          profile?: string | null
          quantidade_resultados?: number | null
          status?: string | null
          ultima_pesquisa?: string
        }
        Relationships: []
      }
      pesquisas_prefeitura: {
        Row: {
          created_at: string
          data_publicacao: string | null
          fonte: string | null
          id: number
          link: string | null
          profile: string | null
          resumo: string | null
          sentimento: string | null
          termo_pesquisa: string | null
          tipo: string | null
          titulo: string | null
        }
        Insert: {
          created_at?: string
          data_publicacao?: string | null
          fonte?: string | null
          id?: number
          link?: string | null
          profile?: string | null
          resumo?: string | null
          sentimento?: string | null
          termo_pesquisa?: string | null
          tipo?: string | null
          titulo?: string | null
        }
        Update: {
          created_at?: string
          data_publicacao?: string | null
          fonte?: string | null
          id?: number
          link?: string | null
          profile?: string | null
          resumo?: string | null
          sentimento?: string | null
          termo_pesquisa?: string | null
          tipo?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      "post-profile": {
        Row: {
          analisado_em: string | null
          caption: string | null
          created_at: string
          id: number
          post_id: string
          postUrl: string | null
          profile: string | null
        }
        Insert: {
          analisado_em?: string | null
          caption?: string | null
          created_at?: string
          id?: number
          post_id: string
          postUrl?: string | null
          profile?: string | null
        }
        Update: {
          analisado_em?: string | null
          caption?: string | null
          created_at?: string
          id?: number
          post_id?: string
          postUrl?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      profiles_monitorados: {
        Row: {
          ativo: boolean | null
          id: string
          profile: string
          quantidade_posts: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          id?: string
          profile: string
          quantidade_posts?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          id?: string
          profile?: string
          quantidade_posts?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios_sistema: {
        Row: {
          ativo: boolean | null
          cpf_cnpj: string
          created_at: string
          email: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_estado: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          id: string
          nome_completo: string
          nome_responsavel: string | null
          permissoes: Json | null
          razao_social: string | null
          senha_hash: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"] | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf_cnpj: string
          created_at?: string
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          id?: string
          nome_completo: string
          nome_responsavel?: string | null
          permissoes?: Json | null
          razao_social?: string | null
          senha_hash?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"] | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf_cnpj?: string
          created_at?: string
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          id?: string
          nome_completo?: string
          nome_responsavel?: string | null
          permissoes?: Json | null
          razao_social?: string | null
          senha_hash?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"] | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      resumo_sentimento_por_post: {
        Row: {
          negativos: number | null
          neutros: number | null
          positivos: number | null
          post_id: string | null
          postUrl: string | null
          profile: string | null
          total_comentarios: number | null
          ultima_atividade: string | null
        }
        Relationships: []
      }
      resumo_sentimento_por_profile: {
        Row: {
          negativos: number | null
          neutros: number | null
          positivos: number | null
          profile: string | null
          total_comentarios: number | null
          ultima_atividade: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      tipo_pessoa: "fisica" | "juridica"
      tipo_usuario: "administrador" | "usuario" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      tipo_pessoa: ["fisica", "juridica"],
      tipo_usuario: ["administrador", "usuario", "cliente"],
    },
  },
} as const
