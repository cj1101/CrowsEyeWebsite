#!/usr/bin/env python3
import sqlite3
import sys

print("Starting script...")
sys.stdout.flush()

try:
    print("Connecting to database...")
    sys.stdout.flush()
    
    conn = sqlite3.connect('crow_eye_local.db')
    cursor = conn.cursor()
    
    print("Connected successfully!")
    sys.stdout.flush()
    
    # Check if charlie exists
    print("Checking for existing user...")
    sys.stdout.flush()
    
    cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", 
                   ("charlie@suarezhouse.net",))
    user = cursor.fetchone()
    
    if user:
        print(f"User exists: {user}")
        sys.stdout.flush()
        
        # Update to Pro
        cursor.execute("UPDATE users SET subscription_tier = 'pro' WHERE email = ?", 
                       ("charlie@suarezhouse.net",))
        conn.commit()
        print("Updated to Pro!")
        sys.stdout.flush()
        
    else:
        print("Creating new user...")
        sys.stdout.flush()
        
        cursor.execute("""
            INSERT INTO users (email, username, full_name, hashed_password, is_active, subscription_tier, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            "charlie@suarezhouse.net",
            "charlie_pro", 
            "Charlie Pro User",
            "$2b$12$test",
            1,  # is_active = True
            "pro"
        ))
        
        conn.commit()
        print("User created with Pro access!")
        sys.stdout.flush()
    
    # Verify
    cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", 
                   ("charlie@suarezhouse.net",))
    result = cursor.fetchone()
    print(f"Final result: {result}")
    sys.stdout.flush()
    
    conn.close()
    print("SUCCESS: charlie@suarezhouse.net now has Pro access!")
    print("Login: charlie@suarezhouse.net / ProAccess123!")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.stdout.flush() 