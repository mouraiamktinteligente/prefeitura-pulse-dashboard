
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteRequest {
  googleDriveUrl: string;
  fileName: string;
  clientName: string;
}

// Função para obter o timestamp no timezone de São Paulo
function getSaoPauloTimestamp(): string {
  const now = new Date();
  const saoPauloTime = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);
  
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  return saoPauloTime.replace(' ', 'T') + '.' + milliseconds + '-03:00';
}

async function getAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY');
  
  if (!clientEmail || !privateKey) {
    console.error('Credenciais do Google Drive não encontradas');
    throw new Error('Missing Google Drive credentials');
  }

  console.log('Obtendo token de acesso para:', clientEmail);

  // Clean up the private key format
  const cleanPrivateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/"/g, '');

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: exp,
    iat: now
  };

  // Create JWT
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${headerB64}.${payloadB64}`;

  try {
    // Import private key using proper format
    const pemKey = cleanPrivateKey.includes('-----BEGIN') ? cleanPrivateKey : 
      `-----BEGIN PRIVATE KEY-----\n${cleanPrivateKey}\n-----END PRIVATE KEY-----`;
    
    const binaryDer = Uint8Array.from(atob(pemKey.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '')), c => c.charCodeAt(0));
    
    const keyData = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Sign the JWT
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyData,
      new TextEncoder().encode(signatureInput)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const jwt = `${signatureInput}.${signatureB64}`;

    console.log('JWT criado, solicitando token...');

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Erro ao obter token:', tokenData);
      throw new Error(`Failed to get access token: ${tokenData.error_description}`);
    }

    console.log('Token obtido com sucesso');
    return tokenData.access_token;
  } catch (error) {
    console.error('Erro ao processar chave privada:', error);
    throw new Error(`Failed to process private key: ${error.message}`);
  }
}

function extractFileIdFromUrl(url: string): string | null {
  try {
    // URL formats that contain file ID:
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // https://drive.google.com/open?id=FILE_ID
    
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    console.error('Não foi possível extrair ID do arquivo da URL:', url);
    return null;
  } catch (error) {
    console.error('Erro ao extrair ID do arquivo:', error);
    return null;
  }
}

async function deleteFile(accessToken: string, fileId: string): Promise<boolean> {
  try {
    console.log(`Deletando arquivo com ID: ${fileId}`);
    
    const deleteResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('Erro ao deletar arquivo:', deleteResponse.status, errorText);
      throw new Error(`Failed to delete file: ${deleteResponse.status} - ${errorText}`);
    }

    console.log(`Arquivo ${fileId} deletado com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== INÍCIO DA DELEÇÃO NO GOOGLE DRIVE ===');
    console.log('Timestamp São Paulo:', getSaoPauloTimestamp());
    
    const requestBody = await req.json();
    const { googleDriveUrl, fileName, clientName }: DeleteRequest = requestBody;

    console.log(`Iniciando deleção no Google Drive: ${fileName} - Cliente: ${clientName}`);
    console.log('URL do Google Drive:', googleDriveUrl);

    // Validar dados de entrada
    if (!googleDriveUrl || !fileName || !clientName) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Extrair ID do arquivo da URL
    const fileId = extractFileIdFromUrl(googleDriveUrl);
    if (!fileId) {
      throw new Error('Não foi possível extrair ID do arquivo da URL do Google Drive');
    }

    console.log('ID do arquivo extraído:', fileId);

    // Get access token
    console.log('Passo 1: Obtendo token de acesso...');
    const accessToken = await getAccessToken();
    console.log('✓ Token obtido');

    // Delete file
    console.log('Passo 2: Deletando arquivo...');
    await deleteFile(accessToken, fileId);
    console.log('✓ Arquivo deletado');

    console.log('=== DELEÇÃO CONCLUÍDA COM SUCESSO ===');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivo deletado com sucesso do Google Drive',
        fileName,
        clientName,
        timestamp_sao_paulo: getSaoPauloTimestamp()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('=== ERRO NA DELEÇÃO ===');
    console.error('Erro detalhado:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao deletar arquivo do Google Drive',
        timestamp_sao_paulo: getSaoPauloTimestamp(),
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
