"""
Simplified dependencies for Crow's Eye API
"""

# Simple in-memory database simulation
class SimpleDatabaseManager:
    def __init__(self):
        self.users = {}
        self.posts = {}
        self.media = {}
        
    def authenticate_user(self, email: str, password: str):
        # Simple demo authentication
        if email == "demo@example.com" and password == "demo123":
            return {
                'id': 'user_123',
                'email': email,
                'display_name': 'Demo User',
                'first_name': 'Demo',
                'last_name': 'User',
                'plan': 'pro',
                'is_super_user': False
            }
        return None
    
    def create_user(self, email: str, display_name: str, password: str, **kwargs):
        user_id = f"user_{len(self.users) + 1}"
        self.users[user_id] = {
            'id': user_id,
            'email': email,
            'display_name': display_name,
            'password': password
        }
        return user_id

# Global simple database manager
db_manager = SimpleDatabaseManager() 