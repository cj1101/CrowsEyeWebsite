import sqlite3

print("Creating Charlie Pro account...")

# Connect to database
conn = sqlite3.connect('crow_eye_local.db')
cursor = conn.cursor()

# Insert user with Pro access
cursor.execute("""
INSERT OR REPLACE INTO users 
(email, username, full_name, hashed_password, is_active, subscription_tier, created_at) 
VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
""", (
    'charlie@suarezhouse.net',
    'charlie_pro', 
    'Charlie Pro User',
    '$2b$12$LQv3c1yqBwEHxPu7pkgF.UJ1Z3Xe3V8A1k3Xe3V8A1k3Xe3V8A1k3X',
    1,
    'pro'
))

# Commit changes
conn.commit()

# Verify creation
cursor.execute("SELECT id, email, subscription_tier FROM users WHERE email = ?", 
               ('charlie@suarezhouse.net',))
result = cursor.fetchone()

if result:
    print(f"SUCCESS! User created: ID={result[0]}, Email={result[1]}, Tier={result[2]}")
    print("")
    print("Login Credentials:")
    print("  Email: charlie@suarezhouse.net")
    print("  Password: ProAccess123!")
    print("")
    print("Next Steps:")
    print("  1. Run: python run_local.py")
    print("  2. Go to: http://localhost:8001/docs")
    print("  3. Login with credentials above")
    print("  4. Enjoy Pro features!")
    print("")
    print("For Production:")
    print("  1. Go to: https://firebasestorage.googleapis.com/pricing")
    print("  2. Use code: TESTER_CROW_2024_LIFETIME_$7d91f3a8")
    print("  3. Sign up with charlie@suarezhouse.net")
else:
    print("FAILED to create user")

conn.close() 