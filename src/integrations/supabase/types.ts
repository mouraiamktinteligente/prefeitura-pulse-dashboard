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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alerta_crise: {
        Row: {
          assunto: string | null
          created_at: string
          id: number
          link_materia: string | null
          nivel: string | null
          profile_prefeito: string | null
          profile_prefeitura: string | null
          status: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string
          id?: number
          link_materia?: string | null
          nivel?: string | null
          profile_prefeito?: string | null
          profile_prefeitura?: string | null
          status?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string
          id?: number
          link_materia?: string | null
          nivel?: string | null
          profile_prefeito?: string | null
          profile_prefeitura?: string | null
          status?: string | null
        }
        Relationships: []
      }
      alertas_comentarios: {
        Row: {
          created_at: string
          id: string
          link_comentario_negativo_1: string | null
          link_comentario_negativo_2: string | null
          link_comentario_negativo_3: string | null
          link_comentario_negativo_4: string | null
          link_comentario_positivo_1: string | null
          link_comentario_positivo_2: string | null
          link_comentario_positivo_3: string | null
          link_comentario_positivo_4: string | null
          negative_comment_1: string | null
          negative_comment_2: string | null
          negative_comment_3: string | null
          negative_comment_4: string | null
          negative_username_1: string | null
          negative_username_2: string | null
          negative_username_3: string | null
          negative_username_4: string | null
          positive_comment_1: string | null
          positive_comment_2: string | null
          positive_comment_3: string | null
          positive_comment_4: string | null
          positive_username_1: string | null
          positive_username_2: string | null
          positive_username_3: string | null
          positive_username_4: string | null
          profile: string | null
          profile_negative_1: string | null
          profile_negative_2: string | null
          profile_negative_3: string | null
          profile_negative_4: string | null
          profile_positive_1: string | null
          profile_positive_2: string | null
          profile_positive_3: string | null
          profile_positive_4: string | null
          score_negative_1: string | null
          score_negative_2: string | null
          score_negative_3: string | null
          score_negative_4: string | null
          score_positive_1: string | null
          score_positive_2: string | null
          score_positive_3: string | null
          score_positive_4: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_comentario_negativo_1?: string | null
          link_comentario_negativo_2?: string | null
          link_comentario_negativo_3?: string | null
          link_comentario_negativo_4?: string | null
          link_comentario_positivo_1?: string | null
          link_comentario_positivo_2?: string | null
          link_comentario_positivo_3?: string | null
          link_comentario_positivo_4?: string | null
          negative_comment_1?: string | null
          negative_comment_2?: string | null
          negative_comment_3?: string | null
          negative_comment_4?: string | null
          negative_username_1?: string | null
          negative_username_2?: string | null
          negative_username_3?: string | null
          negative_username_4?: string | null
          positive_comment_1?: string | null
          positive_comment_2?: string | null
          positive_comment_3?: string | null
          positive_comment_4?: string | null
          positive_username_1?: string | null
          positive_username_2?: string | null
          positive_username_3?: string | null
          positive_username_4?: string | null
          profile?: string | null
          profile_negative_1?: string | null
          profile_negative_2?: string | null
          profile_negative_3?: string | null
          profile_negative_4?: string | null
          profile_positive_1?: string | null
          profile_positive_2?: string | null
          profile_positive_3?: string | null
          profile_positive_4?: string | null
          score_negative_1?: string | null
          score_negative_2?: string | null
          score_negative_3?: string | null
          score_negative_4?: string | null
          score_positive_1?: string | null
          score_positive_2?: string | null
          score_positive_3?: string | null
          score_positive_4?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link_comentario_negativo_1?: string | null
          link_comentario_negativo_2?: string | null
          link_comentario_negativo_3?: string | null
          link_comentario_negativo_4?: string | null
          link_comentario_positivo_1?: string | null
          link_comentario_positivo_2?: string | null
          link_comentario_positivo_3?: string | null
          link_comentario_positivo_4?: string | null
          negative_comment_1?: string | null
          negative_comment_2?: string | null
          negative_comment_3?: string | null
          negative_comment_4?: string | null
          negative_username_1?: string | null
          negative_username_2?: string | null
          negative_username_3?: string | null
          negative_username_4?: string | null
          positive_comment_1?: string | null
          positive_comment_2?: string | null
          positive_comment_3?: string | null
          positive_comment_4?: string | null
          positive_username_1?: string | null
          positive_username_2?: string | null
          positive_username_3?: string | null
          positive_username_4?: string | null
          profile?: string | null
          profile_negative_1?: string | null
          profile_negative_2?: string | null
          profile_negative_3?: string | null
          profile_negative_4?: string | null
          profile_positive_1?: string | null
          profile_positive_2?: string | null
          profile_positive_3?: string | null
          profile_positive_4?: string | null
          score_negative_1?: string | null
          score_negative_2?: string | null
          score_negative_3?: string | null
          score_negative_4?: string | null
          score_positive_1?: string | null
          score_positive_2?: string | null
          score_positive_3?: string | null
          score_positive_4?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      analisados: {
        Row: {
          analisado_em: string
          comment_id: string | null
          id: number
          post_id: string | null
          profile: string | null
          username: string | null
        }
        Insert: {
          analisado_em?: string
          comment_id?: string | null
          id?: number
          post_id?: string | null
          profile?: string | null
          username?: string | null
        }
        Update: {
          analisado_em?: string
          comment_id?: string | null
          id?: number
          post_id?: string | null
          profile?: string | null
          username?: string | null
        }
        Relationships: []
      }
      analise_consolidada_semanal: {
        Row: {
          created_at: string
          id: number
          id_analise: string | null
          link_analise: string | null
          nome: string | null
          nome_analise: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_analise?: string | null
          link_analise?: string | null
          nome?: string | null
          nome_analise?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_analise?: string | null
          link_analise?: string | null
          nome?: string | null
          nome_analise?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      "analysis-comments": {
        Row: {
          comment: string | null
          comment_hour: string | null
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
          comment_hour?: string | null
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
          comment_hour?: string | null
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
          id_doc_referencia: string | null
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
          id_doc_referencia?: string | null
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
          id_doc_referencia?: string | null
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
      calendario_de_eventos: {
        Row: {
          cliente_id: string
          created_at: string
          data_evento: string
          hashtags: string[] | null
          hora_evento: string
          id: string
          mensagem: string | null
          nome_evento: string
          objetivo: string | null
          profile: string | null
          publico_alvo: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_evento: string
          hashtags?: string[] | null
          hora_evento: string
          id?: string
          mensagem?: string | null
          nome_evento: string
          objetivo?: string | null
          profile?: string | null
          publico_alvo?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_evento?: string
          hashtags?: string[] | null
          hora_evento?: string
          id?: string
          mensagem?: string | null
          nome_evento?: string
          objetivo?: string | null
          profile?: string | null
          publico_alvo?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_calendario_eventos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cadastro_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          id: string
          postCaption: string | null
          postComments: Json | null
          postUrl: string | null
          prefeitura: string | null
          shortCode: string | null
        }
        Insert: {
          id?: string
          postCaption?: string | null
          postComments?: Json | null
          postUrl?: string | null
          prefeitura?: string | null
          shortCode?: string | null
        }
        Update: {
          id?: string
          postCaption?: string | null
          postComments?: Json | null
          postUrl?: string | null
          prefeitura?: string | null
          shortCode?: string | null
        }
        Relationships: []
      }
      debug_relatorios_acesso: {
        Row: {
          action: string
          created_at: string | null
          id: string
          link_acessado: string | null
          metadata: Json | null
          profile: string | null
          tabela_origem: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          link_acessado?: string | null
          metadata?: Json | null
          profile?: string | null
          tabela_origem?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          link_acessado?: string | null
          metadata?: Json | null
          profile?: string | null
          tabela_origem?: string | null
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
          satisfacao_popular: string | null
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
          satisfacao_popular?: string | null
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
          satisfacao_popular?: string | null
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
      instagram_posts: {
        Row: {
          comments_count: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instagram_post_id: string | null
          likes_count: number | null
          link_publico_imagem: string | null
          post_url: string | null
          profile: string | null
          profile_prefeito: string | null
          updated_at: string
        }
        Insert: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instagram_post_id?: string | null
          likes_count?: number | null
          link_publico_imagem?: string | null
          post_url?: string | null
          profile?: string | null
          profile_prefeito?: string | null
          updated_at?: string
        }
        Update: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instagram_post_id?: string | null
          likes_count?: number | null
          link_publico_imagem?: string | null
          post_url?: string | null
          profile?: string | null
          profile_prefeito?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      linkweb_monitoramento_cliente: {
        Row: {
          created_at: string
          id: number
          link: string | null
          profile_prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link?: string | null
          profile_prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link?: string | null
          profile_prefeitura?: string | null
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
      marketing_campanhas: {
        Row: {
          cliente_id: string
          created_at: string
          descricao_personalizada: string | null
          documento_analise_id: string | null
          id: string
          status_campanha: string
          tipo_postagem: string
          tipo_solicitacao: string
          updated_at: string
          usuario_solicitante: string
          webhook_enviado_em: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao_personalizada?: string | null
          documento_analise_id?: string | null
          id?: string
          status_campanha?: string
          tipo_postagem: string
          tipo_solicitacao: string
          updated_at?: string
          usuario_solicitante: string
          webhook_enviado_em?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao_personalizada?: string | null
          documento_analise_id?: string | null
          id?: string
          status_campanha?: string
          tipo_postagem?: string
          tipo_solicitacao?: string
          updated_at?: string
          usuario_solicitante?: string
          webhook_enviado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campanhas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cadastro_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campanhas_documento_analise_id_fkey"
            columns: ["documento_analise_id"]
            isOneToOne: false
            referencedRelation: "documentos_analisados"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_imagens: {
        Row: {
          aprovado_por: string | null
          campanha_id: string
          created_at: string
          data_aprovacao: string | null
          descricao_gerada: string | null
          id: string
          metadata_adicional: Json | null
          observacoes_rejeicao: string | null
          status_aprovacao: string
          status_aprovacao_descricao: string
          tipo_imagem: string
          url_imagem: string
          versao: number
        }
        Insert: {
          aprovado_por?: string | null
          campanha_id: string
          created_at?: string
          data_aprovacao?: string | null
          descricao_gerada?: string | null
          id?: string
          metadata_adicional?: Json | null
          observacoes_rejeicao?: string | null
          status_aprovacao?: string
          status_aprovacao_descricao?: string
          tipo_imagem: string
          url_imagem: string
          versao?: number
        }
        Update: {
          aprovado_por?: string | null
          campanha_id?: string
          created_at?: string
          data_aprovacao?: string | null
          descricao_gerada?: string | null
          id?: string
          metadata_adicional?: Json | null
          observacoes_rejeicao?: string | null
          status_aprovacao?: string
          status_aprovacao_descricao?: string
          tipo_imagem?: string
          url_imagem?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_imagens_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "marketing_campanhas"
            referencedColumns: ["id"]
          },
        ]
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
      noticias_prefeito: {
        Row: {
          ativo: boolean | null
          autor: string | null
          categoria: string | null
          cidade: string
          conteudo_completo: string | null
          created_at: string | null
          data_busca: string | null
          data_publicacao: string | null
          data_scraping: string | null
          descricao_completa: string | null
          erro_scraping: string | null
          estado: string | null
          fonte: string | null
          id: number
          imagens: Json | null
          palavras_chave: string | null
          prefeito: string
          processado: boolean | null
          relevancia: number | null
          resumo: string | null
          resumo_ia: string | null
          sentimento: string | null
          status_scraping: string | null
          tags: string[] | null
          tamanho_conteudo: number | null
          tentativas_scraping: number | null
          titulo: string
          titulo_extraido: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          cidade: string
          conteudo_completo?: string | null
          created_at?: string | null
          data_busca?: string | null
          data_publicacao?: string | null
          data_scraping?: string | null
          descricao_completa?: string | null
          erro_scraping?: string | null
          estado?: string | null
          fonte?: string | null
          id?: number
          imagens?: Json | null
          palavras_chave?: string | null
          prefeito: string
          processado?: boolean | null
          relevancia?: number | null
          resumo?: string | null
          resumo_ia?: string | null
          sentimento?: string | null
          status_scraping?: string | null
          tags?: string[] | null
          tamanho_conteudo?: number | null
          tentativas_scraping?: number | null
          titulo: string
          titulo_extraido?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          cidade?: string
          conteudo_completo?: string | null
          created_at?: string | null
          data_busca?: string | null
          data_publicacao?: string | null
          data_scraping?: string | null
          descricao_completa?: string | null
          erro_scraping?: string | null
          estado?: string | null
          fonte?: string | null
          id?: number
          imagens?: Json | null
          palavras_chave?: string | null
          prefeito?: string
          processado?: boolean | null
          relevancia?: number | null
          resumo?: string | null
          resumo_ia?: string | null
          sentimento?: string | null
          status_scraping?: string | null
          tags?: string[] | null
          tamanho_conteudo?: number | null
          tentativas_scraping?: number | null
          titulo?: string
          titulo_extraido?: string | null
          updated_at?: string | null
          url?: string
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
          last_analysis_prefeito: string | null
          last_analysis_prefeitura: string | null
          nome: string | null
          nome_prefeito: string | null
          profile_prefeito: string | null
          profile_prefeitura: string
          quantidade_posts: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          estado?: string | null
          id?: string
          last_analysis_prefeito?: string | null
          last_analysis_prefeitura?: string | null
          nome?: string | null
          nome_prefeito?: string | null
          profile_prefeito?: string | null
          profile_prefeitura: string
          quantidade_posts?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          estado?: string | null
          id?: string
          last_analysis_prefeito?: string | null
          last_analysis_prefeitura?: string | null
          nome?: string | null
          nome_prefeito?: string | null
          profile_prefeito?: string | null
          profile_prefeitura?: string
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
      radio_transcriber: {
        Row: {
          cidade: string | null
          created_at: string
          data_hora: string | null
          id: string
          nomes: string | null
          radio: string | null
          relevante: boolean | null
          resumo: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          data_hora?: string | null
          id?: string
          nomes?: string | null
          radio?: string | null
          relevante?: boolean | null
          resumo?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          data_hora?: string | null
          id?: string
          nomes?: string | null
          radio?: string | null
          relevante?: boolean | null
          resumo?: string | null
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
          id_analise: string | null
          id_relatorio: string | null
          link_analise: string | null
          link_relatorio: string | null
          nome: string | null
          nome_analise: string | null
          nome_relatorio: string | null
          profile: string | null
          UUID: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_analise?: string | null
          id_relatorio?: string | null
          link_analise?: string | null
          link_relatorio?: string | null
          nome?: string | null
          nome_analise?: string | null
          nome_relatorio?: string | null
          profile?: string | null
          UUID?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_analise?: string | null
          id_relatorio?: string | null
          link_analise?: string | null
          link_relatorio?: string | null
          nome?: string | null
          nome_analise?: string | null
          nome_relatorio?: string | null
          profile?: string | null
          UUID?: string | null
        }
        Relationships: []
      }
      relatorio_analise_prefeito: {
        Row: {
          created_at: string
          id: number
          id_analise: string | null
          id_relatorio: string | null
          link_analise: string | null
          link_relatorio: string | null
          nome: string | null
          nome_analise: string | null
          nome_relatorio: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_analise?: string | null
          id_relatorio?: string | null
          link_analise?: string | null
          link_relatorio?: string | null
          nome?: string | null
          nome_analise?: string | null
          nome_relatorio?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_analise?: string | null
          id_relatorio?: string | null
          link_analise?: string | null
          link_relatorio?: string | null
          nome?: string | null
          nome_analise?: string | null
          nome_relatorio?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      relatorio_analise_web: {
        Row: {
          created_at: string
          id: number
          link_analise: string | null
          link_relatorio: string | null
          nome: string | null
          nome_analise: string | null
          nome_documento: string | null
          nome_relatorio: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_analise?: string | null
          link_relatorio?: string | null
          nome?: string | null
          nome_analise?: string | null
          nome_documento?: string | null
          nome_relatorio?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_analise?: string | null
          link_relatorio?: string | null
          nome?: string | null
          nome_analise?: string | null
          nome_documento?: string | null
          nome_relatorio?: string | null
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
      relatorio_whatsapp_semanal: {
        Row: {
          created_at: string
          id: string
          id_relatorio: string | null
          instagram_prefeitura: string | null
          link_relatorio: string | null
          nome_relatorio: string | null
          prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_relatorio?: string | null
          instagram_prefeitura?: string | null
          link_relatorio?: string | null
          nome_relatorio?: string | null
          prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_relatorio?: string | null
          instagram_prefeitura?: string | null
          link_relatorio?: string | null
          nome_relatorio?: string | null
          prefeitura?: string | null
        }
        Relationships: []
      }
      resumo_semanal_whatsapp: {
        Row: {
          boatos_desinformacao_e_criticas: string | null
          conclusao: string | null
          created_at: string
          id: string
          influencia_e_disseminacao: string | null
          "nome-prefeitura": string | null
          oportunidades_e_recomendacoes_estrategicas: string | null
          panorama_geral_da_semana: string | null
          percepcao_e_sentimento_publico: string | null
          temas_e_narrativas_relevantes: string | null
        }
        Insert: {
          boatos_desinformacao_e_criticas?: string | null
          conclusao?: string | null
          created_at?: string
          id?: string
          influencia_e_disseminacao?: string | null
          "nome-prefeitura"?: string | null
          oportunidades_e_recomendacoes_estrategicas?: string | null
          panorama_geral_da_semana?: string | null
          percepcao_e_sentimento_publico?: string | null
          temas_e_narrativas_relevantes?: string | null
        }
        Update: {
          boatos_desinformacao_e_criticas?: string | null
          conclusao?: string | null
          created_at?: string
          id?: string
          influencia_e_disseminacao?: string | null
          "nome-prefeitura"?: string | null
          oportunidades_e_recomendacoes_estrategicas?: string | null
          panorama_geral_da_semana?: string | null
          percepcao_e_sentimento_publico?: string | null
          temas_e_narrativas_relevantes?: string | null
        }
        Relationships: []
      }
      resumo_whatsapp: {
        Row: {
          created_at: string
          grupo: string | null
          id: number
          prefeitura: string | null
          resumo: string | null
          tema: string | null
        }
        Insert: {
          created_at?: string
          grupo?: string | null
          id?: number
          prefeitura?: string | null
          resumo?: string | null
          tema?: string | null
        }
        Update: {
          created_at?: string
          grupo?: string | null
          id?: number
          prefeitura?: string | null
          resumo?: string | null
          tema?: string | null
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
          cliente_id: string | null
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
          cliente_id?: string | null
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
          cliente_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "usuarios_sistema_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cadastro_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_summary_instagram_prefeito: {
        Row: {
          created_at: string
          id: string
          instagram_prefeito: string | null
          instagram_prefeitura: string | null
          openai_content: string | null
          prefeito: string | null
          prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Relationships: []
      }
      weekly_summary_instagram_prefeitura: {
        Row: {
          created_at: string
          id: string
          instagram_prefeito: string | null
          instagram_prefeitura: string | null
          openai_content: string | null
          prefeito: string | null
          prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Relationships: []
      }
      weekly_summary_web: {
        Row: {
          created_at: string
          id: string
          instagram_prefeito: string | null
          instagram_prefeitura: string | null
          openai_content: string | null
          prefeito: string | null
          prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Relationships: []
      }
      weekly_summary_whatsapp: {
        Row: {
          created_at: string
          id: string
          instagram_prefeito: string | null
          instagram_prefeitura: string | null
          openai_content: string | null
          prefeito: string | null
          prefeitura: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instagram_prefeito?: string | null
          instagram_prefeitura?: string | null
          openai_content?: string | null
          prefeito?: string | null
          prefeitura?: string | null
        }
        Relationships: []
      }
      whatsapp_groups: {
        Row: {
          created_at: string
          group_id: string | null
          group_name: string | null
          id: string
          picture_url: string | null
          prefeitura: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          group_name?: string | null
          id?: string
          picture_url?: string | null
          prefeitura?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          group_name?: string | null
          id?: string
          picture_url?: string | null
          prefeitura?: string | null
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
      "Resumo Posts Monitorados Por Cliente": {
        Row: {
          cliente: string | null
          comentarios_negativos: number | null
          comentarios_neutros: number | null
          comentarios_positivos: number | null
          media_likes_por_comentario: number | null
          nome_completo: string | null
          perfil_monitorado: string | null
          perfil_prefeito: string | null
          perfil_prefeitura: string | null
          primeira_coleta: string | null
          status_monitoramento: string | null
          tipo_perfil: string | null
          total_comentarios_coletados: number | null
          total_posts_monitorados: number | null
          ultima_coleta: string | null
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
      authenticate_user: {
        Args: { p_email: string; p_senha_hash: string }
        Returns: {
          ativo: boolean
          email: string
          id: string
          nome_completo: string
          permissoes: string
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
        }[]
      }
      authenticate_user_secure: { Args: { p_email: string }; Returns: boolean }
      buscar_posts_monitorados: {
        Args: { perfis: string[] }
        Returns: {
          total_posts: number
        }[]
      }
      cleanup_orphan_access_logs: { Args: never; Returns: undefined }
      exemplo_hora: { Args: never; Returns: string }
      force_logout_user: {
        Args: { p_motivo?: string; p_user_email: string }
        Returns: undefined
      }
      limpar_sessoes_expiradas: { Args: never; Returns: undefined }
      renovar_sessao: {
        Args: { p_session_token: string; p_user_email: string }
        Returns: boolean
      }
      verificar_consistencia_links_relatorios: {
        Args: never
        Returns: {
          description: string
          id: number
          issue_type: string
          link_relatorio: string
          profile: string
          tabela: string
        }[]
      }
      verificar_sessoes_multiplas_ip: {
        Args: { p_ip_address: string }
        Returns: {
          count_sessions: number
          user_email: string
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
