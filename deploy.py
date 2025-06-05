#!/usr/bin/env python3
"""
🚀 Crow's Eye Marketing Suite - Comprehensive Deployment Script

This script handles the complete deployment process for the Crow's Eye Marketing Suite,
including web application, API backend, and desktop applications.

Usage:
    python deploy.py --help
    python deploy.py web --platform firebase
    python deploy.py api --platform railway
    python deploy.py desktop --platform all
    python deploy.py full --web-platform firebase --api-platform railway
"""

import os
import sys
import json
import subprocess
import argparse
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CrowsEyeDeployer:
    """Comprehensive deployment manager for Crow's Eye Marketing Suite"""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.web_dir = self.root_dir
        self.api_dir = self.root_dir / "crow_eye_api"
        self.desktop_dir = self.root_dir / "desktop_app"
        self.scripts_dir = self.root_dir / "scripts"
        
    def check_prerequisites(self) -> bool:
        """Check if all required tools are installed"""
        logger.info("🔍 Checking prerequisites...")
        
        required_tools = {
            'node': 'Node.js',
            'npm': 'npm',
            'python': 'Python',
            'pip': 'pip',
            'git': 'Git'
        }
        
        missing_tools = []
        
        for tool, name in required_tools.items():
            if not shutil.which(tool):
                missing_tools.append(name)
                logger.error(f"❌ {name} not found")
            else:
                logger.info(f"✅ {name} found")
        
        if missing_tools:
            logger.error(f"Missing required tools: {', '.join(missing_tools)}")
            return False
        
        return True
    
    def install_dependencies(self) -> bool:
        """Install all project dependencies"""
        logger.info("📦 Installing dependencies...")
        
        try:
            # Install web dependencies
            logger.info("Installing web dependencies...")
            subprocess.run(['npm', 'install'], cwd=self.web_dir, check=True)
            
            # Install API dependencies
            logger.info("Installing API dependencies...")
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
            ], cwd=self.api_dir, check=True)
            
            logger.info("✅ Dependencies installed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to install dependencies: {e}")
            return False
    
    def build_web_app(self) -> bool:
        """Build the Next.js web application"""
        logger.info("🏗️ Building web application...")
        
        try:
            subprocess.run(['npm', 'run', 'build'], cwd=self.web_dir, check=True)
            logger.info("✅ Web application built successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to build web application: {e}")
            return False
    
    def deploy_web_firebase(self) -> bool:
        """Deploy web application to Firebase Hosting"""
        logger.info("🚀 Deploying to Firebase Hosting...")
        
        try:
            # Check if Firebase CLI is installed
            if not shutil.which('firebase'):
                logger.error("❌ Firebase CLI not found. Install with: npm install -g firebase-tools")
                return False
            
            # Build the application
            if not self.build_web_app():
                return False
            
            # Deploy to Firebase
            subprocess.run(['firebase', 'deploy', '--only', 'hosting'], 
                         cwd=self.web_dir, check=True)
            
            logger.info("✅ Web application deployed to Firebase successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to deploy to Firebase: {e}")
            return False
    
    def deploy_web_vercel(self) -> bool:
        """Deploy web application to Vercel"""
        logger.info("🚀 Deploying to Vercel...")
        
        try:
            # Check if Vercel CLI is installed
            if not shutil.which('vercel'):
                logger.error("❌ Vercel CLI not found. Install with: npm install -g vercel")
                return False
            
            # Deploy to Vercel
            subprocess.run(['vercel', '--prod'], cwd=self.web_dir, check=True)
            
            logger.info("✅ Web application deployed to Vercel successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to deploy to Vercel: {e}")
            return False
    
    def deploy_api_railway(self) -> bool:
        """Deploy API to Railway"""
        logger.info("🚀 Deploying API to Railway...")
        
        try:
            # Check if Railway CLI is installed
            if not shutil.which('railway'):
                logger.error("❌ Railway CLI not found. Install with: npm install -g @railway/cli")
                return False
            
            # Deploy to Railway
            subprocess.run(['railway', 'up'], cwd=self.api_dir, check=True)
            
            logger.info("✅ API deployed to Railway successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to deploy to Railway: {e}")
            return False
    
    def deploy_api_heroku(self) -> bool:
        """Deploy API to Heroku"""
        logger.info("🚀 Deploying API to Heroku...")
        
        try:
            # Check if Heroku CLI is installed
            if not shutil.which('heroku'):
                logger.error("❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli")
                return False
            
            # Create Heroku app if it doesn't exist
            app_name = "crowseye-api"
            try:
                subprocess.run(['heroku', 'create', app_name], check=True)
            except subprocess.CalledProcessError:
                logger.info(f"Heroku app {app_name} already exists")
            
            # Deploy using git subtree
            subprocess.run([
                'git', 'subtree', 'push', '--prefix=crow_eye_api', 'heroku', 'main'
            ], cwd=self.root_dir, check=True)
            
            logger.info("✅ API deployed to Heroku successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to deploy to Heroku: {e}")
            return False
    
    def deploy_api_gcp(self) -> bool:
        """Deploy API to Google Cloud Run"""
        logger.info("🚀 Deploying API to Google Cloud Run...")
        
        try:
            # Check if gcloud CLI is installed
            if not shutil.which('gcloud'):
                logger.error("❌ Google Cloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install")
                return False
            
            # Deploy to Cloud Run
            subprocess.run([
                'gcloud', 'run', 'deploy', 'crowseye-api',
                '--source', '.',
                '--platform', 'managed',
                '--region', 'us-central1',
                '--allow-unauthenticated'
            ], cwd=self.api_dir, check=True)
            
            logger.info("✅ API deployed to Google Cloud Run successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to deploy to Google Cloud Run: {e}")
            return False
    
    def build_desktop_apps(self, platforms: List[str] = None) -> bool:
        """Build desktop applications for specified platforms"""
        logger.info("🖥️ Building desktop applications...")
        
        if platforms is None:
            platforms = ['windows', 'macos', 'linux']
        
        try:
            # Check if PyInstaller is installed
            subprocess.run([sys.executable, '-c', 'import PyInstaller'], check=True)
        except subprocess.CalledProcessError:
            logger.info("Installing PyInstaller...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyinstaller'], check=True)
        
        try:
            # Run the build script
            build_script = self.scripts_dir / "build_desktop_apps.py"
            if build_script.exists():
                for platform in platforms:
                    logger.info(f"Building for {platform}...")
                    subprocess.run([
                        sys.executable, str(build_script), '--platform', platform
                    ], cwd=self.root_dir, check=True)
            else:
                logger.error("❌ Desktop build script not found")
                return False
            
            logger.info("✅ Desktop applications built successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to build desktop applications: {e}")
            return False
    
    def create_github_release(self, version: str) -> bool:
        """Create a GitHub release with built assets"""
        logger.info(f"📦 Creating GitHub release v{version}...")
        
        try:
            # Check if GitHub CLI is installed
            if not shutil.which('gh'):
                logger.error("❌ GitHub CLI not found. Install from: https://cli.github.com/")
                return False
            
            # Create release
            dist_dir = self.root_dir / "dist"
            if dist_dir.exists():
                assets = list(dist_dir.glob("*"))
                if assets:
                    cmd = ['gh', 'release', 'create', f'v{version}'] + [str(asset) for asset in assets]
                    subprocess.run(cmd, cwd=self.root_dir, check=True)
                    logger.info("✅ GitHub release created successfully")
                    return True
                else:
                    logger.error("❌ No assets found in dist directory")
                    return False
            else:
                logger.error("❌ Dist directory not found")
                return False
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to create GitHub release: {e}")
            return False
    
    def run_tests(self) -> bool:
        """Run all tests to ensure everything works"""
        logger.info("🧪 Running tests...")
        
        try:
            # Run web tests
            if (self.web_dir / "package.json").exists():
                logger.info("Running web tests...")
                subprocess.run(['npm', 'test', '--passWithNoTests'], 
                             cwd=self.web_dir, check=True)
            
            # Run API tests
            if (self.api_dir / "tests").exists():
                logger.info("Running API tests...")
                subprocess.run([sys.executable, '-m', 'pytest'], 
                             cwd=self.api_dir, check=True)
            
            logger.info("✅ All tests passed")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Tests failed: {e}")
            return False
    
    def deploy_web(self, platform: str) -> bool:
        """Deploy web application to specified platform"""
        platforms = {
            'firebase': self.deploy_web_firebase,
            'vercel': self.deploy_web_vercel
        }
        
        if platform not in platforms:
            logger.error(f"❌ Unsupported web platform: {platform}")
            return False
        
        return platforms[platform]()
    
    def deploy_api(self, platform: str) -> bool:
        """Deploy API to specified platform"""
        platforms = {
            'railway': self.deploy_api_railway,
            'heroku': self.deploy_api_heroku,
            'gcp': self.deploy_api_gcp
        }
        
        if platform not in platforms:
            logger.error(f"❌ Unsupported API platform: {platform}")
            return False
        
        return platforms[platform]()
    
    def deploy_full(self, web_platform: str, api_platform: str) -> bool:
        """Deploy both web and API applications"""
        logger.info("🚀 Starting full deployment...")
        
        # Check prerequisites
        if not self.check_prerequisites():
            return False
        
        # Install dependencies
        if not self.install_dependencies():
            return False
        
        # Run tests
        if not self.run_tests():
            logger.warning("⚠️ Tests failed, but continuing with deployment")
        
        # Deploy API first
        if not self.deploy_api(api_platform):
            return False
        
        # Deploy web application
        if not self.deploy_web(web_platform):
            return False
        
        logger.info("🎉 Full deployment completed successfully!")
        return True

def main():
    """Main deployment script entry point"""
    parser = argparse.ArgumentParser(
        description="Crow's Eye Marketing Suite Deployment Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python deploy.py web --platform firebase
  python deploy.py api --platform railway
  python deploy.py desktop --platform all
  python deploy.py full --web-platform firebase --api-platform railway
  python deploy.py release --version 1.0.0
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Deployment commands')
    
    # Web deployment
    web_parser = subparsers.add_parser('web', help='Deploy web application')
    web_parser.add_argument('--platform', choices=['firebase', 'vercel'], 
                           default='firebase', help='Web hosting platform')
    
    # API deployment
    api_parser = subparsers.add_parser('api', help='Deploy API backend')
    api_parser.add_argument('--platform', choices=['railway', 'heroku', 'gcp'], 
                           default='railway', help='API hosting platform')
    
    # Desktop deployment
    desktop_parser = subparsers.add_parser('desktop', help='Build desktop applications')
    desktop_parser.add_argument('--platform', choices=['windows', 'macos', 'linux', 'all'], 
                               default='all', help='Target platform(s)')
    
    # Full deployment
    full_parser = subparsers.add_parser('full', help='Deploy everything')
    full_parser.add_argument('--web-platform', choices=['firebase', 'vercel'], 
                            default='firebase', help='Web hosting platform')
    full_parser.add_argument('--api-platform', choices=['railway', 'heroku', 'gcp'], 
                            default='railway', help='API hosting platform')
    
    # Release creation
    release_parser = subparsers.add_parser('release', help='Create GitHub release')
    release_parser.add_argument('--version', required=True, help='Release version')
    
    # Test command
    test_parser = subparsers.add_parser('test', help='Run all tests')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    deployer = CrowsEyeDeployer()
    
    try:
        if args.command == 'web':
            success = deployer.deploy_web(args.platform)
        elif args.command == 'api':
            success = deployer.deploy_api(args.platform)
        elif args.command == 'desktop':
            platforms = ['windows', 'macos', 'linux'] if args.platform == 'all' else [args.platform]
            success = deployer.build_desktop_apps(platforms)
        elif args.command == 'full':
            success = deployer.deploy_full(args.web_platform, args.api_platform)
        elif args.command == 'release':
            success = deployer.create_github_release(args.version)
        elif args.command == 'test':
            success = deployer.run_tests()
        else:
            logger.error(f"❌ Unknown command: {args.command}")
            success = False
        
        if success:
            logger.info("🎉 Deployment completed successfully!")
            sys.exit(0)
        else:
            logger.error("❌ Deployment failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("⚠️ Deployment cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 