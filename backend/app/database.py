from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError, OperationFailure
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


async def safe_create_unique_index(collection, field: str):
    """Attempt to create a unique index; warn if duplicate data prevents it."""
    try:
        await collection.create_index(field, unique=True)
    except (DuplicateKeyError, OperationFailure) as e:
        print(
            f"[WARNING] Could not create unique index on '{field}': duplicate data exists. "
            f"Please clean up duplicates in the '{collection.name}' collection. Error: {e}"
        )


async def create_indexes():
    """Create necessary indexes for performance and uniqueness."""
    database = get_database()

    # users — email and phone must be unique across the entire collection
    await safe_create_unique_index(database.users, "email")
    await safe_create_unique_index(database.users, "phone")
    await database.users.create_index("role")

    # trucks — registration number must be globally unique
    await safe_create_unique_index(database.trucks, "registration_number")
    await database.trucks.create_index("owner_id")

    # refresh_tokens — for efficient lookup and auto-expiry
    await database.refresh_tokens.create_index("user_id")
    await database.refresh_tokens.create_index(
        "expires_at", expireAfterSeconds=0  # TTL index — MongoDB auto-deletes expired tokens
    )

    # vehicles — registration number must be globally unique, index status for fast filtering
    await safe_create_unique_index(database.vehicles, "number")
    await database.vehicles.create_index("owner_id")
    await database.vehicles.create_index("status")

    print("[SUCCESS] Database indexes created")
