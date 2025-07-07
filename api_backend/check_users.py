import sqlite3

def check_users():
    conn = sqlite3.connect('crow_eye_local.db')
    cursor = conn.cursor()
    
    # Check all users
    cursor.execute('SELECT id, email, username, subscription_tier, hashed_password FROM users')
    users = cursor.fetchall()
    
    print(f'Total users in database: {len(users)}')
    print('-' * 60)
    
    if users:
        for user in users:
            user_id, email, username, tier, hashed_pwd = user
            print(f'ID: {user_id}')
            print(f'Email: {email}')
            print(f'Username: {username}')
            print(f'Subscription: {tier}')
            print(f'Password hash: {hashed_pwd[:20]}...{hashed_pwd[-10:]}')
            print('-' * 60)
    else:
        print('No users found in database')
    
    conn.close()

if __name__ == "__main__":
    check_users() 