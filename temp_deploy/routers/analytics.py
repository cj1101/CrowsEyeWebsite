from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import json
from datetime import datetime, timedelta
import uuid

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview():
    """Get analytics overview dashboard data"""
    return {
        "summary": {
            "total_posts": 150,
            "total_engagement": 12500,
            "total_reach": 45000,
            "engagement_rate": 8.7,
            "follower_growth": 250,
            "top_performing_platform": "instagram"
        },
        "recent_performance": {
            "last_7_days": {
                "posts": 12,
                "engagement": 1850,
                "reach": 8500,
                "engagement_rate": 9.2
            },
            "last_30_days": {
                "posts": 45,
                "engagement": 7200,
                "reach": 28000,
                "engagement_rate": 8.1
            }
        },
        "platform_breakdown": {
            "instagram": {
                "posts": 85,
                "engagement": 8500,
                "reach": 25000,
                "engagement_rate": 10.2
            },
            "other_platforms": {
                "posts": 65,
                "engagement": 4000,
                "reach": 20000,
                "engagement_rate": 6.8
            }
        }
    }

@router.get("/engagement")
async def get_engagement_analytics(
    period: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    platform: Optional[str] = Query(None)
):
    """Get detailed engagement analytics"""
    
    # Generate sample data based on period
    days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90}[period]
    
    engagement_data = []
    for i in range(days):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        engagement_data.append({
            "date": date,
            "likes": 150 + (i * 10),
            "comments": 25 + (i * 2),
            "shares": 12 + i,
            "saves": 30 + (i * 3),
            "total_engagement": 217 + (i * 16)
        })
    
    return {
        "period": period,
        "platform": platform or "all",
        "data": engagement_data,
        "trends": {
            "engagement_trend": "+12%",
            "best_performing_day": "Wednesday",
            "peak_hours": ["18:00", "20:00", "21:00"]
        }
    }

@router.get("/content-performance")
async def get_content_performance():
    """Get content performance metrics"""
    return {
        "top_performing_content": [
            {
                "id": "post_1",
                "title": "Product Launch Video",
                "type": "video",
                "platform": "instagram",
                "engagement_rate": 15.2,
                "reach": 5500,
                "posted_at": "2025-01-03T18:00:00Z"
            },
            {
                "id": "post_2", 
                "title": "Behind the Scenes Photo",
                "type": "image",
                "platform": "instagram",
                "engagement_rate": 12.8,
                "reach": 4200,
                "posted_at": "2025-01-02T16:30:00Z"
            }
        ],
        "content_type_performance": {
            "video": {"avg_engagement_rate": 11.5, "total_posts": 45},
            "image": {"avg_engagement_rate": 9.2, "total_posts": 85},
            "carousel": {"avg_engagement_rate": 13.1, "total_posts": 20}
        },
        "hashtag_performance": {
            "top_hashtags": [
                {"tag": "#innovation", "avg_engagement": 250, "posts_used": 25},
                {"tag": "#quality", "avg_engagement": 180, "posts_used": 30},
                {"tag": "#team", "avg_engagement": 160, "posts_used": 15}
            ]
        }
    }

@router.get("/audience")
async def get_audience_analytics():
    """Get audience demographics and insights"""
    return {
        "demographics": {
            "age_groups": {
                "18-24": 25,
                "25-34": 40,
                "35-44": 20,
                "45-54": 10,
                "55+": 5
            },
            "gender": {
                "female": 55,
                "male": 42,
                "other": 3
            },
            "locations": {
                "United States": 45,
                "Canada": 20,
                "United Kingdom": 15,
                "Australia": 10,
                "Other": 10
            }
        },
        "behavior": {
            "most_active_hours": ["18:00", "19:00", "20:00"],
            "most_active_days": ["Wednesday", "Thursday", "Friday"],
            "avg_session_duration": "2m 45s",
            "bounce_rate": 35
        },
        "growth": {
            "follower_growth_rate": "+5.2%",
            "new_followers_7d": 125,
            "unfollows_7d": 15,
            "net_growth_7d": 110
        }
    }

@router.get("/roi")
async def get_roi_analytics():
    """Get return on investment analytics"""
    return {
        "cost_analysis": {
            "total_ad_spend": 500.00,
            "organic_reach_value": 2500.00,
            "content_creation_cost": 800.00,
            "total_investment": 1300.00
        },
        "returns": {
            "estimated_reach_value": 5500.00,
            "conversion_value": 2200.00,
            "brand_awareness_value": 1800.00,
            "total_return": 9500.00
        },
        "roi_metrics": {
            "roi_percentage": 630,
            "cost_per_engagement": 0.15,
            "cost_per_reach": 0.03,
            "conversion_rate": 3.2
        }
    }

@router.post("/track-event")
async def track_custom_event(
    event_name: str,
    event_data: dict,
    platform: Optional[str] = None
):
    """Track custom analytics event"""
    event_id = str(uuid.uuid4())
    
    return {
        "event_id": event_id,
        "event_name": event_name,
        "platform": platform,
        "tracked_at": datetime.now().isoformat(),
        "status": "recorded",
        "message": "Event tracked successfully"
    } 