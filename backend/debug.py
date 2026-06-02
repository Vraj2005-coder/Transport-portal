import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def main():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    users = await db.users.find({'role': 'driver'}, {'name':1, 'assigned_truck_id':1}).to_list(None)
    trips = await db.trips.find({}, {'vehicle_id':1, 'driver_id':1}).to_list(None)
    expenses = await db.expenses.find({}, {'_id':1, 'amount':1, 'vehicle_id':1, 'trip_id':1}).to_list(None)
    print('Users:', users)
    print('Trips:', trips)
    print('Expenses:', expenses)

if __name__ == '__main__':
    asyncio.run(main())
