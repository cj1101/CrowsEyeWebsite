#!/usr/bin/env python3
"""
Crow's Eye Marketing Suite - Desktop Application
AI-Powered Social Media Management Platform

Copyright © 2024 Crow's Eye Marketing Suite. All rights reserved.
"""

import sys
import os
import platform
import json
import sqlite3
import hashlib
import uuid
from datetime import datetime, timedelta
from pathlib import Path
import webbrowser
import requests
from typing import Dict, List, Optional, Any
import logging

# GUI Framework
try:
    from tkinter import *
    from tkinter import ttk, messagebox, filedialog, scrolledtext
    from tkinter.ttk import *
    import tkinter.font as tkFont
except ImportError:
    print("Error: tkinter not available. Please install tkinter for your platform.")
    sys.exit(1)

# Additional imports for enhanced functionality
try:
    from PIL import Image, ImageTk
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("Warning: PIL not available. Image functionality will be limited.")

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: OpenAI not available. AI functionality will be limited.")

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: Google Gemini not available. AI functionality will be limited.")

# Version and constants
VERSION = "1.0.0"
APP_NAME = "Crow's Eye Marketing Suite"
COMPANY_NAME = "Crow's Eye"
WEBSITE_URL = "https://crowseye.tech"

# Super users - users with these keywords in email/name get elevated privileges
SUPER_USER_KEYWORDS = ['jamal', 'aperion']

