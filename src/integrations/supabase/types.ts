export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analisados: {
        Row: {
          analisado_em: string
          comment_id: string
          id: number
          post_id: string | null
          profile: string | null
          username: string | null
        }
        Insert: {
          analisado_em?: string
          comment_id: string
          id?: number
          post_id?: string | null
          profile?: string | null
          username?: string | null
        }
        Update: {
          analisado_em?: string
          comment_id?: string
          id?: number
          post_id?: string | null
          profile?: string | null
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
      cadastro_clientes: {
        Row: {
          ativo: boolean
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
          id_folder_drive: string | null
          instagram_prefeito: string | null
          instagram_prefeitura: string | null
          nome_completo: string
          nome_completo_prefeito: string | null
          nome_responsavel: string | null
          razao_social: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
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
          id_folder_drive?: string | null
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          nome_completo: string
          nome_completo_prefeito?: string | null
          nome_responsavel?: string | null
          razao_social?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
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
          id_folder_drive?: string | null
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          nome_completo?: string
          nome_completo_prefeito?: string | null
          nome_responsavel?: string | null
          razao_social?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      documentos_analisados: {
        Row: {
          cliente_id: string
          created_at: string
          data_finalizacao: string | null
          data_upload: string
          drive_folder_id: string | null
          google_drive_url: string | null
          id: string
          nome_arquivo: string
          nome_cliente: string | null
          status: string
          tipo_arquivo: string
          updated_at: string
          url_analise: string | null
          url_original: string
          url_plano: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_finalizacao?: string | null
          data_upload?: string
          drive_folder_id?: string | null
          google_drive_url?: string | null
          id?: string
          nome_arquivo: string
          nome_cliente?: string | null
          status?: string
          tipo_arquivo: string
          updated_at?: string
          url_analise?: string | null
          url_original: string
          url_plano?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_finalizacao?: string | null
          data_upload?: string
          drive_folder_id?: string | null
          google_drive_url?: string | null
          id?: string
          nome_arquivo?: string
          nome_cliente?: string | null
          status?: string
          tipo_arquivo?: string
          updated_at?: string
          url_analise?: string | null
          url_original?: string
          url_plano?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_analisados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cadastro_clientes"
            referencedColumns: ["id"]
          },
        ]
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
          status_conexao: string | null
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
          status_conexao?: string | null
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
          status_conexao?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      monitoria_relatorios: {
        Row: {
          created_at: string
          id: number
          profile: string | null
          relatorio_instagram_prefeito: string | null
          relatorio_instagram_prefeitura: string | null
          relatorio_qualitativo: string | null
          relatorio_web_prefeito: string | null
          relatorio_web_prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          profile?: string | null
          relatorio_instagram_prefeito?: string | null
          relatorio_instagram_prefeitura?: string | null
          relatorio_qualitativo?: string | null
          relatorio_web_prefeito?: string | null
          relatorio_web_prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          profile?: string | null
          relatorio_instagram_prefeito?: string | null
          relatorio_instagram_prefeitura?: string | null
          relatorio_qualitativo?: string | null
          relatorio_web_prefeito?: string | null
          relatorio_web_prefeitura?: string | null
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
          relevancia: string | null
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
          relevancia?: string | null
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
          relevancia?: string | null
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
          cidade: string | null
          estado: string | null
          id: string
          nome: string | null
          profile: string
          quantidade_posts: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          profile: string
          quantidade_posts?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          profile?: string
          quantidade_posts?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promessas_prefeito: {
        Row: {
          cidade: string | null
          created_at: string
          estado: string | null
          id: number
          profile: string | null
          promessas1: string | null
          promessas10: string | null
          promessas11: string | null
          promessas12: string | null
          promessas13: string | null
          promessas14: string | null
          promessas15: string | null
          promessas16: string | null
          promessas17: string | null
          promessas18: string | null
          promessas19: string | null
          promessas2: string | null
          promessas20: string | null
          promessas3: string | null
          promessas4: string | null
          promessas5: string | null
          promessas6: string | null
          promessas7: string | null
          promessas8: string | null
          promessas9: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: number
          profile?: string | null
          promessas1?: string | null
          promessas10?: string | null
          promessas11?: string | null
          promessas12?: string | null
          promessas13?: string | null
          promessas14?: string | null
          promessas15?: string | null
          promessas16?: string | null
          promessas17?: string | null
          promessas18?: string | null
          promessas19?: string | null
          promessas2?: string | null
          promessas20?: string | null
          promessas3?: string | null
          promessas4?: string | null
          promessas5?: string | null
          promessas6?: string | null
          promessas7?: string | null
          promessas8?: string | null
          promessas9?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: number
          profile?: string | null
          promessas1?: string | null
          promessas10?: string | null
          promessas11?: string | null
          promessas12?: string | null
          promessas13?: string | null
          promessas14?: string | null
          promessas15?: string | null
          promessas16?: string | null
          promessas17?: string | null
          promessas18?: string | null
          promessas19?: string | null
          promessas2?: string | null
          promessas20?: string | null
          promessas3?: string | null
          promessas4?: string | null
          promessas5?: string | null
          promessas6?: string | null
          promessas7?: string | null
          promessas8?: string | null
          promessas9?: string | null
        }
        Relationships: []
      }
      registro_movimentacoes: {
        Row: {
          acao_realizada: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          data_hora_acao: string
          email_usuario: string
          id: string
          ip_address: string | null
          tabela_afetada: string | null
          updated_at: string
        }
        Insert: {
          acao_realizada: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_hora_acao?: string
          email_usuario: string
          id?: string
          ip_address?: string | null
          tabela_afetada?: string | null
          updated_at?: string
        }
        Update: {
          acao_realizada?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_hora_acao?: string
          email_usuario?: string
          id?: string
          ip_address?: string | null
          tabela_afetada?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      relatorio_analise_instagram: {
        Row: {
          created_at: string
          id: number
          link_relatorio: string | null
          nome: string | null
          nome_documento: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      relatorio_analise_prefeito: {
        Row: {
          created_at: string
          id: number
          link_relatorio: string | null
          nome: string | null
          nome_documento: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      relatorio_analise_web: {
        Row: {
          created_at: string
          id: number
          link_relatorio: string | null
          nome: string | null
          nome_documento: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      relatorio_qualitativo: {
        Row: {
          created_at: string
          id: number
          link_relatorio: string | null
          nome: string | null
          nome_documento: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_relatorio?: string | null
          nome?: string | null
          nome_documento?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      sessoes_ativas: {
        Row: {
          ativo: boolean
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string
          session_token: string
          updated_at: string
          user_email: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_token?: string
          updated_at?: string
          user_email: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_token?: string
          updated_at?: string
          user_email?: string
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
          permissoes: string | null
          razao_social: string | null
          senha_hash: string | null
          status_conexao: string
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
          permissoes?: string | null
          razao_social?: string | null
          senha_hash?: string | null
          status_conexao?: string
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
          permissoes?: string | null
          razao_social?: string | null
          senha_hash?: string | null
          status_conexao?: string
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"] | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      comparativo_diario_sentimentos: {
        Row: {
          classificacao_volume: string | null
          comentarios_dia_anterior: number | null
          comentarios_negativos: number | null
          comentarios_neutros: number | null
          comentarios_positivos: number | null
          crescimento_positivos_perc: number | null
          crescimento_total_perc: number | null
          data_brasileira: string | null
          data_formatada: string | null
          indice_positividade: number | null
          negativos_dia_anterior: number | null
          perc_negativos: number | null
          perc_neutros: number | null
          perc_positivos: number | null
          perc_positivos_dia_anterior: number | null
          positivos_dia_anterior: number | null
          profile: string | null
          score_dia_anterior: number | null
          score_sentimento: number | null
          status_atividade: string | null
          tendencia_diaria: string | null
          tendencia_evolucao: string | null
          total_comentarios: number | null
          usuarios_unicos: number | null
          variacao_negativos: number | null
          variacao_positivos: number | null
          variacao_score: number | null
          variacao_total: number | null
        }
        Relationships: []
      }
      resumo_diario_comments: {
        Row: {
          classificacao_volume: string | null
          comentarios_negativos: number | null
          comentarios_neutros: number | null
          comentarios_positivos: number | null
          data_analise: string | null
          data_brasileira: string | null
          data_completa: string | null
          data_formatada: string | null
          indice_positividade: number | null
          perc_negativos: number | null
          perc_neutros: number | null
          perc_positivos: number | null
          primeira_analise: string | null
          profile: string | null
          score_sentimento: number | null
          tendencia_diaria: string | null
          total_comentarios: number | null
          ultima_analise: string | null
          usuarios_unicos: number | null
        }
        Relationships: []
      }
      resumo_mensal_comments: {
        Row: {
          comentarios_negativos: number | null
          comentarios_neutros: number | null
          comentarios_positivos: number | null
          indice_positividade: number | null
          mes_ano: string | null
          mes_formatado: string | null
          mes_nome: string | null
          perc_negativos: number | null
          perc_neutros: number | null
          perc_positivos: number | null
          primeira_analise: string | null
          profile: string | null
          score_sentimento: number | null
          tendencia_mensal: string | null
          total_comentarios: number | null
          ultima_analise: string | null
          usuarios_unicos: number | null
        }
        Relationships: []
      }
      resumo_pesquisas_profile: {
        Row: {
          fontes_diferentes: number | null
          profile: string | null
          resultados_negativos: number | null
          resultados_neutros: number | null
          resultados_positivos: number | null
          tipos_conteudo_diferentes: number | null
          tipos_encontrados: string | null
          total_pesquisas: number | null
          ultima_atualizacao: string | null
          ultima_pesquisa: string | null
        }
        Relationships: []
      }
      resumo_pesquisas_web_profile: {
        Row: {
          fontes_diferentes: number | null
          profile: string | null
          resultados_negativos: number | null
          resultados_neutros: number | null
          resultados_positivos: number | null
          tipos_conteudo_diferentes: number | null
          tipos_encontrados: string | null
          total_pesquisas: number | null
          ultima_atualizacao: string | null
          ultima_pesquisa: string | null
        }
        Relationships: []
      }
      resumo_semanal_comments: {
        Row: {
          comentarios_negativos: number | null
          comentarios_neutros: number | null
          comentarios_positivos: number | null
          perc_negativos: number | null
          perc_neutros: number | null
          perc_positivos: number | null
          profile: string | null
          score_sentimento: number | null
          semana_fim: string | null
          semana_inicio: string | null
          tendencia_semanal: string | null
          total_comentarios: number | null
          ultima_analise: string | null
          usuarios_unicos: number | null
        }
        Relationships: []
      }
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
      exemplo_hora: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      force_logout_user: {
        Args: { p_user_email: string; p_motivo?: string }
        Returns: undefined
      }
      limpar_sessoes_expiradas: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      renovar_sessao: {
        Args: { p_user_email: string; p_session_token: string }
        Returns: boolean
      }
      verificar_sessoes_multiplas_ip: {
        Args: { p_ip_address: string }
        Returns: {
          user_email: string
          count_sessions: number
        }[]
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
      tipo_pessoa: ["fisica", "juridica"],
      tipo_usuario: ["administrador", "usuario", "cliente"],
    },
  },
} as const
