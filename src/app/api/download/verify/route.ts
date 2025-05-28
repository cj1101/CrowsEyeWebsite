import { NextRequest, NextResponse } from 'next/server'

interface GitHubRelease {
  tag_name: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    
    if (!platform || !['windows', 'mac', 'linux'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // GitHub API to get specific release by tag
    const response = await fetch(
      'https://api.github.com/repos/cj1101/Crow-s-Eye-Marketing-Agent/releases/tags/v1.1.0',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CrowsEye-Website'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const release: GitHubRelease = await response.json()
    
    // Map platform to expected file patterns
    const filePatterns = {
      windows: /windows|win|\.exe$/i,
      mac: /mac|darwin|\.dmg$/i,
      linux: /linux|\.appimage$/i
    }

    // Find the appropriate asset for the platform
    const asset = release.assets.find(asset => 
      filePatterns[platform as keyof typeof filePatterns].test(asset.name)
    )

    if (!asset) {
      return NextResponse.json({
        error: 'Asset not found',
        fallbackUrl: `https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/tag/${release.tag_name}`,
        releasesUrl: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases'
      }, { status: 404 })
    }

    return NextResponse.json({
      downloadUrl: asset.browser_download_url,
      fileName: asset.name,
      fileSize: asset.size,
      version: release.tag_name,
      releasesUrl: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases'
    })

  } catch (error) {
    console.error('Download verification error:', error)
    
    // Return fallback URLs if API fails, using specific v1.1.0 tag
    const fallbackUrls = {
      windows: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Windows.exe',
      mac: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-macOS.dmg',
      linux: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Linux.AppImage'
    }

    const platform = new URL(request.url).searchParams.get('platform') as keyof typeof fallbackUrls
    
    return NextResponse.json({
      downloadUrl: fallbackUrls[platform] || fallbackUrls.windows,
      fileName: `CrowsEye-Setup-${platform}`,
      releasesUrl: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases',
      fallback: true
    })
  }
} 