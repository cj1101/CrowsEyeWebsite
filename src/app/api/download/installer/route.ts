import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the installer script from the public directory
    const installerPath = path.join(process.cwd(), 'public', 'install.py')
    const installerContent = fs.readFileSync(installerPath, 'utf-8')
    
    // Return the file with proper headers
    return new NextResponse(installerContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/x-python',
        'Content-Disposition': 'attachment; filename="crows-eye-installer.py"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error serving installer:', error)
    return NextResponse.json(
      { error: 'Installer not found' },
      { status: 404 }
    )
  }
} 