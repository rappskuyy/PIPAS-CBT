-- ERD Sistem Pembelajaran & Ujian Online PIPAS
-- Cara pakai: buka drawsql.app -> New Diagram -> Import -> From SQL -> tempel isi file ini

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('guru', 'siswa') NOT NULL DEFAULT 'siswa',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

CREATE TABLE rombels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  mapel VARCHAR(100),
  teacher_id BIGINT NOT NULL,
  join_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE rombel_siswa (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rombel_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  FOREIGN KEY (rombel_id) REFERENCES rombels(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (rombel_id, student_id)
);

CREATE TABLE materials (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rombel_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(255),
  type ENUM('pdf', 'link', 'text') NOT NULL DEFAULT 'text',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (rombel_id) REFERENCES rombels(id) ON DELETE CASCADE
);

CREATE TABLE assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rombel_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  attachment_path VARCHAR(255),
  deadline DATETIME NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (rombel_id) REFERENCES rombels(id) ON DELETE CASCADE
);

CREATE TABLE submissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  submitted_at DATETIME NOT NULL,
  status ENUM('ontime', 'late') NOT NULL DEFAULT 'ontime',
  grade TINYINT UNSIGNED,
  feedback TEXT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE ujian (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rombel_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (rombel_id) REFERENCES rombels(id) ON DELETE CASCADE
);

CREATE TABLE soal_ujian (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ujian_id BIGINT NOT NULL,
  question TEXT NOT NULL,
  type ENUM('mc', 'essay') NOT NULL DEFAULT 'mc',
  options JSON,
  correct_answer VARCHAR(255),
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (ujian_id) REFERENCES ujian(id) ON DELETE CASCADE
);

CREATE TABLE hasil_ujian (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ujian_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  answers JSON NOT NULL,
  score TINYINT UNSIGNED,
  submitted_at DATETIME NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (ujian_id) REFERENCES ujian(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (ujian_id, student_id)
);
