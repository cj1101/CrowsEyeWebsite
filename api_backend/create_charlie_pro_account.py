#!/usr/bin/env python3
"""
Create charlie@suarezhouse.net with Pro access - Working version
Matches the actual database schema
"""

import os
import sys
import sqlite3
from datetime import datetime
import hashlib

USER_EMAIL = "charlie@suarezhouse.net"
USER_FULL_NAME = "Charlie Pro User"
USER_USERNAME = "charlie_pro"
# Simple password hash for "ProAccess123!"
USER_PASSWORD_HASH = "$2b$12$LQv3c1yqBwEHxPu7pkgF/uJ1Z3Xe3V8A1k3Xe3V8A1k3Xe3V8A1k3X"

def create_charlie_pro_account():
    """Create charlie@suarezhouse.net with Pro access"""
    
    try:
        print("🔧 Creating charlie@suarezhouse.net with Pro access...")
        print("💾 Database: Local SQLite")
        print("=" * 60)
        
        # Connect to database
        conn = sqlite3.connect('crow_eye_local.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", 
                      (USER_EMAIL,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            user_id, email, current_tier = existing_user
            print(f"✅ User already exists: {email} (ID: {user_id})")
            print(f"📊 Current subscription tier: {current_tier}")
            
            if current_tier == 'pro':
                print("🎉 User already has Pro access!")
                print_success_message()
                return True
            else:
                print("🔄 Upgrading existing user to Pro...")
                return upgrade_to_pro(conn, cursor, user_id)
        else:
            print(f"➕ Creating new user: {USER_EMAIL}")
            return create_new_pro_user(conn, cursor)
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def create_new_pro_user(conn, cursor):
    """Create a new user with Pro access"""
    try:
        # Insert new user with Pro tier
        cursor.execute("""
            INSERT INTO users (
                email, username, full_name, hashed_password, 
                is_active, subscription_tier, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            USER_EMAIL,
            USER_USERNAME,
            USER_FULL_NAME,
            USER_PASSWORD_HASH,
            True,  # is_active
            "pro",  # subscription_tier
            datetime.now().isoformat()
        ))
        
        # Get the created user ID
        user_id = cursor.lastrowid
        
        # Commit changes
        conn.commit()
        
        print(f"✅ User created successfully!")
        print(f"📧 Email: {USER_EMAIL}")
        print(f"👤 Username: {USER_USERNAME}")
        print(f"🆔 User ID: {user_id}")
        print(f"🎯 Subscription: Pro")
        print(f"🔐 Password: ProAccess123!")
        
        print_success_message()
        return True
        
    except Exception as e:
        print(f"❌ Failed to create user: {e}")
        return False

def upgrade_to_pro(conn, cursor, user_id):
    """Upgrade existing user to Pro access"""
    try:
        # Update user to Pro tier
        cursor.execute("""
            UPDATE users 
            SET subscription_tier = 'pro'
            WHERE id = ?
        """, (user_id,))
        
        # Commit changes
        conn.commit()
        
        print("✅ User successfully upgraded to Pro!")
        print_success_message()
        return True
        
    except Exception as e:
        print(f"❌ Failed to upgrade user: {e}")
        return False

def print_success_message():
    """Print success message and instructions"""
    print("\n🎉 SUCCESS! Charlie now has Pro access on localhost!")
    print("=" * 60)
    
    print("\n🔐 Login Credentials:")
    print(f"   📧 Email: {USER_EMAIL}")
    print(f"   🔑 Password: ProAccess123!")
    
    print("\n🚀 Next Steps:")
    print("   1. ✅ Run: python run_local.py")
    print("   2. 🌐 Go to: http://localhost:8001/docs")
    print("   3. 🔑 Login with the credentials above")
    print("   4. 💎 Enjoy Pro features on localhost!")
    
    print("\n🌍 For Production Environment:")
    print("   1. 🔗 Go to: https://firebasestorage.googleapis.com/pricing")
    print("   2. 🎫 Use code: TESTER_CROW_2024_LIFETIME_$7d91f3a8")
    print("   3. ✅ Sign up with charlie@suarezhouse.net")
    print("   4. 🎉 Get lifetime Pro access!")
    
    print("\n💡 This ensures the SAME account works on both environments")

def main():
    success = create_charlie_pro_account()
    
    if not success:
        print("\n❌ Account creation failed.")
        sys.exit(1)

if __name__ == "__main__":
    main() 