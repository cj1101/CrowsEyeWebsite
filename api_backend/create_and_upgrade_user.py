#!/usr/bin/env python3
"""
Comprehensive user creation and upgrade script
- Creates charlie@suarezhouse.net in local SQLite with Pro access
- Provides instructions for production upgrade
"""

import os
import sys
import sqlite3
from datetime import datetime, timedelta
import json

USER_EMAIL = "charlie@suarezhouse.net"
USER_PASSWORD_HASH = "$2b$12$nFHlsVVCWtC7jrwH5WTqOOj4OiPwBnBJrOPvR/ugn5FXabvjuLQHK"  # ProAccess123!

def create_and_upgrade_user():
    """Create user in local SQLite database with Pro access"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'crow_eye_local.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Local database not found at: {db_path}")
        print("💡 Run 'python run_local.py' first to create the database")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
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
                return True
            else:
                print("🔄 Upgrading existing user to Pro...")
                return upgrade_existing_user(conn, cursor, user_id)
        else:
            print(f"➕ Creating new user: {USER_EMAIL}")
            return create_new_user_with_pro(conn, cursor)
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if conn:
            conn.close()

def create_new_user_with_pro(conn, cursor):
    """Create a new user with Pro access"""
    try:
        # Create user with Pro tier
        lifetime_expiry = datetime.now() + timedelta(days=365 * 100)  # 100 years = lifetime
        
        # Pro usage limits
        pro_usage_limits = {
            "max_linked_accounts": 50,
            "max_ai_credits": 5000,
            "max_scheduled_posts": 1000,
            "max_media_storage_mb": 100000
        }
        
        # Pro plan features
        pro_features = {
            "advanced_content": True,
            "analytics": "advanced",
            "team_collaboration": True,
            "custom_branding": True,
            "api_access": True,
            "priority_support": True,
            "video_ai": True,
            "unlimited_posts": True
        }
        
        # User metadata
        user_metadata = {
            "created_by": "admin_script",
            "account_type": "tester",
            "upgrade_reason": "Lifetime Pro access granted",
            "promo_code_equivalent": "TESTER_CROW_2024_LIFETIME_$7d91f3a8"
        }
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (
                email, password_hash, display_name, subscription_tier, 
                subscription_status, subscription_expires, usage_limits, 
                plan_features, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            USER_EMAIL,
            USER_PASSWORD_HASH,
            "Charlie Pro User",
            "pro",
            "active",
            lifetime_expiry.isoformat(),
            json.dumps(pro_usage_limits),
            json.dumps(pro_features),
            json.dumps(user_metadata),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        # Get the created user ID
        user_id = cursor.lastrowid
        
        # Commit changes
        conn.commit()
        
        print(f"✅ User created successfully with ID: {user_id}")
        print(f"📧 Email: {USER_EMAIL}")
        print(f"🎯 Subscription: Pro (Lifetime)")
        print(f"💎 Features: All Pro features enabled")
        print(f"🔢 Usage limits: 5,000 AI credits, 1,000 posts, 100GB storage")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create user: {e}")
        return False

def upgrade_existing_user(conn, cursor, user_id):
    """Upgrade existing user to Pro access"""
    try:
        # Update user to Pro tier with lifetime access
        lifetime_expiry = datetime.now() + timedelta(days=365 * 100)  # 100 years = lifetime
        
        cursor.execute("""
            UPDATE users 
            SET subscription_tier = 'pro',
                subscription_status = 'active',
                subscription_expires = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (lifetime_expiry.isoformat(), user_id))
        
        # Update usage limits for Pro tier
        pro_usage_limits = {
            "max_linked_accounts": 50,
            "max_ai_credits": 5000,
            "max_scheduled_posts": 1000,
            "max_media_storage_mb": 100000
        }
        
        cursor.execute("""
            UPDATE users 
            SET usage_limits = ?
            WHERE id = ?
        """, (json.dumps(pro_usage_limits), user_id))
        
        # Update plan features for Pro tier
        pro_features = {
            "advanced_content": True,
            "analytics": "advanced",
            "team_collaboration": True,
            "custom_branding": True,
            "api_access": True,
            "priority_support": True,
            "video_ai": True,
            "unlimited_posts": True
        }
        
        cursor.execute("""
            UPDATE users 
            SET plan_features = ?
            WHERE id = ?
        """, (json.dumps(pro_features), user_id))
        
        # Commit changes
        conn.commit()
        
        print("✅ User successfully upgraded to Pro (Lifetime)!")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to upgrade user: {e}")
        return False

def print_production_instructions():
    """Print instructions for production environment"""
    print("\n" + "="*70)
    print("🌐 PRODUCTION ENVIRONMENT INSTRUCTIONS")
    print("="*70)
    print("For the production environment, use the promotional code system:")
    print()
    print("1. 🔗 Go to: https://firebasestorage.googleapis.com/pricing")
    print("2. 🎯 Click 'Start 7-Day Free Trial' on Pro plan")
    print("3. 🎫 Enter code: TESTER_CROW_2024_LIFETIME_$7d91f3a8")
    print("4. ✅ Complete signup with charlie@suarezhouse.net")
    print("5. 🎉 You'll get lifetime Pro access on production!")
    print()
    print("💡 This ensures the SAME account works on both environments")
    print("="*70)

def main():
    print("🔧 Creating/Upgrading charlie@suarezhouse.net to Lifetime Pro Access...")
    print("💾 Database: Local SQLite")
    print("=" * 70)
    
    success = create_and_upgrade_user()
    
    if success:
        print("\n🎉 Local database upgrade completed successfully!")
        print("💡 User now has Pro features on localhost")
        
        # Print production instructions
        print_production_instructions()
        
        print("\n📋 Next steps:")
        print("   1. ✅ Run: python run_local.py (for localhost with Pro access)")
        print("   2. 🌐 Use promotional code on production (see instructions above)")
        print("   3. 🔄 Same account will work on both environments")
        
    else:
        print("\n❌ Local upgrade failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 