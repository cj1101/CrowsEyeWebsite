#!/usr/bin/env python3
"""
Python Bridge Script for Crow's Eye Marketing Tool
This script bridges the Next.js API with your existing Python marketing tool.
"""

import sys
import json
import os
from pathlib import Path

# Add your marketing tool to the Python path
MARKETING_TOOL_PATH = r"C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final"
sys.path.insert(0, MARKETING_TOOL_PATH)
sys.path.insert(0, os.path.join(MARKETING_TOOL_PATH, 'src'))

def load_marketing_tool():
    """Import and initialize your marketing tool"""
    try:
        # Import your main marketing tool classes
        # Adjust these imports based on your actual Python tool structure
        from src.core.content_generator import ContentGenerator
        from src.core.analytics import AnalyticsManager
        from src.core.media_processor import MediaProcessor
        
        return {
            'content_generator': ContentGenerator(),
            'analytics_manager': AnalyticsManager(),
            'media_processor': MediaProcessor()
        }
    except Exception as e:
        return {'error': f'Failed to load marketing tool: {str(e)}'}

def generate_content(params):
    """Generate marketing content using your Python tool"""
    try:
        tools = load_marketing_tool()
        if 'error' in tools:
            return tools
        
        content_generator = tools['content_generator']
        
        # Extract parameters
        content_type = params.get('content_type', 'social_post')
        prompt = params.get('prompt', '')
        media_files = params.get('media_files', [])
        settings = params.get('settings', {})
        
        # Call your actual content generation method
        # Adjust this call based on your actual Python tool API
        result = content_generator.generate(
            content_type=content_type,
            prompt=prompt,
            media_files=media_files,
            **settings
        )
        
        return {
            'success': True,
            'content': result,
            'generated_at': str(datetime.now()),
            'content_type': content_type
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }

def get_analytics(user_id, date_range):
    """Get analytics using your Python tool"""
    try:
        tools = load_marketing_tool()
        if 'error' in tools:
            return tools
        
        analytics_manager = tools['analytics_manager']
        
        # Call your actual analytics method
        result = analytics_manager.get_user_analytics(
            user_id=user_id,
            start_date=date_range.get('start'),
            end_date=date_range.get('end')
        )
        
        return {
            'success': True,
            'analytics': result,
            'user_id': user_id
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }

def process_media(media_path, processing_type):
    """Process media using your Python tool"""
    try:
        tools = load_marketing_tool()
        if 'error' in tools:
            return tools
        
        media_processor = tools['media_processor']
        
        # Call your actual media processing method
        result = media_processor.process(
            media_path=media_path,
            processing_type=processing_type
        )
        
        return {
            'success': True,
            'processed_media': result,
            'original_path': media_path,
            'processing_type': processing_type
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }

def get_tier_features(tier):
    """Get available features for a user tier"""
    tier_features = {
        'free': {
            'features': ['media_library', 'smart_galleries', 'story_formatting'],
            'limits': {'daily_generations': 5, 'storage_mb': 100}
        },
        'creator': {
            'features': ['media_library', 'smart_galleries', 'story_formatting', 'highlight_reels', 'custom_audio'],
            'limits': {'daily_generations': 50, 'storage_mb': 1000}
        },
        'pro': {
            'features': ['media_library', 'smart_galleries', 'story_formatting', 'highlight_reels', 'custom_audio', 'analytics', 'exports'],
            'limits': {'daily_generations': 200, 'storage_mb': 5000}
        },
        'enterprise': {
            'features': ['all'],
            'limits': {'daily_generations': -1, 'storage_mb': -1}  # unlimited
        }
    }
    
    return {
        'success': True,
        'tier': tier,
        'features': tier_features.get(tier, tier_features['free'])
    }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command specified'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == 'generate_content':
            if len(sys.argv) < 3:
                raise ValueError('Input file path required')
            
            input_file = sys.argv[2]
            with open(input_file, 'r') as f:
                params = json.load(f)
            
            result = generate_content(params)
            
        elif command == 'get_analytics':
            user_id = sys.argv[2] if len(sys.argv) > 2 else ''
            date_range = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
            
            result = get_analytics(user_id, date_range)
            
        elif command == 'process_media':
            media_path = sys.argv[2] if len(sys.argv) > 2 else ''
            processing_type = sys.argv[3] if len(sys.argv) > 3 else 'basic'
            
            result = process_media(media_path, processing_type)
            
        elif command == 'get_tier_features':
            tier = sys.argv[2] if len(sys.argv) > 2 else 'free'
            
            result = get_tier_features(tier)
            
        else:
            result = {'error': f'Unknown command: {command}'}
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'error_type': type(e).__name__,
            'command': command
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main() 