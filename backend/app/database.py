from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_to_mongo():
    """Initialize MongoDB connection on app startup."""
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    # Ping to verify connection
    await db.client.admin.command("ping")
    print(f"[SUCCESS] Connected to MongoDB: {settings.MONGO_DB_NAME}")
    await create_indexes()


async def close_mongo_connection():
    """Close MongoDB connection on app shutdown."""
    db.client.close()
    print("[INFO] MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance."""
    return db.client[settings.MONGO_DB_NAME]


async def create_indexes():
    """Create necessary indexes for performance and uniqueness."""
    database = get_database()

    # users — email and phone must be unique across the entire collection
    await database.users.create_index("email", unique=True)
    await database.users.create_index("phone", unique=True)
    await database.users.create_index("role")

    # trucks — registration number must be globally unique
    await database.trucks.create_index("registration_number", unique=True)
    await database.trucks.create_index("owner_id")

    # refresh_tokens — for efficient lookup and auto-expiry
    await database.refresh_tokens.create_index("user_id")
    await database.refresh_tokens.create_index(
        "expires_at", expireAfterSeconds=0  # TTL index — MongoDB auto-deletes expired tokens
    )

    print("[SUCCESS] Database indexes created")
