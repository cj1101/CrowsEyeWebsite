"""
Message Handler Module
For fetching and responding to comments and direct messages via Meta Graph API
"""
import os
import logging
import json
import time
from typing import List, Dict, Any, Optional, Tuple
import requests

from ..config import constants as const

logger = logging.getLogger(__name__)

class MessagesHandler:
    """Handler for message operations with Meta Graph API."""
    
    def __init__(self):
        """Initialize the messages handler."""
        self.logger = logging.getLogger(self.__class__.__name__)
        self.credentials = None
        
        # Load credentials
        self._load_credentials()
        
    def _load_credentials(self) -> bool:
        """
        Load Meta API credentials from environment variables.
        
        Returns:
            bool: True if credentials were loaded successfully, False otherwise
        """
        try:
            # Check if we have the required environment variables
            app_id = os.environ.get("BREADSMITH_META_APP_ID")
            app_secret = os.environ.get("BREADSMITH_META_APP_SECRET")
            access_token = os.environ.get("BREADSMITH_META_ACCESS_TOKEN")
            
            if not (app_id and app_secret and access_token):
                # Try to load from credentials file as fallback
                try:
                    if os.path.exists(const.META_CREDENTIALS_FILE):
                        with open(const.META_CREDENTIALS_FILE, "r", encoding="utf-8") as f:
                            self.credentials = json.load(f)
                            
                        if self.credentials:
                            self.logger.info("Loaded credentials from file")
                            return True
                except Exception as e:
                    self.logger.warning(f"Could not load credentials from file: {e}")
                
                self.logger.warning("Missing required Meta API environment variables")
                return False
            
            # Create credentials dictionary from environment variables
            self.credentials = {
                "app_id": app_id,
                "app_secret": app_secret,
                "access_token": access_token
            }
            
            self.logger.info("Loaded credentials from environment variables")
            return True
                
        except Exception as e:
            self.logger.exception(f"Error loading credentials: {e}")
            return False
            
    def get_pending_comments(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get pending comments from Instagram posts.
        
        Args:
            limit: Maximum number of comments to retrieve
            
        Returns:
            List of comment dictionaries
        """
        # This is a simulation function for development
        # In production, this would call the Meta Graph API
        comments = []
        
        try:
            # Reload credentials to ensure they're up to date
            if not self._load_credentials():
                return comments
                
            # In development, return mock data
            # In production, would call Instagram Graph API endpoints
            mock_comments = [
                {
                    'id': f'comment_{int(time.time())}1',
                    'type': 'Instagram Comment',
                    'message_type': 'Comment',
                    'sender': 'John Doe',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()) - 900,
                    'content': 'Do you have any gluten-free options available?',
                    'suggested_response': 'Yes, we offer several gluten-free bread options including our popular rice flour loaf and almond flour sandwich bread. Please visit our store or check our weekly menu online for current availability.',
                    'post_id': '123456789',
                    'platform': 'Instagram',
                    'platform_icon': '📷',
                    'source': 'instagram'
                },
                {
                    'id': f'comment_{int(time.time())}2',
                    'type': 'Instagram Comment',
                    'message_type': 'Comment',
                    'sender': 'Mike Johnson',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()) - 1800,
                    'content': 'Love your sourdough! Do you ship nationwide?',
                    'suggested_response': 'Thank you for the kind words about our sourdough! Currently, we don\'t ship nationwide, but we do offer local delivery within a 25-mile radius of our store. We\'re exploring shipping options for the future!',
                    'post_id': '567891234',
                    'platform': 'Instagram',
                    'platform_icon': '📷',
                    'source': 'instagram'
                }
            ]
            
            comments.extend(mock_comments)
            
            self.logger.info(f"Retrieved {len(comments)} pending comments")
            
        except Exception as e:
            self.logger.exception(f"Error getting pending comments: {e}")
            
        return comments
    
    def get_pending_direct_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get pending direct messages from Instagram.
        
        Args:
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries
        """
        # This is a simulation function for development
        # In production, this would call the Meta Graph API
        messages = []
        
        try:
            # Reload credentials to ensure they're up to date
            if not self._load_credentials():
                return messages
                
            # In development, return mock data
            # In production, would call Instagram Graph API endpoints
            mock_messages = [
                {
                    'id': f'dm_{int(time.time())}1',
                    'type': 'Instagram DM',
                    'message_type': 'DM',
                    'sender': 'Jane Smith',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()) - 450,
                    'content': 'What are your store hours on Sundays?',
                    'suggested_response': 'Our store is open from 8:00 AM to 2:00 PM on Sundays. We often sell out of popular items by noon, so we recommend coming early for the best selection!',
                    'conversation_id': '987654321',
                    'platform': 'Instagram',
                    'platform_icon': '📷',
                    'source': 'instagram'
                }
            ]
            
            messages.extend(mock_messages)
            
            self.logger.info(f"Retrieved {len(messages)} pending direct messages")
            
        except Exception as e:
            self.logger.exception(f"Error getting pending direct messages: {e}")
            
        return messages
    
    def get_all_pending_messages(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get all pending comments and direct messages from all platforms.
        
        Args:
            limit: Maximum total number of messages to retrieve
            
        Returns:
            List of message dictionaries with platform information
        """
        all_messages = []
        
        # Get Instagram comments and DMs
        instagram_comments = self.get_pending_comments(limit // 4)
        instagram_messages = self.get_pending_direct_messages(limit // 4)
        all_messages.extend(instagram_comments)
        all_messages.extend(instagram_messages)
        
        # Get WhatsApp messages
        whatsapp_messages = self.get_pending_whatsapp_messages(limit // 4)
        all_messages.extend(whatsapp_messages)
        
        # Get Facebook messages
        facebook_messages = self.get_pending_facebook_messages(limit // 4)
        all_messages.extend(facebook_messages)
        
        # Get Bluesky messages (future platform support)
        # bluesky_messages = self.get_pending_bluesky_messages(limit // 4)
        # all_messages.extend(bluesky_messages)
        
        # Sort by time (most recent first)
        all_messages.sort(key=lambda x: x.get('timestamp', x.get('time', '')), reverse=True)
        
        # Limit to requested amount
        return all_messages[:limit]
    
    def get_pending_whatsapp_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get pending WhatsApp messages.
        
        Args:
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of WhatsApp message dictionaries
        """
        messages = []
        
        try:
            # In production, this would integrate with WhatsApp Business API
            # For now, return mock WhatsApp data
            mock_whatsapp_messages = [
                {
                    'id': f'wa_{int(time.time())}1',
                    'type': 'WhatsApp Message',
                    'message_type': 'DM',
                    'sender': 'Sarah Wilson',
                    'sender_phone': '+1234567890',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()),
                    'content': 'Hi! Do you deliver fresh bread daily? I\'m looking for whole grain options.',
                    'suggested_response': 'Hello Sarah! Yes, we bake and deliver fresh bread daily. We have several whole grain options including our signature 12-grain loaf and whole wheat sourdough. Would you like me to check our delivery schedule for your area?',
                    'conversation_id': f'wa_conv_{int(time.time())}',
                    'platform': 'WhatsApp',
                    'platform_icon': '💬',
                    'source': 'whatsapp'
                },
                {
                    'id': f'wa_{int(time.time())}2',
                    'type': 'WhatsApp Message',
                    'message_type': 'DM',
                    'sender': 'David Chen',
                    'sender_phone': '+0987654321',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()) - 300,
                    'content': 'Can I place a bulk order for office catering? Need 50 sandwiches by Friday.',
                    'suggested_response': 'Absolutely! We handle office catering orders regularly. For 50 sandwiches, I recommend placing the order 48 hours in advance. Would you like our assorted sandwich platter or specific preferences? I can send you our catering menu.',
                    'conversation_id': f'wa_conv_{int(time.time())}_2',
                    'platform': 'WhatsApp',
                    'platform_icon': '💬',
                    'source': 'whatsapp'
                }
            ]
            
            messages.extend(mock_whatsapp_messages)
            self.logger.info(f"Retrieved {len(messages)} pending WhatsApp messages")
            
        except Exception as e:
            self.logger.exception(f"Error getting WhatsApp messages: {e}")
            
        return messages
    
    def get_pending_facebook_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get pending Facebook messages and comments.
        
        Args:
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of Facebook message dictionaries
        """
        messages = []
        
        try:
            # In production, this would call Facebook Graph API
            # For now, return mock Facebook data
            mock_facebook_messages = [
                {
                    'id': f'fb_{int(time.time())}1',
                    'type': 'Facebook Comment',
                    'message_type': 'Comment',
                    'sender': 'Emma Rodriguez',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()) - 600,
                    'content': 'Your croissants look amazing! Do you make them fresh every morning?',
                    'suggested_response': 'Thank you Emma! Yes, we make our croissants fresh every morning starting at 5 AM. They\'re made with real French butter and take 3 days to properly prepare with our traditional lamination process. Come try them warm!',
                    'post_id': f'fb_post_{int(time.time())}',
                    'platform': 'Facebook',
                    'platform_icon': '📘',
                    'source': 'facebook'
                },
                {
                    'id': f'fb_{int(time.time())}2',
                    'type': 'Facebook Message',
                    'message_type': 'DM',
                    'sender': 'Mark Thompson',
                    'time': time.strftime('%Y-%m-%d %H:%M %p'),
                    'timestamp': int(time.time()) - 1200,
                    'content': 'Do you offer birthday cake orders? Looking for a custom design.',
                    'suggested_response': 'Yes, we absolutely do custom birthday cakes! Our baker specializes in custom designs. We need at least 72 hours notice for decorated cakes. Would you like to schedule a consultation to discuss your design ideas?',
                    'conversation_id': f'fb_conv_{int(time.time())}',
                    'platform': 'Facebook',
                    'platform_icon': '📘',
                    'source': 'facebook'
                }
            ]
            
            messages.extend(mock_facebook_messages)
            self.logger.info(f"Retrieved {len(messages)} pending Facebook messages")
            
        except Exception as e:
            self.logger.exception(f"Error getting Facebook messages: {e}")
            
        return messages
    
    def respond_to_comment(self, comment_id: str, response: str) -> bool:
        """
        Respond to a comment on Instagram.
        
        Args:
            comment_id: ID of the comment to respond to
            response: Text response to post
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Reload credentials to ensure they're up to date
            if not self._load_credentials():
                return False
                
            # In production, this would call the Instagram Graph API
            # POST /{comment-id}/replies with the response text
            
            self.logger.info(f"Responded to comment {comment_id}")
            return True
            
        except Exception as e:
            self.logger.exception(f"Error responding to comment: {e}")
            return False
    
    def send_direct_message(self, conversation_id: str, message: str) -> bool:
        """
        Send a direct message on Instagram.
        
        Args:
            conversation_id: ID of the conversation
            message: Text message to send
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Reload credentials to ensure they're up to date
            if not self._load_credentials():
                return False
                
            # In production, this would call the Instagram Graph API
            # POST /{conversation-id}/messages with the message text
            
            self.logger.info(f"Sent direct message to conversation {conversation_id}")
            return True
            
        except Exception as e:
            self.logger.exception(f"Error sending direct message: {e}")
            return False
    
    def generate_response(self, message_content: str) -> str:
        """
        Generate a response for a message using the knowledge base.
        
        Args:
            message_content: Content of the message to respond to
            
        Returns:
            str: Generated response
        """
        try:
            # In production, this would use the knowledge function to generate a response
            # For now, return a placeholder response
            
            # Generate different responses based on content for simulation
            message_lower = message_content.lower()
            
            if "hours" in message_lower or "open" in message_lower:
                return "Our store is open Monday-Friday 7am-7pm, Saturday 8am-6pm, and Sunday 8am-2pm."
                
            elif "gluten" in message_lower or "allergy" in message_lower:
                return "We offer several gluten-free options. Our rice flour loaf and almond flour bread are popular choices. We also clearly label all allergens in our store."
                
            elif "delivery" in message_lower or "shipping" in message_lower:
                return "We offer local delivery within a 25-mile radius of our store. Currently, we don't ship nationwide, but we're exploring options for the future."
                
            elif "price" in message_lower or "cost" in message_lower:
                return "Our bread prices range from $5-$9 depending on the variety. We also offer a loyalty program where every 10th loaf is free!"
                
            else:
                return "Thank you for your message. We value your interest in our bakery. Please visit our store or website for more information about our products and services."
                
        except Exception as e:
            self.logger.exception(f"Error generating response: {e}")
            return "Thank you for your message. A team member will respond to you shortly."

# Create a singleton instance
messages_handler = MessagesHandler() 