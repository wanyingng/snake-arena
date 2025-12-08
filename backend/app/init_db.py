"""Initialize the database with tables and optional seed data"""
from app.database import init_db, _init_fake_data
from app.config import settings
import sys


def main():
    """Initialize database and optionally seed with fake data"""
    print(f"Initializing database at: {settings.database_url}")
    
    # Create tables
    init_db()
    print("✓ Database tables created")
    
    # Seed with fake data if requested
    if "--seed" in sys.argv:
        print("Seeding database with fake data...")
        _init_fake_data()
        print("✓ Fake data added")
    
    print("\nDatabase initialization complete!")


if __name__ == "__main__":
    main()
