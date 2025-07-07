import { NextRequest, NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, image, prompt, editingMode, instances, parameters } = body;

    // Validate required fields
    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Use Imagen 3 Editing & Customization model (try latest stable revision 001).
    const DEFAULT_VERTEX_MODEL = 'imagen-3.0-capability-001';

    const allowedModels = [
      // Imagen 3 Editing & Customization revisions (most stable first)
      'imagen-3.0-capability-001',
      'imagen-3.0-capability-002'
    ];

    // Always use the editing & customization model for any request originating
    // from the photo editor. If a different model is explicitly requested, we
    // validate it against the allow-list and fall back when necessary.
    let selectedModel = model || DEFAULT_VERTEX_MODEL;

    if (!allowedModels.includes(selectedModel)) {
      console.warn(
        `Unrecognised or unsupported Vertex AI image model "${selectedModel}" – falling back to ${DEFAULT_VERTEX_MODEL}`
      );
      selectedModel = DEFAULT_VERTEX_MODEL;
    }

    // Prepare the request for Vertex AI Imagen API
    const location = 'us-central1';
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
    
    // Use different API endpoints based on model
    let apiUrl: string;
    let requestBody: any;

    if (selectedModel.startsWith('imagen-3.0-capability')) {
      // Use Imagen 3 Capability model for advanced editing
      apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:predict`;
      
      requestBody = {
        instances: [{
          prompt: prompt,
          referenceImages: [{
            referenceType: "REFERENCE_TYPE_RAW",
            referenceId: 1,
            referenceImage: {
              bytesBase64Encoded: image
            }
          }]
        }],
        parameters: {
          editConfig: {
            baseSteps: 35
          },
          editMode: getEditModeForAPI(editingMode),
          sampleCount: 1,
          aspectRatio: parameters?.aspectRatio || "1:1",
          personGeneration: parameters?.personGeneration || "allow_adult"
        }
      };

      // Add mask reference for inpainting/outpainting if needed
      if (editingMode === 'inpaint' || editingMode === 'outpaint') {
        requestBody.instances[0].referenceImages.push({
          referenceType: "REFERENCE_TYPE_MASK",
          referenceId: 2,
          maskImageConfig: {
            maskMode: editingMode === 'background' ? "MASK_MODE_BACKGROUND" : "MASK_MODE_FOREGROUND",
            dilation: 0.03
          }
        });
      }

    } else {
      // Use standard Imagen 3 models for general editing/generation
      apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:predict`;
      
      requestBody = {
        instances: [{
          prompt: prompt,
          image: {
            bytesBase64Encoded: image
          }
        }],
        parameters: {
          sampleCount: parameters?.sampleCount || 1,
          aspectRatio: parameters?.aspectRatio || "1:1",
          personGeneration: parameters?.personGeneration || "allow_adult"
        }
      };
    }

    // Decide whether to authenticate with an OAuth2 bearer token (preferred) or API key fallback.
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const accessToken = await getAccessToken();

    if (accessToken) {
      // Prefer bearer token from service-account credentials.
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    } else if (apiKey) {
      // Fall back to API key if no bearer token available.
      apiUrl += apiUrl.includes('?') ? `&key=${apiKey}` : `?key=${apiKey}`;
    }

    console.log(`Using Vertex AI model ${selectedModel} for editing mode: ${editingMode || 'general'}`);

    // Make request to Vertex AI
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI API error:', errorText);

      // Gracefully fall back to Gemini Image Editing when the model is unavailable (404).
      if (response.status === 404) {
        console.warn(`Model ${selectedModel} not available — falling back to Gemini Image Editing.`);
        return await fallbackToGeminiEditing(image, prompt, apiKey);
      }

      return NextResponse.json(
        { 
          error: `Image editing failed: ${response.status} ${response.statusText}`,
          details: errorText,
          model: selectedModel 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Add metadata about the model used
    return NextResponse.json({
      ...data,
      metadata: {
        modelUsed: selectedModel,
        editingMode: editingMode || 'general',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in image editing API:', error);
    return NextResponse.json(
      { error: 'Internal server error during image editing' },
      { status: 500 }
    );
  }
}

function getEditModeForAPI(editingMode: string): string {
  switch (editingMode) {
    case 'inpaint':
      return 'EDIT_MODE_INPAINT_INSERTION';
    case 'outpaint':
      return 'EDIT_MODE_OUTPAINT';
    case 'background':
      return 'EDIT_MODE_PRODUCT_IMAGE';
    case 'enhance':
      return 'EDIT_MODE_TEXT_GUIDED';
    default:
      return 'EDIT_MODE_TEXT_GUIDED';
  }
}

// Attempt to obtain an OAuth2 access token using service-account credentials, an explicit token, or metadata server.
async function getAccessToken(): Promise<string> {
  // 1. Use an explicit token if provided.
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return process.env.GOOGLE_ACCESS_TOKEN;
  }

  // 2. Use service-account key (private key + client email) to mint a token.
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;

  if (privateKey && clientEmail) {
    try {
      const jwtClient = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });

      const { token } = await jwtClient.getAccessToken();
      if (token) return token;
      if (typeof token === 'string') return token;
    } catch (err) {
      console.error('Failed to create JWT access token:', err);
    }
  }

  // 3. Attempt to retrieve the default service-account token when running on GCP.
  try {
    const metadataResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
      headers: { 'Metadata-Flavor': 'Google' },
    });

    if (metadataResponse.ok) {
      const data = await metadataResponse.json();
      return data.access_token;
    }
  } catch (_) {
    // Not running on GCP or metadata server unavailable.
  }

  return '';
}

async function fallbackToGeminiEditing(image: string, prompt: string, apiKey: string): Promise<NextResponse> {
  try {
    // Use Gemini for text-guided image editing as fallback
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [
          { text: `Edit this image: ${prompt}` },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: image
            }
          }
        ]
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract image data from Gemini response
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return NextResponse.json({
            predictions: [{
              bytesBase64Encoded: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/png'
            }]
          });
        }
      }
    }

    throw new Error('No image data in Gemini response');

  } catch (error) {
    console.error('Gemini fallback error:', error);
    return NextResponse.json(
      { error: 'Image editing failed on both primary and fallback services' },
      { status: 500 }
    );
  }
} 