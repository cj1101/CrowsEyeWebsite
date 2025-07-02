#!/usr/bin/env python3
"""
Script to upgrade charlie@suarezhouse.net to lifetime Pro access
Run this script to give the user permanent Pro tier access
"""

import os
import sys
import sqlite3
from datetime import datetime, timedelta

def upgrade_user_to_pro():
    """Upgrade charlie@suarezhouse.net to lifetime Pro access"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'crow_eye_api', 'data', 'crow_eye.db')
    
    if not os.path.exists(db_path):
        # Try alternative path
        db_path = os.path.join(os.path.dirname(__file__), 'test.db')
    
    if not os.path.exists(db_path):
        print("❌ Database not found. Expected paths:")
        print(f"   - {os.path.join(os.path.dirname(__file__), 'crow_eye_api', 'data', 'crow_eye.db')}")
        print(f"   - {os.path.join(os.path.dirname(__file__), 'test.db')}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", 
                      ("charlie@suarezhouse.net",))
        user = cursor.fetchone()
        
        if not user:
            print("❌ User charlie@suarezhouse.net not found in database")
            return False
        
        user_id, email, current_tier = user
        print(f"📋 Found user: {email} (ID: {user_id})")
        print(f"📊 Current subscription tier: {current_tier}")
        
        # Update user to Pro tier with lifetime access
        lifetime_expiry = datetime.now() + timedelta(days=365 * 100)  # 100 years = lifetime
        
        cursor.execute("""
            UPDATE users 
            SET subscription_tier = 'pro',
                subscription_status = 'active',
                subscription_expires = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE email = ?
        """, (lifetime_expiry.isoformat(), "charlie@suarezhouse.net"))
        
        # Update usage limits for Pro tier
        cursor.execute("""
            UPDATE users 
            SET usage_limits = json_replace(
                COALESCE(usage_limits, '{}'),
                '$.max_linked_accounts', 50,
                '$.max_ai_credits', 5000,
                '$.max_scheduled_posts', 1000,
                '$.max_media_storage_mb', 100000
            )
            WHERE email = ?
        """, ("charlie@suarezhouse.net",))
        
        # Update plan features for Pro tier
        cursor.execute("""
            UPDATE users 
            SET plan_features = json_replace(
                COALESCE(plan_features, '{}'),
                '$.advanced_content', true,
                '$.analytics', 'advanced',
                '$.team_collaboration', true,
                '$.custom_branding', true,
                '$.api_access', true,
                '$.priority_support', true
            )
            WHERE email = ?
        """, ("charlie@suarezhouse.net",))
        
        # Commit changes
        conn.commit()
        
        # Verify the update
        cursor.execute("""
            SELECT subscription_tier, subscription_status, subscription_expires, 
                   usage_limits, plan_features 
            FROM users WHERE email = ?
        """, ("charlie@suarezhouse.net",))
        
        updated_user = cursor.fetchone()
        if updated_user:
            tier, status, expires, limits, features = updated_user
            print("\n✅ User successfully upgraded to Pro (Lifetime)!")
            print(f"📊 New subscription tier: {tier}")
            print(f"📈 Subscription status: {status}")
            print(f"⏰ Expires: {expires}")
            print(f"💎 Pro features enabled: Custom branding, Advanced analytics, API access")
            print(f"🎯 Usage limits: 5,000 AI credits, 1,000 scheduled posts, 100GB storage")
            
            return True
        else:
            print("❌ Failed to verify user update")
            return False
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔧 Upgrading charlie@suarezhouse.net to Lifetime Pro Access...")
    print("=" * 60)
    
    success = upgrade_user_to_pro()
    
    if success:
        print("\n🎉 Upgrade completed successfully!")
        print("💡 The user will see Pro features on their next login")
    else:
        print("\n❌ Upgrade failed. Please check the error messages above.")
        sys.exit(1) 