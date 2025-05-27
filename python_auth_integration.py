"""
Firebase Authentication Integration for Python Application
This file demonstrates how to integrate your Python application with the same
Firebase authentication system used by the Crow's Eye website.
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
from datetime import datetime
from typing import Optional, Dict, Any

class CrowsEyeAuth:
    """
    Authentication handler for Crow's Eye Python application
    """
    
    def __init__(self, service_account_path: str):
        """
        Initialize Firebase Admin SDK
        
        Args:
            service_account_path: Path to the Firebase service account JSON file
        """
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
    
    def verify_user_token(self, id_token: str) -> Optional[str]:
        """
        Verify a Firebase ID token from the web application
        
        Args:
            id_token: The Firebase ID token from the web app
            
        Returns:
            User UID if token is valid, None otherwise
        """
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token['uid']
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None
    
    def get_user_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile from Firestore
        
        Args:
            uid: User UID
            
        Returns:
            User profile data or None if not found
        """
        try:
            doc_ref = self.db.collection('users').document(uid)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                # Convert Firestore timestamps to datetime objects
                if 'createdAt' in data:
                    data['createdAt'] = data['createdAt'].replace(tzinfo=None)
                if 'lastLoginAt' in data:
                    data['lastLoginAt'] = data['lastLoginAt'].replace(tzinfo=None)
                return data
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def update_user_profile(self, uid: str, updates: Dict[str, Any]) -> bool:
        """
        Update user profile in Firestore
        
        Args:
            uid: User UID
            updates: Dictionary of fields to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            doc_ref = self.db.collection('users').document(uid)
            doc_ref.update(updates)
            return True
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return False
    
    def is_user_subscribed(self, uid: str, required_plan: str = 'pro') -> bool:
        """
        Check if user has an active subscription
        
        Args:
            uid: User UID
            required_plan: Minimum required plan ('free', 'pro', 'enterprise')
            
        Returns:
            True if user has required subscription, False otherwise
        """
        profile = self.get_user_profile(uid)
        if not profile or 'subscription' not in profile:
            return False
        
        subscription = profile['subscription']
        if subscription.get('status') != 'active':
            return False
        
        plan_hierarchy = {'free': 0, 'pro': 1, 'enterprise': 2}
        user_plan_level = plan_hierarchy.get(subscription.get('plan', 'free'), 0)
        required_plan_level = plan_hierarchy.get(required_plan, 0)
        
        return user_plan_level >= required_plan_level
    
    def log_user_activity(self, uid: str, activity: str, metadata: Dict[str, Any] = None):
        """
        Log user activity to Firestore
        
        Args:
            uid: User UID
            activity: Activity description
            metadata: Additional activity metadata
        """
        try:
            activity_data = {
                'uid': uid,
                'activity': activity,
                'timestamp': datetime.utcnow(),
                'metadata': metadata or {}
            }
            
            self.db.collection('user_activities').add(activity_data)
        except Exception as e:
            print(f"Error logging user activity: {e}")
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email address
        
        Args:
            email: User email address
            
        Returns:
            User data or None if not found
        """
        try:
            user_record = auth.get_user_by_email(email)
            return {
                'uid': user_record.uid,
                'email': user_record.email,
                'display_name': user_record.display_name,
                'photo_url': user_record.photo_url,
                'email_verified': user_record.email_verified,
                'disabled': user_record.disabled
            }
        except Exception as e:
            print(f"Error getting user by email: {e}")
            return None

# Example usage
def example_usage():
    """
    Example of how to use the CrowsEyeAuth class
    """
    # Initialize the auth handler
    auth_handler = CrowsEyeAuth('path/to/serviceAccountKey.json')
    
    # Example 1: Verify a token from the web app
    web_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."  # Token from web app
    uid = auth_handler.verify_user_token(web_token)
    
    if uid:
        print(f"Token verified for user: {uid}")
        
        # Get user profile
        profile = auth_handler.get_user_profile(uid)
        if profile:
            print(f"User: {profile.get('email')}")
            print(f"Plan: {profile.get('subscription', {}).get('plan', 'free')}")
            
            # Check if user can access pro features
            if auth_handler.is_user_subscribed(uid, 'pro'):
                print("User has pro access")
                # Enable pro features
            else:
                print("User needs to upgrade for pro features")
            
            # Log activity
            auth_handler.log_user_activity(uid, "python_app_access", {
                "feature": "data_processing",
                "timestamp": datetime.utcnow().isoformat()
            })
    else:
        print("Invalid token")

# Flask integration example
def flask_integration_example():
    """
    Example of integrating with a Flask application
    """
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    auth_handler = CrowsEyeAuth('path/to/serviceAccountKey.json')
    
    def require_auth(f):
        """Decorator to require authentication"""
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token or not token.startswith('Bearer '):
                return jsonify({'error': 'No token provided'}), 401
            
            token = token.split(' ')[1]
            uid = auth_handler.verify_user_token(token)
            
            if not uid:
                return jsonify({'error': 'Invalid token'}), 401
            
            request.user_uid = uid
            return f(*args, **kwargs)
        
        decorated_function.__name__ = f.__name__
        return decorated_function
    
    def require_subscription(plan='pro'):
        """Decorator to require specific subscription"""
        def decorator(f):
            def decorated_function(*args, **kwargs):
                if not auth_handler.is_user_subscribed(request.user_uid, plan):
                    return jsonify({'error': f'Requires {plan} subscription'}), 403
                return f(*args, **kwargs)
            decorated_function.__name__ = f.__name__
            return decorated_function
        return decorator
    
    @app.route('/api/profile')
    @require_auth
    def get_profile():
        """Get user profile"""
        profile = auth_handler.get_user_profile(request.user_uid)
        return jsonify(profile)
    
    @app.route('/api/pro-feature')
    @require_auth
    @require_subscription('pro')
    def pro_feature():
        """Pro feature endpoint"""
        # Log the activity
        auth_handler.log_user_activity(request.user_uid, "pro_feature_access")
        return jsonify({'message': 'Pro feature accessed successfully'})
    
    return app

if __name__ == "__main__":
    # Run the example
    example_usage() 