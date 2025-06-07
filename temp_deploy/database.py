import sqlite3
import os
import json
import uuid
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import logging
from contextlib import contextmanager

# Optional database drivers
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

class DatabaseManager:
    """Cross-platform database manager supporting SQLite, PostgreSQL, and MySQL"""
    
    def __init__(self, db_config: Optional[Dict] = None):
        self.db_config = db_config or self._get_default_config()
        self.db_type = self.db_config.get('type', 'sqlite')
        self.logger = logging.getLogger(__name__)
        
        # Initialize database
        self._init_database()
    
    def _get_default_config(self) -> Dict:
        """Get default database configuration"""
        # Use SQLite by default with cross-platform path
        db_dir = Path.home() / '.crow_eye_marketing'
        db_dir.mkdir(exist_ok=True)
        
        return {
            'type': 'sqlite',
            'path': str(db_dir / 'crow_eye.db'),
            'host': 'localhost',
            'port': 5432,
            'database': 'crow_eye',
            'username': 'crow_eye_user',
            'password': 'secure_password'
        }
    
    @contextmanager
    def get_connection(self):
        """Get database connection with proper cleanup"""
        conn = None
        try:
            if self.db_type == 'sqlite':
                conn = sqlite3.connect(self.db_config['path'])
                conn.row_factory = sqlite3.Row  # Enable dict-like access
            elif self.db_type == 'postgresql' and POSTGRES_AVAILABLE:
                conn = psycopg2.connect(
                    host=self.db_config['host'],
                    port=self.db_config['port'],
                    database=self.db_config['database'],
                    user=self.db_config['username'],
                    password=self.db_config['password']
                )
            elif self.db_type == 'mysql' and MYSQL_AVAILABLE:
                conn = mysql.connector.connect(
                    host=self.db_config['host'],
                    port=self.db_config['port'],
                    database=self.db_config['database'],
                    user=self.db_config['username'],
                    password=self.db_config['password']
                )
            else:
                raise ValueError(f"Unsupported database type: {self.db_type}")
            
            yield conn
            
        except Exception as e:
            if conn:
                conn.rollback()
            self.logger.error(f"Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def _init_database(self):
        """Initialize database with required tables"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Users table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        display_name TEXT,
                        first_name TEXT,
                        last_name TEXT,
                        password_hash TEXT,
                        plan TEXT DEFAULT 'spark',
                        is_super_user BOOLEAN DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login_at TIMESTAMP,
                        api_keys TEXT,
                        subscription_data TEXT,
                        preferences TEXT
                    )
                ''')
            else:
                # PostgreSQL/MySQL syntax
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(36) PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        display_name VARCHAR(255),
                        first_name VARCHAR(255),
                        last_name VARCHAR(255),
                        password_hash VARCHAR(255),
                        plan VARCHAR(50) DEFAULT 'spark',
                        is_super_user BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login_at TIMESTAMP,
                        api_keys TEXT,
                        subscription_data TEXT,
                        preferences TEXT
                    )
                ''')
            
            # Posts table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS posts (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        content TEXT,
                        platform TEXT,
                        scheduled_time TIMESTAMP,
                        published_time TIMESTAMP,
                        status TEXT DEFAULT 'draft',
                        media_urls TEXT,
                        hashtags TEXT,
                        mentions TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS posts (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36),
                        content TEXT,
                        platform VARCHAR(50),
                        scheduled_time TIMESTAMP,
                        published_time TIMESTAMP,
                        status VARCHAR(20) DEFAULT 'draft',
                        media_urls TEXT,
                        hashtags TEXT,
                        mentions TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            # Media table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS media (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        filename TEXT NOT NULL,
                        original_filename TEXT,
                        file_path TEXT,
                        file_size INTEGER,
                        mime_type TEXT,
                        width INTEGER,
                        height INTEGER,
                        duration REAL,
                        tags TEXT,
                        ai_description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS media (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36),
                        filename VARCHAR(255) NOT NULL,
                        original_filename VARCHAR(255),
                        file_path TEXT,
                        file_size BIGINT,
                        mime_type VARCHAR(100),
                        width INTEGER,
                        height INTEGER,
                        duration REAL,
                        tags TEXT,
                        ai_description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            # Analytics table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS analytics (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        post_id TEXT,
                        platform TEXT,
                        impressions INTEGER DEFAULT 0,
                        engagements INTEGER DEFAULT 0,
                        clicks INTEGER DEFAULT 0,
                        shares INTEGER DEFAULT 0,
                        saves INTEGER DEFAULT 0,
                        comments INTEGER DEFAULT 0,
                        likes INTEGER DEFAULT 0,
                        reach INTEGER DEFAULT 0,
                        date DATE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        FOREIGN KEY (post_id) REFERENCES posts (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS analytics (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36),
                        post_id VARCHAR(36),
                        platform VARCHAR(50),
                        impressions INTEGER DEFAULT 0,
                        engagements INTEGER DEFAULT 0,
                        clicks INTEGER DEFAULT 0,
                        shares INTEGER DEFAULT 0,
                        saves INTEGER DEFAULT 0,
                        comments INTEGER DEFAULT 0,
                        likes INTEGER DEFAULT 0,
                        reach INTEGER DEFAULT 0,
                        date DATE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        FOREIGN KEY (post_id) REFERENCES posts (id)
                    )
                ''')
            
            # Highlights table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS highlights (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        title TEXT NOT NULL,
                        description TEXT,
                        video_url TEXT,
                        thumbnail_url TEXT,
                        duration REAL,
                        tags TEXT,
                        status TEXT DEFAULT 'processing',
                        ai_analysis TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS highlights (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36),
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        video_url TEXT,
                        thumbnail_url TEXT,
                        duration REAL,
                        tags TEXT,
                        status VARCHAR(20) DEFAULT 'processing',
                        ai_analysis TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            # Galleries table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS galleries (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        name TEXT NOT NULL,
                        description TEXT,
                        media_ids TEXT,
                        cover_image_id TEXT,
                        is_public BOOLEAN DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS galleries (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36),
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        media_ids TEXT,
                        cover_image_id VARCHAR(36),
                        is_public BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            # Stories table
            if self.db_type == 'sqlite':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS stories (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        title TEXT NOT NULL,
                        slides TEXT,
                        template_id TEXT,
                        status TEXT DEFAULT 'draft',
                        published_at TIMESTAMP,
                        expires_at TIMESTAMP,
                        views INTEGER DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS stories (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36),
                        title VARCHAR(255) NOT NULL,
                        slides TEXT,
                        template_id VARCHAR(36),
                        status VARCHAR(20) DEFAULT 'draft',
                        published_at TIMESTAMP,
                        expires_at TIMESTAMP,
                        views INTEGER DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            conn.commit()
            self.logger.info("Database initialized successfully")
    
    # User management methods
    def create_user(self, email: str, display_name: str, password: str, 
                   first_name: str = "", last_name: str = "") -> str:
        """Create a new user and return user ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            user_id = str(uuid.uuid4())
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Check if user should be super user
            super_user_keywords = ['jamal', 'aperion', 'admin']
            is_super_user = any(keyword.lower() in email.lower() or 
                              keyword.lower() in display_name.lower() 
                              for keyword in super_user_keywords)
            
            cursor.execute('''
                INSERT INTO users (id, email, display_name, first_name, last_name, 
                                 password_hash, is_super_user)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, email, display_name, first_name, last_name, 
                  password_hash, is_super_user))
            
            conn.commit()
            return user_id
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user credentials"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            cursor.execute('''
                SELECT id, email, display_name, first_name, last_name, plan, 
                       is_super_user, api_keys, subscription_data, preferences
                FROM users WHERE email = ? AND password_hash = ?
            ''', (email, password_hash))
            
            if self.db_type == 'sqlite':
                user = cursor.fetchone()
                if user:
                    user = dict(user)
            else:
                user = cursor.fetchone()
            
            if user:
                # Update last login
                cursor.execute('UPDATE users SET last_login_at = ? WHERE id = ?', 
                             (datetime.now(), user['id']))
                conn.commit()
                
                return {
                    'id': user['id'],
                    'email': user['email'],
                    'display_name': user['display_name'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'plan': user['plan'],
                    'is_super_user': bool(user['is_super_user']),
                    'api_keys': json.loads(user['api_keys']) if user['api_keys'] else {},
                    'subscription_data': json.loads(user['subscription_data']) if user['subscription_data'] else {},
                    'preferences': json.loads(user['preferences']) if user['preferences'] else {}
                }
            
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, email, display_name, first_name, last_name, plan, 
                       is_super_user, api_keys, subscription_data, preferences,
                       created_at, last_login_at
                FROM users WHERE id = ?
            ''', (user_id,))
            
            if self.db_type == 'sqlite':
                user = cursor.fetchone()
                if user:
                    user = dict(user)
            else:
                user = cursor.fetchone()
            
            if user:
                return {
                    'id': user['id'],
                    'email': user['email'],
                    'display_name': user['display_name'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'plan': user['plan'],
                    'is_super_user': bool(user['is_super_user']),
                    'api_keys': json.loads(user['api_keys']) if user['api_keys'] else {},
                    'subscription_data': json.loads(user['subscription_data']) if user['subscription_data'] else {},
                    'preferences': json.loads(user['preferences']) if user['preferences'] else {},
                    'created_at': user['created_at'],
                    'last_login_at': user['last_login_at']
                }
            
            return None
    
    def update_user_api_keys(self, user_id: str, api_keys: Dict):
        """Update user's API keys"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET api_keys = ? WHERE id = ?', 
                          (json.dumps(api_keys), user_id))
            conn.commit()
    
    def update_user_subscription(self, user_id: str, subscription_data: Dict):
        """Update user's subscription data"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET subscription_data = ? WHERE id = ?', 
                          (json.dumps(subscription_data), user_id))
            conn.commit()
    
    # Post management methods
    def save_post(self, user_id: str, content: str, platform: str, 
                  scheduled_time: Optional[datetime] = None, 
                  media_urls: Optional[List[str]] = None,
                  hashtags: Optional[List[str]] = None) -> str:
        """Save a post to the database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            post_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO posts (id, user_id, content, platform, scheduled_time, 
                                 media_urls, hashtags, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (post_id, user_id, content, platform, scheduled_time,
                  json.dumps(media_urls) if media_urls else None,
                  json.dumps(hashtags) if hashtags else None,
                  datetime.now()))
            
            conn.commit()
            return post_id
    
    def get_user_posts(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Get user's posts"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM posts WHERE user_id = ? 
                ORDER BY created_at DESC LIMIT ?
            ''', (user_id, limit))
            
            if self.db_type == 'sqlite':
                posts = [dict(row) for row in cursor.fetchall()]
            else:
                posts = cursor.fetchall()
            
            # Parse JSON fields
            for post in posts:
                if post['media_urls']:
                    post['media_urls'] = json.loads(post['media_urls'])
                if post['hashtags']:
                    post['hashtags'] = json.loads(post['hashtags'])
                if post['mentions']:
                    post['mentions'] = json.loads(post['mentions'])
            
            return posts
    
    # Media management methods
    def save_media(self, user_id: str, filename: str, file_path: str, 
                   file_size: int, mime_type: str, **kwargs) -> str:
        """Save media file information"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            media_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO media (id, user_id, filename, original_filename, 
                                 file_path, file_size, mime_type, width, height, 
                                 duration, tags, ai_description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (media_id, user_id, filename, kwargs.get('original_filename'),
                  file_path, file_size, mime_type, kwargs.get('width'),
                  kwargs.get('height'), kwargs.get('duration'),
                  json.dumps(kwargs.get('tags', [])),
                  kwargs.get('ai_description')))
            
            conn.commit()
            return media_id
    
    def get_user_media(self, user_id: str, limit: int = 100) -> List[Dict]:
        """Get user's media files"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM media WHERE user_id = ? 
                ORDER BY created_at DESC LIMIT ?
            ''', (user_id, limit))
            
            if self.db_type == 'sqlite':
                media_files = [dict(row) for row in cursor.fetchall()]
            else:
                media_files = cursor.fetchall()
            
            # Parse JSON fields
            for media in media_files:
                if media['tags']:
                    media['tags'] = json.loads(media['tags'])
            
            return media_files
    
    # Analytics methods
    def save_analytics(self, user_id: str, post_id: str, platform: str, 
                      metrics: Dict, date: Optional[datetime] = None) -> str:
        """Save analytics data"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            analytics_id = str(uuid.uuid4())
            analytics_date = date or datetime.now().date()
            
            cursor.execute('''
                INSERT INTO analytics (id, user_id, post_id, platform, impressions, 
                                     engagements, clicks, shares, saves, comments, 
                                     likes, reach, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (analytics_id, user_id, post_id, platform,
                  metrics.get('impressions', 0), metrics.get('engagements', 0),
                  metrics.get('clicks', 0), metrics.get('shares', 0),
                  metrics.get('saves', 0), metrics.get('comments', 0),
                  metrics.get('likes', 0), metrics.get('reach', 0),
                  analytics_date))
            
            conn.commit()
            return analytics_id
    
    def get_user_analytics(self, user_id: str, days: int = 30) -> List[Dict]:
        """Get user's analytics data"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            start_date = datetime.now().date() - timedelta(days=days)
            
            cursor.execute('''
                SELECT * FROM analytics WHERE user_id = ? AND date >= ?
                ORDER BY date DESC
            ''', (user_id, start_date))
            
            if self.db_type == 'sqlite':
                analytics = [dict(row) for row in cursor.fetchall()]
            else:
                analytics = cursor.fetchall()
            
            return analytics
    
    def health_check(self) -> Dict:
        """Check database health and return status"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) as user_count FROM users')
                
                if self.db_type == 'sqlite':
                    result = dict(cursor.fetchone())
                else:
                    result = cursor.fetchone()
                
                return {
                    'status': 'healthy',
                    'database_type': self.db_type,
                    'user_count': result['user_count'],
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'database_type': self.db_type,
                'timestamp': datetime.now().isoformat()
            }

# Global database instance
db_manager = DatabaseManager() 