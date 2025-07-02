#!/usr/bin/env python3
"""
Script to upgrade charlie@suarezhouse.net to lifetime Pro access on PostgreSQL
This works with the Cloud SQL PostgreSQL database used in production
"""

import os
import sys
import asyncio
import asyncpg
from datetime import datetime, timedelta
import json

# Database configuration - same as production
DATABASE_CONFIG = {
    "host": "/cloudsql/crows-eye-website:us-central1:crowseye-postgres",
    "database": "crowseye_db",
    "user": "postgres",
    "password": "crowseye2024"
}

USER_EMAIL = "charlie@suarezhouse.net"

async def upgrade_user_to_pro():
    """Upgrade charlie@suarezhouse.net to lifetime Pro access"""
    
    try:
        print("🔗 Connecting to PostgreSQL Cloud SQL database...")
        
        # Connect to PostgreSQL
        conn = await asyncpg.connect(
            host=DATABASE_CONFIG["host"],
            database=DATABASE_CONFIG["database"],
            user=DATABASE_CONFIG["user"],
            password=DATABASE_CONFIG["password"]
        )
        
        print("✅ Connected to database successfully")
        
        # Check if user exists
        user_query = """
            SELECT id, email, subscription_tier, subscription_status, subscription_expires
            FROM users 
            WHERE email = $1
        """
        user = await conn.fetchrow(user_query, USER_EMAIL)
        
        if not user:
            print(f"❌ User {USER_EMAIL} not found in database")
            print("💡 User may need to register first on the platform")
            return False
        
        user_id = user['id']
        current_tier = user['subscription_tier']
        current_status = user['subscription_status']
        
        print(f"📋 Found user: {USER_EMAIL} (ID: {user_id})")
        print(f"📊 Current subscription tier: {current_tier}")
        print(f"📈 Current subscription status: {current_status}")
        
        # Update user to Pro tier with lifetime access
        lifetime_expiry = datetime.now() + timedelta(days=365 * 100)  # 100 years = lifetime
        
        # Update main user subscription
        update_subscription_query = """
            UPDATE users 
            SET subscription_tier = 'pro',
                subscription_status = 'active',
                subscription_expires = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE email = $2
        """
        
        await conn.execute(update_subscription_query, lifetime_expiry, USER_EMAIL)
        
        # Update usage limits for Pro tier
        pro_usage_limits = {
            "max_linked_accounts": 50,
            "max_ai_credits": 5000,
            "max_scheduled_posts": 1000,
            "max_media_storage_mb": 100000
        }
        
        update_limits_query = """
            UPDATE users 
            SET usage_limits = $1
            WHERE email = $2
        """
        
        await conn.execute(update_limits_query, json.dumps(pro_usage_limits), USER_EMAIL)
        
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
        
        update_features_query = """
            UPDATE users 
            SET plan_features = $1
            WHERE email = $2
        """
        
        await conn.execute(update_features_query, json.dumps(pro_features), USER_EMAIL)
        
        # Add a note about the upgrade
        upgrade_note = {
            "upgraded_by": "admin_script",
            "upgrade_date": datetime.now().isoformat(),
            "upgrade_type": "lifetime_pro",
            "reason": "Tester account - lifetime Pro access granted"
        }
        
        update_metadata_query = """
            UPDATE users 
            SET metadata = COALESCE(metadata, '{}')::jsonb || $1::jsonb
            WHERE email = $2
        """
        
        await conn.execute(update_metadata_query, json.dumps(upgrade_note), USER_EMAIL)
        
        # Verify the update
        verify_query = """
            SELECT subscription_tier, subscription_status, subscription_expires, 
                   usage_limits, plan_features, metadata
            FROM users 
            WHERE email = $1
        """
        
        updated_user = await conn.fetchrow(verify_query, USER_EMAIL)
        
        if updated_user:
            print("\n✅ User successfully upgraded to Pro (Lifetime)!")
            print(f"📊 New subscription tier: {updated_user['subscription_tier']}")
            print(f"📈 Subscription status: {updated_user['subscription_status']}")
            print(f"⏰ Expires: {updated_user['subscription_expires']}")
            print(f"💎 Pro features enabled: ✅")
            print(f"🎯 Usage limits: 5,000 AI credits, 1,000 scheduled posts, 100GB storage")
            print(f"🔄 Database: PostgreSQL Cloud SQL (same as production)")
            
            # Show the promotional code for reference
            print(f"\n🎫 Promotional Code Reference: TESTER_CROW_2024_LIFETIME_$7d91f3a8")
            print("💡 This upgrade grants the same access as the lifetime promotional code")
            
            return True
        else:
            print("❌ Failed to verify user update")
            return False
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if 'conn' in locals():
            await conn.close()

async def main():
    print("🔧 Upgrading charlie@suarezhouse.net to Lifetime Pro Access...")
    print("💾 Database: PostgreSQL Cloud SQL")
    print("=" * 70)
    
    success = await upgrade_user_to_pro()
    
    if success:
        print("\n🎉 Upgrade completed successfully!")
        print("💡 Changes are immediately active on both localhost and production")
        print("🌐 User will see Pro features on next login (any environment)")
        print("\n📋 Next steps:")
        print("   1. Use: python run_local_with_cloud_db.py (for localhost)")
        print("   2. Your account now has lifetime Pro access")
        print("   3. Same account works on localhost AND production")
    else:
        print("\n❌ Upgrade failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 