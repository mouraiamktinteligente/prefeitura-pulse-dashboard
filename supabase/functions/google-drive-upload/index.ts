import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
}

interface UploadRequest {
  fileName: string;
  fileData: string; // base64 encoded
  clientName: string;
  mimeType: string;
}

// Função para obter o timestamp CORRETO no timezone de São Paulo
function getSaoPauloTimestamp(): string {
  const now = new Date();
  
  // Converter para UTC-3 (São Paulo) manualmente
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const saoPauloTime = new Date(utcTime + (-3 * 3600000)); // UTC-3
  
  // Formatar como ISO 8601 com timezone
  const year = saoPauloTime.getFullYear();
  const month = String(saoPauloTime.getMonth() + 1).padStart(2, '0');
  const day = String(saoPauloTime.getDate()).padStart(2, '0');
  const hours = String(saoPauloTime.getHours()).padStart(2, '0');
  const minutes = String(saoPauloTime.getMinutes()).padStart(2, '0');
  const seconds = String(saoPauloTime.getSeconds()).padStart(2, '0');
  const milliseconds = String(saoPauloTime.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}-03:00`;
}

async function getAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY');
  
  if (!clientEmail || !privateKey) {
    console.error('❌ Credenciais do Google Drive não encontradas');
    console.error('CLIENT_EMAIL disponível:', !!clientEmail);
    console.error('PRIVATE_KEY disponível:', !!privateKey);
    throw new Error('Missing Google Drive credentials');
  }

  console.log('✓ Credenciais encontradas para:', clientEmail);

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

async function findOrCreateClientFolder(accessToken: string, clientName: string): Promise<string> {
  const parentFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
  
  if (!parentFolderId) {
    console.error('❌ ID da pasta pai não encontrado');
    throw new Error('Missing Google Drive folder ID');
  }

  console.log(`📁 Gerenciando pasta para cliente: ${clientName}`);
  console.log(`📁 Pasta pai ID: ${parentFolderId}`);

  try {
    // Search for existing folder
    const searchQuery = `name='${encodeURIComponent(clientName)}' and parents in '${parentFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    console.log('🔍 Query de busca:', searchQuery);
    
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Erro ao buscar pasta:', searchResponse.status, errorText);
      throw new Error(`Failed to search for folder: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('🔍 Resultado da busca de pastas:', JSON.stringify(searchData, null, 2));

    if (searchData.files && searchData.files.length > 0) {
      console.log(`✓ Pasta encontrada para cliente ${clientName}:`, searchData.files[0].id);
      return searchData.files[0].id;
    }

    console.log(`📁 Criando nova pasta para cliente: ${clientName}`);
    
    // Create new folder
    const createPayload = {
      name: clientName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };
    
    console.log('📁 Payload de criação:', JSON.stringify(createPayload, null, 2));
    
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erro ao criar pasta:', createResponse.status, errorText);
      throw new Error(`Failed to create folder: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    console.log(`✓ Nova pasta criada para cliente ${clientName}:`, createData.id);
    return createData.id;
  } catch (error) {
    console.error('❌ Erro ao gerenciar pasta do cliente:', error);
    throw error;
  }
}

async function uploadFile(accessToken: string, folderId: string, fileName: string, fileData: string, mimeType: string): Promise<GoogleDriveFile> {
  console.log(`📤 Iniciando upload do arquivo: ${fileName}`);
  console.log(`📂 Para pasta ID: ${folderId}`);
  console.log(`📋 Tipo MIME: ${mimeType}`);
  console.log(`📊 Tamanho base64: ${fileData.length} caracteres`);
  
  try {
    // Convert base64 to blob
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log(`📊 Arquivo convertido: ${bytes.length} bytes`);

    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    console.log('📋 Metadata do arquivo:', JSON.stringify(metadata, null, 2));

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([bytes], { type: mimeType }));

    console.log('📤 Enviando arquivo para Google Drive...');

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    });

    console.log('📤 Status do upload:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Erro no upload:', uploadResponse.status, errorText);
      throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log(`✓ Arquivo ${fileName} enviado com sucesso!`);
    console.log('📋 Dados do upload:', JSON.stringify(uploadData, null, 2));
    return uploadData;
  } catch (error) {
    console.error('❌ Erro no upload do arquivo:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== 🚀 INÍCIO DO PROCESSAMENTO GOOGLE DRIVE ===');
    console.log('🕒 Timestamp São Paulo:', getSaoPauloTimestamp());
    
    const requestBody = await req.json();
    const { fileName, fileData, clientName, mimeType }: UploadRequest = requestBody;

    console.log('📋 Dados recebidos:');
    console.log(`  - Arquivo: ${fileName}`);
    console.log(`  - Cliente: ${clientName}`);
    console.log(`  - Tipo MIME: ${mimeType}`);
    console.log(`  - Tamanho base64: ${fileData?.length || 0} caracteres`);

    // Validar dados de entrada
    if (!fileName || !fileData || !clientName || !mimeType) {
      const missing = [];
      if (!fileName) missing.push('fileName');
      if (!fileData) missing.push('fileData');
      if (!clientName) missing.push('clientName');
      if (!mimeType) missing.push('mimeType');
      
      console.error('❌ Dados obrigatórios não fornecidos:', missing.join(', '));
      throw new Error(`Dados obrigatórios não fornecidos: ${missing.join(', ')}`);
    }

    // Get access token
    console.log('🔐 Passo 1: Obtendo token de acesso...');
    const accessToken = await getAccessToken();
    console.log('✓ Token obtido com sucesso');

    // Find or create client folder
    console.log('📁 Passo 2: Gerenciando pasta do cliente...');
    const folderId = await findOrCreateClientFolder(accessToken, clientName);
    console.log('✓ Pasta configurada:', folderId);

    // Upload file
    console.log('📤 Passo 3: Fazendo upload do arquivo...');
    const uploadedFile = await uploadFile(accessToken, folderId, fileName, fileData, mimeType);
    console.log('✓ Upload concluído com sucesso!');

    console.log('=== ✅ PROCESSAMENTO CONCLUÍDO COM SUCESSO ===');

    return new Response(
      JSON.stringify({
        success: true,
        file: uploadedFile,
        message: 'Arquivo enviado com sucesso para o Google Drive',
        timestamp_sao_paulo: getSaoPauloTimestamp()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('=== ❌ ERRO NO PROCESSAMENTO ===');
    console.error('Erro detalhado:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao enviar arquivo para o Google Drive',
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
