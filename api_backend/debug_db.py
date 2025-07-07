#!/usr/bin/env python3
"""Simple database debug script"""
import sqlite3
import sys

def debug_database():
    try:
        print("🔍 Debugging local database...")
        
        # Connect to database
        conn = sqlite3.connect('crow_eye_local.db')
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"📋 Tables found: {[t[0] for t in tables]}")
        
        # Check users table structure
        if any('users' in str(t) for t in tables):
            cursor.execute("PRAGMA table_info(users);")
            columns = cursor.fetchall()
            print(f"👤 Users table columns: {[c[1] for c in columns]}")
            
            # Count users
            cursor.execute("SELECT COUNT(*) FROM users;")
            count = cursor.fetchone()[0]
            print(f"📊 Total users: {count}")
            
            # Show existing users
            cursor.execute("SELECT id, email, subscription_tier FROM users LIMIT 10;")
            users = cursor.fetchall()
            print(f"👥 Existing users: {users}")
            
        else:
            print("❌ Users table not found!")
            
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    debug_database() 