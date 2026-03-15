import { pool } from './db';

const createTables = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    console.log("Creating tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gyms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        owner_name VARCHAR(255),
        contact_info VARCHAR(255),
        currency VARCHAR(10) DEFAULT 'INR',
        timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        profile_image TEXT,
        role VARCHAR(50) DEFAULT 'MEMBER', 
        gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS membership_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price FLOAT NOT NULL,
        duration INT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS member_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        phone VARCHAR(50),
        date_of_birth DATE,
        gender VARCHAR(20),
        address TEXT,
        start_date TIMESTAMP,
        expiry_date TIMESTAMP,
        trainer_id UUID, 
        plan_id UUID REFERENCES membership_plans(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS trainer_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        specialization VARCHAR(255),
        phone VARCHAR(50)
      );

      ALTER TABLE member_profiles
      ADD CONSTRAINT fk_trainer
      FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
        amount FLOAT NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING'
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
        check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out TIMESTAMP,
        date DATE NOT NULL
      );
    `);

    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables: ", error);
  } finally {
    pool.end();
  }
};

createTables();
