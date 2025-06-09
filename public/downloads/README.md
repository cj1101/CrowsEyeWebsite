# Downloads Directory

This directory contains the downloadable files for the Breadsmith Marketing Tool.

## Required Files

Place the following files in this directory:

1. **breadsmith-marketing-tool-portable.zip** - Portable version (ZIP archive)
2. **breadsmith-marketing-tool-source.zip** - Python source code (ZIP archive)  
3. **breadsmith-marketing-tool.exe** - Windows executable

## File Descriptions

### Portable Version (breadsmith-marketing-tool-portable.zip)
- Contains the complete application in a portable format
- No installation required
- Extract and run
- Best for users with strict antivirus settings

### Source Code (breadsmith-marketing-tool-source.zip)
- Complete Python source code
- Requires Python 3.8+ to run
- No antivirus issues
- For developers and advanced users

### Executable (breadsmith-marketing-tool.exe)
- Traditional Windows installer/executable
- May trigger antivirus warnings (false positives)
- Easiest installation for most users

## Notes

- Files are served via Next.js API routes in `/src/app/api/download/`
- Download analytics are logged to console
- Fallback URLs are provided if files are missing
- All downloads are tracked for analytics purposes 