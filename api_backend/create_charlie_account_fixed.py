#!/usr/bin/env python3
"""
Simple script to create/update charlie@suarezhouse.net account
"""

import sqlite3
from datetime import datetime

USER_EMAIL = "charlie@suarezhouse.net"
USER_PASSWORD_HASH = "$2b$12$nFHlsVVCWtC7jrwH5WTqOOj4OiPwBnBJrOPvR/ugn5FXabvjuLQHK"  # ProAccess123!

def create_charlie_account():
    """Create or update charlie@suarezhouse.net account"""
    
    try:
        # Connect to database
        conn = sqlite3.connect('crow_eye_local.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", (USER_EMAIL,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            user_id, email, current_tier = existing_user
            print(f"✅ User already exists: {email} (ID: {user_id})")
            print(f"📊 Current subscription tier: {current_tier}")
            
            # Update password and ensure Pro tier
            cursor.execute("""
                UPDATE users 
                SET hashed_password = ?, subscription_tier = 'pro', is_active = 1
                WHERE email = ?
            """, (USER_PASSWORD_HASH, USER_EMAIL))
            
            print("🔄 Updated password and set to Pro tier")
        else:
            print(f"➕ Creating new user: {USER_EMAIL}")
            
            # Insert new user
            cursor.execute("""
                INSERT INTO users (
                    email, username, full_name, hashed_password, 
                    is_active, subscription_tier, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                USER_EMAIL,
                "charlie",
                "Charlie Pro User",
                USER_PASSWORD_HASH,
                1,  # is_active = True
                "pro",
                datetime.now().isoformat()
            ))
            
            user_id = cursor.lastrowid
            print(f"✅ User created successfully with ID: {user_id}")
        
        # Commit changes
        conn.commit()
        
        print(f"🎉 charlie@suarezhouse.net is ready with Pro access!")
        print(f"🔑 Password: ProAccess123!")
        print(f"🎯 Subscription: Pro")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔧 Setting up charlie@suarezhouse.net account...")
    print("="*50)
    
    success = create_charlie_account()
    
    if success:
        print("\n✅ Account setup completed!")
        print("💡 You can now login with:")
        print("   📧 Email: charlie@suarezhouse.net")
        print("   🔑 Password: ProAccess123!")
    else:
        print("\n❌ Account setup failed.") 