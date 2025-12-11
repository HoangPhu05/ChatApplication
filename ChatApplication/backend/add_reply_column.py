import psycopg2
from app.core.config import settings

# Connect to database
conn = psycopg2.connect(settings.DATABASE_URL)
cur = conn.cursor()

try:
    # Add reply_to_id column to messages table
    cur.execute("""
        ALTER TABLE messages 
        ADD COLUMN IF NOT EXISTS reply_to_id INTEGER REFERENCES messages(id);
    """)
    
    conn.commit()
    print("✅ Successfully added reply_to_id column to messages table")
    
except Exception as e:
    conn.rollback()
    print(f"❌ Error: {e}")
    
finally:
    cur.close()
    conn.close()
