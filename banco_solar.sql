CREATE DATABASE bancosolar;

CREATE TABLE usuarios (
id SERIAL PRIMARY KEY,
nombre VARCHAR(50),
balance FLOAT CHECK (balance >= 0)
);

INSERT INTO usuarios VALUES
(DEFAULT, 'Pedro', 5000),
(DEFAULT, 'Carlos', 5000)


CREATE TABLE transferencias (
id SERIAL PRIMARY KEY,
emisor INT,
receptor INT,
monto FLOAT,
fecha TIMESTAMP,
FOREIGN KEY (emisor) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (receptor) REFERENCES usuarios(id) ON DELETE CASCADE
);

SELECT * FROM usuarios;

SELECT * FROM transferencias;

INSERT INTO transferencias VALUES (DEFAULT, 1, 2, 500,NOW());

SELECT t.id, e.nombre, r.nombre, t.monto, t.fecha FROM transferencias t
INNER JOIN usuarios e
ON t.emisor = e.id
INNER JOIN usuarios r
ON t.receptor = r.id;

