/* require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pool de conexiones a MySQL usando variables de entorno
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' 
        ? { rejectUnauthorized: false } 
        : undefined
});

// 1. READ: Obtener todos los libros
app.get('/api/libros', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM libros ORDER BY id_libro DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el catálogo en MySQL.' });
    }
});

// 2. CREATE: Registrar un nuevo libro
app.post('/api/libros', async (req, res) => {
    const { titulo, autor, isbn, ejemplares_disponibles, fecha_publicacion, precio_venta, disponible_venta } = req.body;

    if (!titulo || !autor || !isbn || ejemplares_disponibles === undefined || !fecha_publicacion || !precio_venta) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    }

    try {
        const query = `
            INSERT INTO libros (titulo, autor, isbn, ejemplares_disponibles, fecha_publicacion, precio_venta, disponible_venta)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            titulo, 
            autor, 
            isbn, 
            parseInt(ejemplares_disponibles), 
            fecha_publicacion, 
            parseFloat(precio_venta), 
            disponible_venta ? 1 : 0
        ];
        
        const [result] = await pool.query(query, values);
        res.status(201).json({ id_libro: result.insertId, mensaje: 'Libro registrado correctamente.' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El código ISBN ya está registrado en el catálogo.' });
        }
        res.status(500).json({ error: 'Error al guardar el libro en la base de datos.' });
    }
});

// 3. UPDATE: Actualizar ejemplares y disponibilidad
app.put('/api/libros/:id', async (req, res) => {
    const { id } = req.params;
    const { ejemplares_disponibles, disponible_venta } = req.body;

    try {
        const query = `
            UPDATE libros 
            SET ejemplares_disponibles = ?, disponible_venta = ? 
            WHERE id_libro = ?`;
        const [result] = await pool.query(query, [parseInt(ejemplares_disponibles), disponible_venta ? 1 : 0, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }
        res.json({ mensaje: 'Libro actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el libro.' });
    }
});

// 4. DELETE: Eliminar un libro del catálogo
app.delete('/api/libros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM libros WHERE id_libro = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }
        res.json({ mensaje: 'Libro eliminado del catálogo.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el registro.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Librería lucianoavilalopez ejecutándose en el puerto ${PORT}`);
});
 */



require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    /* ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') 
        ? false 
        : { rejectUnauthorized: false } */
        ssl:{
        rejectUnauthorized: false
        }
});

// 1. READ: Obtener todos los libros
app.get('/api/libros', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM libros ORDER BY id_libro DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el catálogo de la librería.' });
    }
});

// 2. CREATE: Registrar un nuevo libro
app.post('/api/libros', async (req, res) => {
    const { titulo, autor, isbn, ejemplares_disponibles, fecha_publicacion, precio_venta, disponible_venta } = req.body;

    if (!titulo || !autor || !isbn || ejemplares_disponibles === undefined || !fecha_publicacion || !precio_venta) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    }

    try {
        const query = `
            INSERT INTO libros (titulo, autor, isbn, ejemplares_disponibles, fecha_publicacion, precio_venta, disponible_venta)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const values = [
            titulo, 
            autor, 
            isbn, 
            parseInt(ejemplares_disponibles), 
            fecha_publicacion, 
            parseFloat(precio_venta), 
            Boolean(disponible_venta)
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El código ISBN ya está registrado en el catálogo.' });
        }
        res.status(500).json({ error: 'Error al guardar el libro en la base de datos.' });
    }
});

// 3. UPDATE: Actualizar ejemplares y disponibilidad
app.put('/api/libros/:id', async (req, res) => {
    const { id } = req.params;
    const { ejemplares_disponibles, disponible_venta } = req.body;

    try {
        const query = `
            UPDATE libros 
            SET ejemplares_disponibles = $1, disponible_venta = $2 
            WHERE id_libro = $3 RETURNING *`;
        const result = await pool.query(query, [parseInt(ejemplares_disponibles), Boolean(disponible_venta), id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el libro.' });
    }
});

// 4. DELETE: Eliminar un libro del catálogo
app.delete('/api/libros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM libros WHERE id_libro = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }
        res.json({ mensaje: 'Libro eliminado del catálogo.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el registro.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Librería lucianoavilalopez ejecutándose en el puerto ${PORT}`);
});
