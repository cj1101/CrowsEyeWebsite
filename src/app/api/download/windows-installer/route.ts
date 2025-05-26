import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the batch installer from the public directory
    const installerPath = path.join(process.cwd(), 'public', 'install.bat')
    const installerContent = fs.readFileSync(installerPath, 'utf-8')
    
    // Return the file with proper headers
    return new NextResponse(installerContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="crows-eye-installer.bat"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error serving Windows installer:', error)
    return NextResponse.json(
      { error: 'Windows installer not found' },
      { status: 404 }
    )
  }
} 