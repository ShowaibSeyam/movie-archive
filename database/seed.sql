-- ============================================================
--  Movie Archive – Seed Data (Railway version)
-- ============================================================

INSERT IGNORE INTO genre (genre_name) VALUES
  ('Action'),('Drama'),('Thriller'),('Sci-Fi'),
  ('Comedy'),('Horror'),('Romance'),('Animation'),
  ('Documentary'),('Fantasy');

INSERT IGNORE INTO director (director_name, nationality, bio) VALUES
  ('Christopher Nolan','British-American','Master of mind-bending narratives and practical effects.'),
  ('Quentin Tarantino','American','Iconic for nonlinear storytelling and sharp dialogue.'),
  ('Steven Spielberg','American','Pioneer of modern blockbuster cinema.'),
  ('Martin Scorsese','American','Legendary filmmaker of gritty crime dramas.'),
  ('Denis Villeneuve','Canadian','Visionary director known for cerebral sci-fi epics.'),
  ('Greta Gerwig','American','Rising auteur blending indie sensibility with mainstream appeal.'),
  ('James Cameron','Canadian','Director of two of the highest-grossing films ever.'),
  ('Ridley Scott','British','Spans sci-fi, historical epic, and thriller genres.');

INSERT IGNORE INTO actor (actor_name, birth_year, nationality) VALUES
  ('Leonardo DiCaprio',1974,'American'),
  ('Tom Hardy',1977,'British'),
  ('Cillian Murphy',1976,'Irish'),
  ('Margot Robbie',1990,'Australian'),
  ('Timothée Chalamet',2000,'American-French'),
  ('Zendaya',1996,'American'),
  ('Ryan Gosling',1980,'Canadian'),
  ('Ana de Armas',1988,'Cuban-Spanish'),
  ('Brad Pitt',1963,'American'),
  ('Anthony Hopkins',1937,'Welsh-American');

INSERT IGNORE INTO movie (title,release_year,genre_id,director_id,rating,description,duration_min,language) VALUES
  ('Inception',2010,4,1,8.8,'A thief who steals corporate secrets through dream-sharing is given the task of planting an idea.',148,'English'),
  ('The Dark Knight',2008,1,1,9.0,'When the Joker unleashes chaos on Gotham, Batman faces his greatest psychological test.',152,'English'),
  ('Pulp Fiction',1994,2,2,8.9,'The lives of two mob hitmen, a boxer, and a gangster intertwine in four tales of violence.',154,'English'),
  ('Dune',2021,4,5,8.0,'Paul Atreides leads nomadic tribes in revolt on the desert planet Arrakis.',155,'English'),
  ('Dune: Part Two',2024,4,5,8.5,'Paul Atreides unites the Fremen on a path of revenge against House Harkonnen.',166,'English'),
  ('Barbie',2023,5,6,6.9,'Barbie and Ken journey from Barbieland to the real world in a quest for identity.',114,'English'),
  ('Interstellar',2014,4,1,8.6,'A team of astronauts travel through a wormhole to find a new home for humanity.',169,'English'),
  ('The Departed',2006,3,4,8.5,'An undercover cop and a mole in the police try to identify each other in an Irish gang.',151,'English'),
  ('Blade Runner 2049',2017,4,5,8.0,'A blade runner discovers a secret that leads him to track down former runner Rick Deckard.',164,'English'),
  ('Gladiator',2000,1,8,8.5,'A Roman general seeks vengeance against the corrupt emperor who murdered his family.',155,'English');

INSERT IGNORE INTO movie_cast (movie_id,actor_id,role_name) VALUES
  (1,1,'Dom Cobb'),(1,2,'Eames'),
  (2,3,'Bruce Wayne'),(3,9,'Pumpkin'),
  (4,5,'Paul Atreides'),(4,6,'Chani'),
  (5,5,'Paul Atreides'),(5,6,'Chani'),
  (6,4,'Barbie'),(6,7,'Ken'),
  (7,1,'Cooper'),(9,7,'K'),(9,8,'Joi');

INSERT IGNORE INTO user (user_name,email,password,role) VALUES
  ('Admin','admin@moviearchive.com',
   '$2b$12$GsEsxbLAHBO0DVQBSo5kp.JnMOUClbxB7mW5lKfvqSEdQXMfHFDaS','admin');

INSERT IGNORE INTO user (user_name,email,password,role) VALUES
  ('Alice','alice@example.com','$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','user'),
  ('Bob','bob@example.com','$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','user');

INSERT IGNORE INTO review (user_id,movie_id,review_text,rating) VALUES
  (2,1,'Mind-blowing concept executed perfectly. Nolan at his peak.',9),
  (3,1,'Confusing at first, but absolutely worth it.',8),
  (2,2,'Heath Ledger''s performance alone makes this a 10/10.',10),
  (3,4,'Stunning visuals. The world-building is extraordinary.',8),
  (2,6,'Surprisingly deep beneath the pink exterior.',7);

INSERT IGNORE INTO watchlist (user_id,movie_id) VALUES (2,4),(2,7),(3,2),(3,5);