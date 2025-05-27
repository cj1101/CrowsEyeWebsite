# -*- mode: python ; coding: utf-8 -*-

import sys
import os
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

# Collect all data files and submodules for common dependencies
datas = []
hiddenimports = []

# Add PyQt6 data files and modules
datas += collect_data_files('PyQt6')
hiddenimports += collect_submodules('PyQt6')

# Add other common dependencies
hiddenimports += [
    'google.generativeai',
    'requests',
    'PIL',
    'cv2',
    'numpy',
    'pandas',
    'sqlite3',
    'json',
    'configparser',
    'threading',
    'asyncio',
    'aiohttp',
    'urllib3',
    'certifi',
]

# Platform-specific settings
if sys.platform == 'win32':
    icon_file = 'assets/icon.ico'
    console = False
elif sys.platform == 'darwin':
    icon_file = 'assets/icon.icns'
    console = False
else:  # Linux
    icon_file = 'assets/icon.png'
    console = False

# Include assets directory
datas += [('assets', 'assets')]

# Include any config files
if os.path.exists('config'):
    datas += [('config', 'config')]

# Include documentation
if os.path.exists('docs'):
    datas += [('docs', 'docs')]

# Include any translation files
if os.path.exists('translations'):
    datas += [('translations', 'translations')]

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'scipy',
        'IPython',
        'jupyter',
        'notebook',
        'pytest',
        'setuptools',
        'distutils',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='CrowsEye',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=console,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon_file if os.path.exists(icon_file) else None,
)

# macOS app bundle
if sys.platform == 'darwin':
    app = BUNDLE(
        exe,
        name='CrowsEye.app',
        icon=icon_file,
        bundle_identifier='tech.crowseye.marketing-suite',
        info_plist={
            'CFBundleName': 'Crow\'s Eye Marketing Suite',
            'CFBundleDisplayName': 'Crow\'s Eye Marketing Suite',
            'CFBundleVersion': '1.0.0',
            'CFBundleShortVersionString': '1.0',
            'NSHighResolutionCapable': True,
            'LSMinimumSystemVersion': '10.15',
            'NSRequiresAquaSystemAppearance': False,
        },
    ) 