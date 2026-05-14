-- ============================================================
--  Movie Archive – Database Schema (Railway version)
-- ============================================================

CREATE TABLE IF NOT EXISTS genre (
  genre_id   INT AUTO_INCREMENT PRIMARY KEY,
  genre_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS director (
  director_id   INT AUTO_INCREMENT PRIMARY KEY,
  director_name VARCHAR(150) NOT NULL,
  nationality   VARCHAR(100),
  bio           TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS actor (
  actor_id    INT AUTO_INCREMENT PRIMARY KEY,
  actor_name  VARCHAR(150) NOT NULL,
  birth_year  INT,
  nationality VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS movie (
  movie_id     INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  release_year INT,
  genre_id     INT,
  director_id  INT,
  rating       DECIMAL(3,1) DEFAULT 0.0,
  description  TEXT,
  poster_url   VARCHAR(500),
  duration_min INT,
  language     VARCHAR(80),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (genre_id)    REFERENCES genre(genre_id)       ON DELETE SET NULL,
  FOREIGN KEY (director_id) REFERENCES director(director_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS movie_cast (
  movie_id  INT NOT NULL,
  actor_id  INT NOT NULL,
  role_name VARCHAR(150),
  PRIMARY KEY (movie_id, actor_id),
  FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES actor(actor_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(200) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('user','admin') DEFAULT 'user',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist (
  user_id  INT NOT NULL,
  movie_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id)  REFERENCES user(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review (
  review_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  movie_id    INT NOT NULL,
  review_text TEXT,
  rating      TINYINT CHECK (rating BETWEEN 1 AND 10),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES user(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_movie (user_id, movie_id)
);

CREATE TRIGGER trg_rating_insert AFTER INSERT ON review FOR EACH ROW
UPDATE movie SET rating=(SELECT COALESCE(AVG(rating),0) FROM review WHERE movie_id=NEW.movie_id)
WHERE movie_id=NEW.movie_id;

CREATE TRIGGER trg_rating_update AFTER UPDATE ON review FOR EACH ROW
UPDATE movie SET rating=(SELECT COALESCE(AVG(rating),0) FROM review WHERE movie_id=NEW.movie_id)
WHERE movie_id=NEW.movie_id;

CREATE TRIGGER trg_rating_delete AFTER DELETE ON review FOR EACH ROW
UPDATE movie SET rating=(SELECT COALESCE(AVG(rating),0) FROM review WHERE movie_id=OLD.movie_id)
WHERE movie_id=OLD.movie_id;