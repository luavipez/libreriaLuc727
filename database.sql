CREATE DATABASE IF NOT EXISTS libreria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE libreria_db;

CREATE TABLE libros (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    ejemplares_disponibles INT NOT NULL CHECK (ejemplares_disponibles >= 0),
    fecha_publicacion DATE NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    disponible_venta BOOLEAN DEFAULT TRUE
);

INSERT INTO libros (titulo, autor, isbn, ejemplares_disponibles, fecha_publicacion, precio_venta, disponible_venta)
VALUES 
('Cien años de soledad', 'Gabriel García Márquez', '978-0307474728', 15, '1967-05-30', 389.00, TRUE),
('Pedro Páramo', 'Juan Rulfo', '978-6070728792', 8, '1955-03-19', 245.50, TRUE);
