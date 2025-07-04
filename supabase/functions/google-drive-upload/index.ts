
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

async function getAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY');
  
  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google Drive credentials');
  }

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
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import private key
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(cleanPrivateKey),
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

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${signatureInput}.${signatureB64}`;

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
    console.error('Token error:', tokenData);
    throw new Error(`Failed to get access token: ${tokenData.error_description}`);
  }

  return tokenData.access_token;
}

async function findOrCreateClientFolder(accessToken: string, clientName: string): Promise<string> {
  const parentFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
  
  if (!parentFolderId) {
    throw new Error('Missing Google Drive folder ID');
  }

  // Search for existing folder
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${clientName}' and parents in '${parentFolderId}' and mimeType='application/vnd.google-apps.folder'`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    console.log(`Pasta encontrada para cliente ${clientName}:`, searchData.files[0].id);
    return searchData.files[0].id;
  }

  // Create new folder
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: clientName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    }),
  });

  const createData = await createResponse.json();
  console.log(`Nova pasta criada para cliente ${clientName}:`, createData.id);
  return createData.id;
}

async function uploadFile(accessToken: string, folderId: string, fileName: string, fileData: string, mimeType: string): Promise<GoogleDriveFile> {
  // Convert base64 to blob
  const binaryString = atob(fileData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([bytes], { type: mimeType }));

  const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: form,
  });

  const uploadData = await uploadResponse.json();
  
  if (!uploadResponse.ok) {
    console.error('Upload error:', uploadData);
    throw new Error(`Failed to upload file: ${uploadData.error?.message}`);
  }

  console.log(`Arquivo ${fileName} enviado com sucesso:`, uploadData.webViewLink);
  return uploadData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileName, fileData, clientName, mimeType }: UploadRequest = await req.json();

    console.log(`Iniciando upload para Google Drive: ${fileName} - Cliente: ${clientName}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Find or create client folder
    const folderId = await findOrCreateClientFolder(accessToken, clientName);

    // Upload file
    const uploadedFile = await uploadFile(accessToken, folderId, fileName, fileData, mimeType);

    return new Response(
      JSON.stringify({
        success: true,
        file: uploadedFile,
        message: 'Arquivo enviado com sucesso para o Google Drive'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro no upload para Google Drive:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao enviar arquivo para o Google Drive'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
