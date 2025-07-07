import sqlite3
from datetime import datetime

def setup_charlie():
    USER_EMAIL = "charlie@suarezhouse.net"
    USER_PASSWORD_HASH = "$2b$12$nFHlsVVCWtC7jrwH5WTqOOj4OiPwBnBJrOPvR/ugn5FXabvjuLQHK"
    
    print("Setting up charlie@suarezhouse.net account...")
    
    try:
        conn = sqlite3.connect("crow_eye_local.db")
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", (USER_EMAIL,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            user_id, email, current_tier = existing_user
            print(f"User already exists: {email} (ID: {user_id})")
            print(f"Current subscription tier: {current_tier}")
            
            # Update password and tier
            cursor.execute("UPDATE users SET hashed_password = ?, subscription_tier = 'pro', is_active = 1 WHERE email = ?", 
                         (USER_PASSWORD_HASH, USER_EMAIL))
            print("Updated password and set to Pro tier")
        else:
            print(f"Creating new user: {USER_EMAIL}")
            cursor.execute("""INSERT INTO users (email, username, full_name, hashed_password, is_active, subscription_tier, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)""", 
                         (USER_EMAIL, "charlie", "Charlie Pro User", USER_PASSWORD_HASH, 1, "pro", datetime.now().isoformat()))
            user_id = cursor.lastrowid
            print(f"User created successfully with ID: {user_id}")
        
        conn.commit()
        print("SUCCESS: charlie@suarezhouse.net is ready with Pro access!")
        print("Password: ProAccess123!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    setup_charlie() 