class DatabaseManager:
    """Handles SQLite database operations"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
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
                api_keys TEXT  -- JSON string for API keys
            )
        ''')
        
        # Posts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                content TEXT,
                platform TEXT,
                scheduled_time TIMESTAMP,
                status TEXT DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analytics (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                post_id TEXT,
                platform TEXT,
                impressions INTEGER DEFAULT 0,
                engagements INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                date DATE,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (post_id) REFERENCES posts (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_user(self, email: str, display_name: str, password: str, first_name: str = "", last_name: str = "") -> str:
        """Create a new user and return user ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        user_id = str(uuid.uuid4())
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Check if user should be super user
        is_super_user = any(keyword.lower() in email.lower() or keyword.lower() in display_name.lower() 
                          for keyword in SUPER_USER_KEYWORDS)
        
        cursor.execute('''
            INSERT INTO users (id, email, display_name, first_name, last_name, password_hash, is_super_user)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, email, display_name, first_name, last_name, password_hash, is_super_user))
        
        conn.commit()
        conn.close()
        return user_id
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user credentials"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('''
            SELECT id, email, display_name, first_name, last_name, plan, is_super_user, api_keys
            FROM users WHERE email = ? AND password_hash = ?
        ''', (email, password_hash))
        
        user = cursor.fetchone()
        if user:
            # Update last login
            cursor.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', (user[0],))
            conn.commit()
            
            conn.close()
            return {
                'id': user[0],
                'email': user[1],
                'display_name': user[2],
                'first_name': user[3],
                'last_name': user[4],
                'plan': user[5],
                'is_super_user': bool(user[6]),
                'api_keys': json.loads(user[7]) if user[7] else {}
            }
        
        conn.close()
        return None
    
    def update_api_keys(self, user_id: str, api_keys: Dict):
        """Update user's API keys"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('UPDATE users SET api_keys = ? WHERE id = ?', 
                      (json.dumps(api_keys), user_id))
        
        conn.commit()
        conn.close()
    
    def save_post(self, user_id: str, content: str, platform: str, scheduled_time: Optional[datetime] = None) -> str:
        """Save a post to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        post_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO posts (id, user_id, content, platform, scheduled_time)
            VALUES (?, ?, ?, ?, ?)
        ''', (post_id, user_id, content, platform, scheduled_time))
        
        conn.commit()
        conn.close()
        return post_id
    
    def get_user_posts(self, user_id: str) -> List[Dict]:
        """Get all posts for a user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, content, platform, scheduled_time, status, created_at
            FROM posts WHERE user_id = ? ORDER BY created_at DESC
        ''', (user_id,))
        
        posts = []
        for row in cursor.fetchall():
            posts.append({
                'id': row[0],
                'content': row[1],
                'platform': row[2],
                'scheduled_time': row[3],
                'status': row[4],
                'created_at': row[5]
            })
        
        conn.close()
        return posts

class AIContentGenerator:
    """Handles AI content generation using OpenAI and Gemini"""
    
    def __init__(self, api_keys: Dict):
        self.api_keys = api_keys
        self.setup_ai_clients()
    
    def setup_ai_clients(self):
        """Setup AI clients with API keys"""
        if OPENAI_AVAILABLE and 'openai' in self.api_keys:
            openai.api_key = self.api_keys['openai']
        
        if GEMINI_AVAILABLE and 'gemini' in self.api_keys:
            genai.configure(api_key=self.api_keys['gemini'])
    
    def generate_content(self, prompt: str, platform: str = "instagram", tone: str = "professional") -> str:
        """Generate content using available AI models"""
        
        # Enhanced prompt with platform-specific instructions
        platform_instructions = {
            'instagram': "Create an engaging Instagram post with relevant hashtags. Keep it visual and inspiring.",
            'facebook': "Create a Facebook post that encourages engagement and community interaction.",
            'twitter': "Create a concise Twitter/X post that's under 280 characters and includes relevant hashtags.",
            'linkedin': "Create a professional LinkedIn post that adds value and demonstrates expertise.",
            'tiktok': "Create a TikTok caption that's trendy, engaging, and includes popular hashtags.",
            'youtube': "Create a compelling YouTube video description with SEO-friendly keywords."
        }
        
        enhanced_prompt = f"""
        Platform: {platform}
        Tone: {tone}
        Instructions: {platform_instructions.get(platform, "Create engaging social media content")}
        
        User Request: {prompt}
        
        Please create compelling social media content that fits the platform and tone specified.
        """
        
        # Try OpenAI first
        if OPENAI_AVAILABLE and 'openai' in self.api_keys:
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a professional social media content creator and marketing expert."},
                        {"role": "user", "content": enhanced_prompt}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logging.error(f"OpenAI API error: {e}")
        
        # Try Gemini as fallback
        if GEMINI_AVAILABLE and 'gemini' in self.api_keys:
            try:
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(enhanced_prompt)
                return response.text.strip()
            except Exception as e:
                logging.error(f"Gemini API error: {e}")
        
        # Fallback to template-based generation
        return self.generate_template_content(prompt, platform, tone)
    
    def generate_template_content(self, prompt: str, platform: str, tone: str) -> str:
        """Generate content using templates when AI APIs are unavailable"""
        
        templates = {
            'instagram': [
                f"🌟 {prompt} ✨\n\n#inspiration #motivation #success #growth #mindset",
                f"✨ Ready to transform your {prompt}? Let's dive in! 💫\n\n#transformation #growth #success",
                f"💡 {prompt} - because every great journey starts with a single step! 🚀\n\n#journey #progress #goals"
            ],
            'facebook': [
                f"Exciting news about {prompt}! 🎉\n\nWhat are your thoughts on this? Share your experiences in the comments below! 👇",
                f"Let's talk about {prompt}! 💬\n\nI'd love to hear your perspective on this topic. Comment below and let's start a conversation!",
                f"🌟 {prompt} 🌟\n\nTag a friend who needs to see this! Share your thoughts and let's discuss."
            ],
            'twitter': [
                f"🚀 {prompt} #innovation #tech #growth",
                f"💡 {prompt} - what's your take? #discussion #insights",
                f"✨ {prompt} 🌟 #inspiration #motivation"
            ],
            'linkedin': [
                f"Professional insight: {prompt}\n\nIn today's rapidly evolving business landscape, this topic deserves our attention. What has been your experience with this?\n\n#professional #business #growth #leadership",
                f"Industry perspective on {prompt}:\n\nAs professionals, we must stay informed about developments in our field. I'd be interested to hear your thoughts on this matter.\n\n#industry #insights #professional #networking",
                f"Thought leadership: {prompt}\n\nThis is a critical consideration for anyone in our industry. How do you approach this challenge in your organization?\n\n#thoughtleadership #business #strategy"
            ]
        }
        
        import random
        template_list = templates.get(platform, templates['instagram'])
        return random.choice(template_list)

class CrowsEyeApp:
    """Main application class"""
    
    def __init__(self):
        self.root = Tk()
        self.root.title(f"{APP_NAME} v{VERSION}")
        self.root.geometry("1200x800")
        self.root.minsize(800, 600)
        
        # Initialize components
        self.setup_directories()
        self.db = DatabaseManager(self.get_db_path())
        self.current_user = None
        self.ai_generator = None
        
        # Setup UI
        self.setup_styles()
        self.create_login_screen()
        
        # Center window
        self.center_window()
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        
    def setup_directories(self):
        """Setup application directories"""
        if platform.system() == "Windows":
            self.app_dir = Path.home() / "AppData" / "Local" / "CrowsEye"
        elif platform.system() == "Darwin":  # macOS
            self.app_dir = Path.home() / "Library" / "Application Support" / "CrowsEye"
        else:  # Linux and others
            self.app_dir = Path.home() / ".local" / "share" / "CrowsEye"
        
        self.app_dir.mkdir(parents=True, exist_ok=True)
        
    def get_db_path(self) -> str:
        """Get database file path"""
        return str(self.app_dir / "crowseye.db")
    
    def center_window(self):
        """Center the window on screen"""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def setup_styles(self):
        """Setup ttk styles"""
        style = ttk.Style()
        
        # Configure colors
        style.configure('Title.TLabel', font=('Helvetica', 24, 'bold'))
        style.configure('Heading.TLabel', font=('Helvetica', 16, 'bold'))
        style.configure('Primary.TButton', font=('Helvetica', 12, 'bold'))
        
    def create_login_screen(self):
        """Create the login screen"""
        # Clear existing widgets
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Main frame
        main_frame = ttk.Frame(self.root, padding="40")
        main_frame.pack(fill=BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(main_frame, text="🦅 " + APP_NAME, style='Title.TLabel')
        title_label.pack(pady=(0, 10))
        
        subtitle_label = ttk.Label(main_frame, text="AI-Powered Social Media Management Platform")
        subtitle_label.pack(pady=(0, 30))
        
        # Login form
        login_frame = ttk.LabelFrame(main_frame, text="Login", padding="30")
        login_frame.pack(fill=X, pady=10)
        
        # Email
        ttk.Label(login_frame, text="Email:").pack(anchor=W)
        self.email_var = StringVar()
        email_entry = ttk.Entry(login_frame, textvariable=self.email_var, width=40)
        email_entry.pack(fill=X, pady=(5, 15))
        
        # Password
        ttk.Label(login_frame, text="Password:").pack(anchor=W)
        self.password_var = StringVar()
        password_entry = ttk.Entry(login_frame, textvariable=self.password_var, show="*", width=40)
        password_entry.pack(fill=X, pady=(5, 15))
        
        # Login button
        login_btn = ttk.Button(login_frame, text="Login", command=self.login, style='Primary.TButton')
        login_btn.pack(fill=X, pady=10)
        
        # Register section
        register_frame = ttk.LabelFrame(main_frame, text="New User Registration", padding="30")
        register_frame.pack(fill=X, pady=10)
        
        # Registration fields
        ttk.Label(register_frame, text="Display Name:").pack(anchor=W)
        self.reg_name_var = StringVar()
        ttk.Entry(register_frame, textvariable=self.reg_name_var, width=40).pack(fill=X, pady=(5, 10))
        
        ttk.Label(register_frame, text="Email:").pack(anchor=W)
        self.reg_email_var = StringVar()
        ttk.Entry(register_frame, textvariable=self.reg_email_var, width=40).pack(fill=X, pady=(5, 10))
        
        ttk.Label(register_frame, text="Password:").pack(anchor=W)
        self.reg_password_var = StringVar()
        ttk.Entry(register_frame, textvariable=self.reg_password_var, show="*", width=40).pack(fill=X, pady=(5, 10))
        
        # Register button
        register_btn = ttk.Button(register_frame, text="Register", command=self.register)
        register_btn.pack(fill=X, pady=10)
        
        # Website link
        website_frame = ttk.Frame(main_frame)
        website_frame.pack(fill=X, pady=20)
        
        website_btn = ttk.Button(website_frame, text="Visit Website", command=self.open_website)
        website_btn.pack(side=LEFT)
        
        # Bind Enter key to login
        self.root.bind('<Return>', lambda e: self.login())
        email_entry.focus()
        
    def login(self):
        """Handle user login"""
        email = self.email_var.get().strip()
        password = self.password_var.get().strip()
        
        if not email or not password:
            messagebox.showerror("Error", "Please enter both email and password.")
            return
        
        user = self.db.authenticate_user(email, password)
        if user:
            self.current_user = user
            self.ai_generator = AIContentGenerator(user['api_keys'])
            self.create_main_interface()
            
            # Show super user notification
            if user['is_super_user']:
                messagebox.showinfo("Super User", "Welcome! You have super user privileges.")
        else:
            messagebox.showerror("Error", "Invalid email or password.")
    
    def register(self):
        """Handle user registration"""
        name = self.reg_name_var.get().strip()
        email = self.reg_email_var.get().strip()
        password = self.reg_password_var.get().strip()
        
        if not all([name, email, password]):
            messagebox.showerror("Error", "Please fill in all fields.")
            return
        
        try:
            user_id = self.db.create_user(email, name, password)
            messagebox.showinfo("Success", "Account created successfully! Please login.")
            
            # Clear registration fields
            self.reg_name_var.set("")
            self.reg_email_var.set("")
            self.reg_password_var.set("")
            
        except sqlite3.IntegrityError:
            messagebox.showerror("Error", "Email already exists.")
        except Exception as e:
            messagebox.showerror("Error", f"Registration failed: {str(e)}")
    
    def open_website(self):
        """Open the website in browser"""
        webbrowser.open(WEBSITE_URL)
    
    def create_main_interface(self):
        """Create the main application interface"""
        # Clear existing widgets
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=BOTH, expand=True, padx=10, pady=10)
        
        # Create tabs
        self.create_dashboard_tab()
        self.create_content_tab()
        self.create_schedule_tab()
        self.create_analytics_tab()
        self.create_settings_tab()
        
        # Add logout button
        logout_frame = ttk.Frame(self.root)
        logout_frame.pack(fill=X, padx=10, pady=(0, 10))
        
        user_label = ttk.Label(logout_frame, text=f"Welcome, {self.current_user['display_name']}")
        user_label.pack(side=LEFT)
        
        if self.current_user['is_super_user']:
            super_label = ttk.Label(logout_frame, text="[SUPER USER]", foreground="red")
            super_label.pack(side=LEFT, padx=(10, 0))
        
        logout_btn = ttk.Button(logout_frame, text="Logout", command=self.logout)
        logout_btn.pack(side=RIGHT)
    
    def create_dashboard_tab(self):
        """Create dashboard tab"""
        dashboard_frame = ttk.Frame(self.notebook)
        self.notebook.add(dashboard_frame, text="📊 Dashboard")
        
        # Welcome section
        welcome_frame = ttk.LabelFrame(dashboard_frame, text="Welcome", padding="20")
        welcome_frame.pack(fill=X, padx=10, pady=10)
        
        welcome_text = f"Welcome to {APP_NAME}!\n\nPlan: {self.current_user['plan'].title()}"
        if self.current_user['is_super_user']:
            welcome_text += "\n🔥 Super User Access Activated"
        
        ttk.Label(welcome_frame, text=welcome_text).pack()
        
        # Quick stats
        stats_frame = ttk.LabelFrame(dashboard_frame, text="Quick Stats", padding="20")
        stats_frame.pack(fill=X, padx=10, pady=10)
        
        posts = self.db.get_user_posts(self.current_user['id'])
        stats_text = f"Total Posts: {len(posts)}\nDrafts: {len([p for p in posts if p['status'] == 'draft'])}\nScheduled: {len([p for p in posts if p['status'] == 'scheduled'])}"
        
        ttk.Label(stats_frame, text=stats_text).pack()
        
        # Recent posts
        recent_frame = ttk.LabelFrame(dashboard_frame, text="Recent Posts", padding="20")
        recent_frame.pack(fill=BOTH, expand=True, padx=10, pady=10)
        
        # Treeview for posts
        columns = ('Platform', 'Content', 'Status', 'Created')
        tree = ttk.Treeview(recent_frame, columns=columns, show='headings', height=8)
        
        for col in columns:
            tree.heading(col, text=col)
            tree.column(col, width=150)
        
        # Populate with recent posts
        for post in posts[:10]:  # Show last 10 posts
            content_preview = post['content'][:50] + "..." if len(post['content']) > 50 else post['content']
            tree.insert('', END, values=(
                post['platform'],
                content_preview,
                post['status'],
                post['created_at'][:16] if post['created_at'] else ""
            ))
        
        tree.pack(fill=BOTH, expand=True)
        
        # Scrollbar for treeview
        scrollbar = ttk.Scrollbar(recent_frame, orient=VERTICAL, command=tree.yview)
        tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side=RIGHT, fill=Y)
    
    def create_content_tab(self):
        """Create content creation tab"""
        content_frame = ttk.Frame(self.notebook)
        self.notebook.add(content_frame, text="✍️ Create Content")
        
        # AI Content Generation
        ai_frame = ttk.LabelFrame(content_frame, text="AI Content Generator", padding="20")
        ai_frame.pack(fill=X, padx=10, pady=10)
        
        # Prompt input
        ttk.Label(ai_frame, text="Describe what you want to post about:").pack(anchor=W)
        self.prompt_var = StringVar()
        prompt_entry = ttk.Entry(ai_frame, textvariable=self.prompt_var, width=60)
        prompt_entry.pack(fill=X, pady=(5, 10))
        
        # Platform selection
        platform_frame = ttk.Frame(ai_frame)
        platform_frame.pack(fill=X, pady=5)
        
        ttk.Label(platform_frame, text="Platform:").pack(side=LEFT)
        self.platform_var = StringVar(value="instagram")
        platform_combo = ttk.Combobox(platform_frame, textvariable=self.platform_var, 
                                     values=["instagram", "facebook", "twitter", "linkedin", "tiktok", "youtube"],
                                     state="readonly", width=20)
        platform_combo.pack(side=LEFT, padx=(10, 20))
        
        # Tone selection
        ttk.Label(platform_frame, text="Tone:").pack(side=LEFT)
        self.tone_var = StringVar(value="professional")
        tone_combo = ttk.Combobox(platform_frame, textvariable=self.tone_var,
                                 values=["professional", "casual", "friendly", "formal", "humorous", "inspiring"],
                                 state="readonly", width=20)
        tone_combo.pack(side=LEFT, padx=(10, 0))
        
        # Generate button
        generate_btn = ttk.Button(ai_frame, text="🤖 Generate Content", command=self.generate_ai_content)
        generate_btn.pack(pady=10)
        
        # Content editor
        editor_frame = ttk.LabelFrame(content_frame, text="Content Editor", padding="20")
        editor_frame.pack(fill=BOTH, expand=True, padx=10, pady=10)
        
        # Text area
        self.content_text = scrolledtext.ScrolledText(editor_frame, wrap=WORD, width=80, height=15)
        self.content_text.pack(fill=BOTH, expand=True)
        
        # Action buttons
        button_frame = ttk.Frame(editor_frame)
        button_frame.pack(fill=X, pady=(10, 0))
        
        save_draft_btn = ttk.Button(button_frame, text="Save as Draft", command=self.save_draft)
        save_draft_btn.pack(side=LEFT, padx=(0, 10))
        
        schedule_btn = ttk.Button(button_frame, text="Schedule Post", command=self.schedule_post)
        schedule_btn.pack(side=LEFT)
        
        clear_btn = ttk.Button(button_frame, text="Clear", command=self.clear_content)
        clear_btn.pack(side=RIGHT)
    
    def generate_ai_content(self):
        """Generate AI content based on user input"""
        prompt = self.prompt_var.get().strip()
        if not prompt:
            messagebox.showerror("Error", "Please enter a prompt.")
            return
        
        try:
            # Show loading message
            self.content_text.delete(1.0, END)
            self.content_text.insert(1.0, "🤖 Generating content... Please wait...")
            self.root.update()
            
            # Generate content
            if self.ai_generator:
                content = self.ai_generator.generate_content(
                    prompt, 
                    self.platform_var.get(), 
                    self.tone_var.get()
                )
            else:
                # Fallback content generation
                content = f"Great post about {prompt}! 🚀\n\n#inspiration #motivation #success"
            
            # Update text area
            self.content_text.delete(1.0, END)
            self.content_text.insert(1.0, content)
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate content: {str(e)}")
            self.content_text.delete(1.0, END)
    
    def save_draft(self):
        """Save content as draft"""
        content = self.content_text.get(1.0, END).strip()
        if not content:
            messagebox.showerror("Error", "No content to save.")
            return
        
        try:
            self.db.save_post(self.current_user['id'], content, self.platform_var.get())
            messagebox.showinfo("Success", "Draft saved successfully!")
            self.clear_content()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save draft: {str(e)}")
    
    def schedule_post(self):
        """Schedule a post"""
        content = self.content_text.get(1.0, END).strip()
        if not content:
            messagebox.showerror("Error", "No content to schedule.")
            return
        
        # For now, just save as scheduled - in a real app, this would integrate with social media APIs
        try:
            scheduled_time = datetime.now() + timedelta(hours=1)  # Schedule for 1 hour from now
            self.db.save_post(self.current_user['id'], content, self.platform_var.get(), scheduled_time)
            messagebox.showinfo("Success", "Post scheduled successfully!")
            self.clear_content()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to schedule post: {str(e)}")
    
    def clear_content(self):
        """Clear content editor"""
        self.content_text.delete(1.0, END)
        self.prompt_var.set("")
    
    def create_schedule_tab(self):
        """Create schedule management tab"""
        schedule_frame = ttk.Frame(self.notebook)
        self.notebook.add(schedule_frame, text="📅 Schedule")
        
        # Instructions
        ttk.Label(schedule_frame, text="Scheduled Posts", style='Heading.TLabel').pack(pady=10)
        
        # Posts list
        posts_frame = ttk.LabelFrame(schedule_frame, text="Your Scheduled Posts", padding="20")
        posts_frame.pack(fill=BOTH, expand=True, padx=10, pady=10)
        
        # Treeview for scheduled posts
        columns = ('Platform', 'Content', 'Scheduled Time', 'Status')
        schedule_tree = ttk.Treeview(posts_frame, columns=columns, show='headings')
        
        for col in columns:
            schedule_tree.heading(col, text=col)
            schedule_tree.column(col, width=200)
        
        # Populate with user's posts
        posts = self.db.get_user_posts(self.current_user['id'])
        for post in posts:
            content_preview = post['content'][:100] + "..." if len(post['content']) > 100 else post['content']
            schedule_tree.insert('', END, values=(
                post['platform'],
                content_preview,
                post['scheduled_time'] or "Not scheduled",
                post['status']
            ))
        
        schedule_tree.pack(fill=BOTH, expand=True)
        
        # Scrollbar
        schedule_scrollbar = ttk.Scrollbar(posts_frame, orient=VERTICAL, command=schedule_tree.yview)
        schedule_tree.configure(yscroll=schedule_scrollbar.set)
        schedule_scrollbar.pack(side=RIGHT, fill=Y)
    
    def create_analytics_tab(self):
        """Create analytics tab"""
        analytics_frame = ttk.Frame(self.notebook)
        self.notebook.add(analytics_frame, text="📈 Analytics")
        
        ttk.Label(analytics_frame, text="Analytics Dashboard", style='Heading.TLabel').pack(pady=10)
        
        # Mock analytics data
        analytics_data = ttk.LabelFrame(analytics_frame, text="Performance Overview", padding="20")
        analytics_data.pack(fill=X, padx=10, pady=10)
        
        posts = self.db.get_user_posts(self.current_user['id'])
        analytics_text = f"""
        📊 Your Performance Summary:
        
        Total Posts: {len(posts)}
        This Month: {len([p for p in posts if p['created_at'] and p['created_at'].startswith('2024')])}
        
        Platform Breakdown:
        • Instagram: {len([p for p in posts if p['platform'] == 'instagram'])}
        • Facebook: {len([p for p in posts if p['platform'] == 'facebook'])}
        • Twitter: {len([p for p in posts if p['platform'] == 'twitter'])}
        • LinkedIn: {len([p for p in posts if p['platform'] == 'linkedin'])}
        
        Engagement Metrics:
        • Average Impressions: 1,250
        • Average Engagement Rate: 3.2%
        • Top Performing Platform: Instagram
        """
        
        ttk.Label(analytics_data, text=analytics_text, justify=LEFT).pack(anchor=W)
        
        # Super user analytics
        if self.current_user['is_super_user']:
            super_analytics = ttk.LabelFrame(analytics_frame, text="🔥 Super User Analytics", padding="20")
            super_analytics.pack(fill=X, padx=10, pady=10)
            
            super_text = """
            🔥 Super User Dashboard:
            
            • Advanced Analytics: Enabled
            • All Platform Access: Enabled  
            • Premium AI Models: Enabled
            • Priority Support: Enabled
            • Custom Integrations: Available
            """
            
            ttk.Label(super_analytics, text=super_text, justify=LEFT, foreground="red").pack(anchor=W)
    
    def create_settings_tab(self):
        """Create settings tab"""
        settings_frame = ttk.Frame(self.notebook)
        self.notebook.add(settings_frame, text="⚙️ Settings")
        
        ttk.Label(settings_frame, text="Settings", style='Heading.TLabel').pack(pady=10)
        
        # API Keys section
        api_frame = ttk.LabelFrame(settings_frame, text="API Keys Configuration", padding="20")
        api_frame.pack(fill=X, padx=10, pady=10)
        
        ttk.Label(api_frame, text="Configure your API keys for enhanced functionality:").pack(anchor=W, pady=(0, 10))
        
        # OpenAI API Key
        ttk.Label(api_frame, text="OpenAI API Key:").pack(anchor=W)
        self.openai_key_var = StringVar(value=self.current_user['api_keys'].get('openai', ''))
        openai_entry = ttk.Entry(api_frame, textvariable=self.openai_key_var, width=60, show="*")
        openai_entry.pack(fill=X, pady=(5, 10))
        
        # Gemini API Key
        ttk.Label(api_frame, text="Google Gemini API Key:").pack(anchor=W)
        self.gemini_key_var = StringVar(value=self.current_user['api_keys'].get('gemini', ''))
        gemini_entry = ttk.Entry(api_frame, textvariable=self.gemini_key_var, width=60, show="*")
        gemini_entry.pack(fill=X, pady=(5, 10))
        
        # Save API keys button
        save_api_btn = ttk.Button(api_frame, text="Save API Keys", command=self.save_api_keys)
        save_api_btn.pack(pady=10)
        
        # Account information
        account_frame = ttk.LabelFrame(settings_frame, text="Account Information", padding="20")
        account_frame.pack(fill=X, padx=10, pady=10)
        
        account_info = f"""
        Email: {self.current_user['email']}
        Display Name: {self.current_user['display_name']}
        Plan: {self.current_user['plan'].title()}
        {'Super User: Yes 🔥' if self.current_user['is_super_user'] else 'Super User: No'}
        """
        
        ttk.Label(account_frame, text=account_info, justify=LEFT).pack(anchor=W)
        
        # Application info
        app_frame = ttk.LabelFrame(settings_frame, text="Application Information", padding="20")
        app_frame.pack(fill=X, padx=10, pady=10)
        
        app_info = f"""
        Version: {VERSION}
        Platform: {platform.system()} {platform.release()}
        Python: {platform.python_version()}
        Database: {self.get_db_path()}
        """
        
        ttk.Label(app_frame, text=app_info, justify=LEFT).pack(anchor=W)
        
        # Links
        links_frame = ttk.Frame(settings_frame)
        links_frame.pack(fill=X, padx=10, pady=10)
        
        website_btn = ttk.Button(links_frame, text="Visit Website", command=self.open_website)
        website_btn.pack(side=LEFT, padx=(0, 10))
        
        help_btn = ttk.Button(links_frame, text="Get Help", command=lambda: webbrowser.open(f"{WEBSITE_URL}/help"))
        help_btn.pack(side=LEFT)
    
    def save_api_keys(self):
        """Save API keys to database"""
        api_keys = {
            'openai': self.openai_key_var.get().strip(),
            'gemini': self.gemini_key_var.get().strip()
        }
        
        try:
            self.db.update_api_keys(self.current_user['id'], api_keys)
            self.current_user['api_keys'] = api_keys
            self.ai_generator = AIContentGenerator(api_keys)
            messagebox.showinfo("Success", "API keys saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save API keys: {str(e)}")
    
    def logout(self):
        """Logout user"""
        self.current_user = None
        self.ai_generator = None
        self.create_login_screen()
    
    def run(self):
        """Run the application"""
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            print("\nApplication terminated by user.")
        except Exception as e:
            print(f"Application error: {e}")
            messagebox.showerror("Error", f"Application error: {str(e)}")

def main():
    """Main entry point"""
    print(f"Starting {APP_NAME} v{VERSION}")
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Python: {platform.python_version()}")
    print()
    
    try:
        app = CrowsEyeApp()
        app.run()
    except Exception as e:
        print(f"Failed to start application: {e}")
        messagebox.showerror("Startup Error", f"Failed to start application: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 