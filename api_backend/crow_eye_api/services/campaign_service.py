# Campaign Service
"""
Campaign Management Service

Handles campaign creation, scheduling, queue management, and calendar functionality.
Provides intelligent posting schedule calculation and campaign optimization.
"""

import uuid
import random
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from crow_eye_api import models, schemas

logger = logging.getLogger(__name__)

class CampaignService:
    """Service for managing campaigns and scheduled posts."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def calculate_posting_schedule(
        self,
        campaign: Dict[str, Any],
        start_date: datetime,
        end_date: datetime
    ) -> List[datetime]:
        """
        Calculate all posting times for a campaign based on its rules.
        
        Args:
            campaign: Campaign configuration dictionary
            start_date: Campaign start date
            end_date: Campaign end date
            
        Returns:
            List of calculated posting times
        """
        posting_times = []
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        # Extract campaign settings
        campaign_times = campaign.get("posting_times", ["09:00"])
        posts_per_day = campaign.get("posts_per_day", 1)
        skip_weekends = campaign.get("skip_weekends", False)
        skip_holidays = campaign.get("skip_holidays", False)
        minimum_interval = campaign.get("minimum_interval_minutes", 60)
        randomize_times = campaign.get("randomize_times", False)
        
        # Holiday dates (simple implementation - can be enhanced)
        holidays = {
            date(2024, 1, 1),   # New Year's Day
            date(2024, 7, 4),   # Independence Day
            date(2024, 12, 25), # Christmas
            # Add more holidays as needed
        }
        
        while current_date <= end_date_only:
            # Skip weekends if configured
            if skip_weekends and current_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                current_date += timedelta(days=1)
                continue
            
            # Skip holidays if configured
            if skip_holidays and current_date in holidays:
                current_date += timedelta(days=1)
                continue
            
            # Generate posting times for this day
            day_times = []
            for i in range(posts_per_day):
                if i < len(campaign_times):
                    time_str = campaign_times[i]
                else:
                    # Distribute remaining posts evenly throughout the day
                    base_hour = 9 + (i * 2) % 12
                    time_str = f"{base_hour:02d}:00"
                
                try:
                    hour, minute = map(int, time_str.split(':'))
                except ValueError:
                    logger.warning(f"Invalid time format: {time_str}, using 09:00")
                    hour, minute = 9, 0
                
                # Add randomization if enabled
                if randomize_times:
                    hour_offset = random.randint(-1, 1)
                    minute_offset = random.randint(-30, 30)
                    hour = max(6, min(22, hour + hour_offset))  # Keep between 6 AM and 10 PM
                    minute = max(0, min(59, minute + minute_offset))
                
                post_time = datetime.combine(
                    current_date, 
                    datetime.min.time().replace(hour=hour, minute=minute)
                )
                day_times.append(post_time)
            
            # Sort day times and ensure minimum interval
            day_times.sort()
            filtered_times = []
            last_time = None
            
            for post_time in day_times:
                if last_time is None or (post_time - last_time).total_seconds() >= minimum_interval * 60:
                    filtered_times.append(post_time)
                    last_time = post_time
                else:
                    # Adjust time to meet minimum interval
                    adjusted_time = last_time + timedelta(minutes=minimum_interval)
                    # Don't schedule too late in the day
                    if adjusted_time.hour < 23:
                        filtered_times.append(adjusted_time)
                        last_time = adjusted_time
            
            posting_times.extend(filtered_times)
            current_date += timedelta(days=1)
        
        return posting_times
    
    def optimize_posting_schedule(
        self,
        posting_times: List[datetime],
        platforms: List[str],
        content_themes: List[str] = None
    ) -> List[datetime]:
        """
        Optimize posting schedule based on platform best practices.
        
        Args:
            posting_times: Initial posting times
            platforms: Target platforms
            content_themes: Content themes for optimization
            
        Returns:
            Optimized posting times
        """
        optimized_times = []
        
        # Platform-specific optimization rules
        platform_preferences = {
            "instagram": {"peak_hours": [11, 13, 17, 19], "avoid_hours": [3, 4, 5, 6]},
            "facebook": {"peak_hours": [9, 13, 15], "avoid_hours": [2, 3, 4, 5]},
            "twitter": {"peak_hours": [9, 12, 17, 18], "avoid_hours": [1, 2, 3, 4, 5]},
            "linkedin": {"peak_hours": [8, 9, 12, 17, 18], "avoid_hours": [22, 23, 0, 1, 2, 3, 4, 5, 6]},
            "tiktok": {"peak_hours": [18, 19, 20, 21], "avoid_hours": [2, 3, 4, 5, 6, 7]},
            "youtube": {"peak_hours": [14, 15, 20, 21], "avoid_hours": [2, 3, 4, 5, 6]}
        }
        
        for post_time in posting_times:
            # Find the best time adjustment for the platforms
            best_adjustment = 0
            best_score = 0
            
            for adjustment in range(-3, 4):  # Check ±3 hours
                adjusted_time = post_time + timedelta(hours=adjustment)
                score = 0
                
                for platform in platforms:
                    if platform in platform_preferences:
                        prefs = platform_preferences[platform]
                        if adjusted_time.hour in prefs["peak_hours"]:
                            score += 2
                        elif adjusted_time.hour not in prefs["avoid_hours"]:
                            score += 1
                
                if score > best_score:
                    best_score = score
                    best_adjustment = adjustment
            
            optimized_time = post_time + timedelta(hours=best_adjustment)
            optimized_times.append(optimized_time)
        
        return optimized_times
