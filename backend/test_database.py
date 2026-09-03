from app.database.connection import check_database_connection


try:
    success = check_database_connection()
    if success:
        print("MongoDB connected successfully!")
    else:
        print("MongoDB connection failed or is currently unreachable!")

except Exception as error:
    print("MongoDB connection failed!")
    print(error)