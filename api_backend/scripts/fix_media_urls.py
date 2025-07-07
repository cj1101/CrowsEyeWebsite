import argparse
import asyncio
import os
import sys
from urllib.parse import quote
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from crow_eye_api.core.config import settings
from crow_eye_api.models.media import MediaItem

async def fix_media_urls(db_url: str):
    """
    Connects to the database and corrects the URLs for all media items.
    This script will update the gcs_path for each media item to the correct
    Firebase Storage URL format.
    """
    if not db_url:
        db_url = settings.DATABASE_URL
        if "sqlite" in db_url:
            # The default relative path is from inside the `scripts` directory.
            # We need to adjust it to be relative to the project root.
            db_url = "sqlite+aiosqlite:///./crow_eye_local.db"
            print(f"Using default SQLite database: {db_url}")
    else:
        print(f"Using database specified via command line: {db_url}")

    engine = create_async_engine(db_url, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    print("Starting media URL migration...")

    async with AsyncSessionLocal() as db:
        try:
            # Use text() to ensure compatibility and prevent SQL injection issues,
            # even though we are just selecting.
            result = await db.execute(text("SELECT id, filename, gcs_path FROM media_items"))
            media_items = result.fetchall()
            
            if not media_items:
                print("No media items found in the database.")
                return

            print(f"Found {len(media_items)} media items to process.")
            
            updated_count = 0
            for item in media_items:
                item_id, filename, old_gcs_path = item

                if not filename:
                    print(f"WARNING: Media item with ID {item_id} has no filename. Skipping.")
                    continue

                # Construct the correct Firebase Storage URL
                # This logic should match the fix in services/storage.py
                bucket_name = settings.GOOGLE_CLOUD_STORAGE_BUCKET
                if not bucket_name or 'your-storage-bucket-name' in bucket_name:
                    print("ERROR: GOOGLE_CLOUD_STORAGE_BUCKET is not configured correctly in your .env file.")
                    print("Please set it to your correct Firebase project ID (e.g., 'crows-eye-website').")
                    return
                
                # The bucket name for the URL should not have '.appspot.com'.
                firebase_bucket_name = bucket_name.replace('.appspot.com', '')
                
                # The filename (blob name) needs to be URL-encoded.
                encoded_blob_name = quote(filename, safe='')
                
                correct_url = f"https://firebasestorage.googleapis.com/v0/b/{firebase_bucket_name}/o/{encoded_blob_name}?alt=media"

                if old_gcs_path != correct_url:
                    # Update the database record
                    await db.execute(
                        text("UPDATE media_items SET gcs_path = :url WHERE id = :id"),
                        params={"url": correct_url, "id": item_id}
                    )
                    print(f"  - Updating item {item_id}:")
                    print(f"    Old URL: {old_gcs_path}")
                    print(f"    New URL: {correct_url}")
                    updated_count += 1
                else:
                    print(f"  - Item {item_id} already has the correct URL. Skipping.")

            await db.commit()
            print(f"\nMigration complete. {updated_count} items updated.")

        except Exception as e:
            print(f"\nAn error occurred: {e}")
            print("Migration failed. Please check your database connection and configuration.")
            await db.rollback()
        finally:
            await engine.dispose()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fix media URLs in the database.")
    parser.add_argument("--db-url", help="The database URL to connect to.")
    args = parser.parse_args()

    # Ensure the environment is loaded (especially for GOOGLE_CLOUD_STORAGE_BUCKET)
    from dotenv import load_dotenv
    # Load .env from the api_backend directory
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(dotenv_path=dotenv_path)
    
    print("Running URL migration script...")
    asyncio.run(fix_media_urls(args.db_url))