import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    platform: string;
  };
}

const PLATFORM_CONFIGS = {
  facebook: {
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    clientIdEnv: 'FACEBOOK_CLIENT_ID'
  },
  pinterest: {
    name: 'Pinterest',
    authUrl: 'https://api.pinterest.com/oauth/',
    clientIdEnv: 'PINTEREST_CLIENT_ID'
  },
  youtube: {
    name: 'YouTube',
    authUrl: 'https://accounts.google.com/oauth2/auth',
    clientIdEnv: 'GOOGLE_CLIENT_ID'
  },
  snapchat: {
    name: 'Snapchat',
    authUrl: 'https://accounts.snapchat.com/login/oauth2/authorize',
    clientIdEnv: 'SNAPCHAT_CLIENT_ID'
  }
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { platform } = params;
  
  try {
    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
    
    if (!config) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Platform "${platform}" is not supported.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Check if platform is configured
    const clientId = process.env[config.clientIdEnv];
    
    if (!clientId) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('${config.name} OAuth is not yet configured.\\n\\nOur app is still pending verification with ${config.name}.\\n\\nOnce approved, you\\'ll be able to connect your ${config.name} account.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 503
      });
    }

    // For now, all platforms will show the pending verification message
    // This will be updated once we get app verification approval
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('${config.name} integration is ready but pending final verification.\\n\\nWe\\'re working with ${config.name} to complete the app review process.\\n\\nThis will be available soon!');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 503
    });

  } catch (error) {
    console.error(`${platform} OAuth start error:`, error);
    
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('Failed to start ${platform} connection. Please try again.');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    });
  }
} 