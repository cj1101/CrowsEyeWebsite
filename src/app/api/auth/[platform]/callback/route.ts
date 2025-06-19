import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    platform: string;
  };
}

const PLATFORM_NAMES = {
  facebook: 'Facebook',
  pinterest: 'Pinterest', 
  youtube: 'YouTube',
  snapchat: 'Snapchat'
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { platform } = params;
  const platformName = PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES] || platform;
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error(`${platformName} OAuth error:`, error);
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('${platformName} connection was cancelled or failed.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // For now, show pending configuration message
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('${platformName} OAuth callback received but platform is not yet fully configured.\\n\\nApp verification is still pending.');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 503
    });

  } catch (error) {
    console.error(`${platformName} callback error:`, error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('An unexpected error occurred during ${platformName} connection.');
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