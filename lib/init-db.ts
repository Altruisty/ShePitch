import pool from './db';
import bcrypt from 'bcryptjs';

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return { success: true };

  const connection = await pool.getConnection();
  try {
    // 1. she_pitch_admins
    await connection.query(`
      CREATE TABLE IF NOT EXISTS she_pitch_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. she_pitch_colleges
    await connection.query(`
      CREATE TABLE IF NOT EXISTS she_pitch_colleges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        college_name VARCHAR(255) NOT NULL UNIQUE,
        rep_name VARCHAR(150) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. she_pitch_teams
    await connection.query(`
      CREATE TABLE IF NOT EXISTS she_pitch_teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        project_title VARCHAR(255) DEFAULT '',
        domain VARCHAR(150) DEFAULT '',
        project_description TEXT DEFAULT NULL,
        college_id INT NULL,
        college_name VARCHAR(255) NOT NULL,
        leader_name VARCHAR(150) NOT NULL,
        leader_email VARCHAR(150) NOT NULL,
        leader_phone VARCHAR(50) NOT NULL,
        member_count INT DEFAULT 2,
        coupon_code VARCHAR(50) DEFAULT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0.00,
        amount_paid DECIMAL(10,2) DEFAULT 0.00,
        payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
        razorpay_order_id VARCHAR(150) DEFAULT NULL,
        razorpay_payment_id VARCHAR(150) DEFAULT NULL,
        razorpay_signature VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_college (college_id),
        INDEX idx_status (payment_status),
        INDEX idx_order (razorpay_order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Auto-migrate new columns for existing table instances
    try { await connection.query(`ALTER TABLE she_pitch_teams ADD COLUMN project_title VARCHAR(255) DEFAULT ''`); } catch (_) {}
    try { await connection.query(`ALTER TABLE she_pitch_teams ADD COLUMN domain VARCHAR(150) DEFAULT ''`); } catch (_) {}
    try { await connection.query(`ALTER TABLE she_pitch_teams ADD COLUMN project_description TEXT DEFAULT NULL`); } catch (_) {}

    // 4. she_pitch_students
    await connection.query(`
      CREATE TABLE IF NOT EXISTS she_pitch_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        department VARCHAR(150) DEFAULT '',
        year_of_study VARCHAR(50) DEFAULT '',
        is_leader TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES she_pitch_teams(id) ON DELETE CASCADE,
        INDEX idx_team (team_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. she_pitch_payments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS she_pitch_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NULL,
        razorpay_order_id VARCHAR(150) NOT NULL,
        razorpay_payment_id VARCHAR(150) DEFAULT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
        error_description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (razorpay_order_id),
        INDEX idx_team (team_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. she_pitch_email_logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS she_pitch_email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_email VARCHAR(150) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        email_type VARCHAR(100) DEFAULT 'general',
        status ENUM('sent', 'failed') DEFAULT 'sent',
        error_message TEXT DEFAULT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed Default Super Admin if no admin exists
    const [rows]: any = await connection.query(`SELECT COUNT(*) as count FROM she_pitch_admins`);
    if (rows[0].count === 0) {
      const defaultHash = await bcrypt.hash('Admin@123', 10);
      await connection.query(
        `INSERT INTO she_pitch_admins (username, password_hash, name, email) VALUES (?, ?, ?, ?)`,
        ['admin', defaultHash, 'ShePitch Super Admin', 'founder@ztoitech.com']
      );
    }

    // Seed initial default colleges if table is empty
    const [colRows]: any = await connection.query(`SELECT COUNT(*) as count FROM she_pitch_colleges`);
    if (colRows[0].count === 0) {
      const colPass = await bcrypt.hash('Jeppiaar@123', 10);
      await connection.query(
        `INSERT INTO she_pitch_colleges (college_name, rep_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
        ['Jeppiaar University', 'Dr. S. Meenakshi', 'jeppiaar', 'info@jeppiaaruniversity.ac.in', colPass]
      );
    }

    isInitialized = true;
    return { success: true };
  } catch (error: any) {
    throw error;
  } finally {
    connection.release();
  }
}
