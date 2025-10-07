import mysql.connector
from mysql.connector import Error

def setup_database():
    """Setup database and create tables"""
    try:
        # First connect without specifying database
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="CaptainA1918@"
        )
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS user_system")
        print("✓ Database 'user_system' created/verified")
        
        cursor.close()
        conn.close()
        
        # Now connect to the specific database
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="CaptainA1918@",
            database="user_system"
        )
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'users' created/verified")
        
        # Create login_history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS login_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_login_time (login_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'login_history' created/verified")
        
        conn.commit()
        
        # Show existing tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("\n📋 Tables in database:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Show users table structure
        print("\n📊 Users table structure:")
        cursor.execute("DESCRIBE users")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]}")
        
        # Check if there are any users
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"\n👥 Total users in database: {user_count}")
        
        if user_count > 0:
            cursor.execute("SELECT id, username, email, created_at FROM users")
            users = cursor.fetchall()
            print("\n📝 Existing users:")
            for user in users:
                print(f"  ID: {user[0]} | Username: {user[1]} | Email: {user[2]} | Created: {user[3]}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Database setup completed successfully!")
        print("🚀 You can now run: python auth.py")
        
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 Setting up GynAi Database")
    print("=" * 60)
    setup_database()