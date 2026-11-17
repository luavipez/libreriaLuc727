const API_URL = '/api/libros';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fecha_publicacion').valueAsDate = new Date();
    cargarLibros();
});

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.getElementById('alerta');
    alerta.textContent = mensaje;
    alerta.className = `alert alert-${tipo}`;
    setTimeout(() => alerta.className = 'alert d-none', 4000);
}

// READ: Cargar catálogo de libros
async function cargarLibros() {
    try {
        const res = await fetch(API_URL);
        const libros = await res.json();
        const tbody = document.getElementById('tablaLibros');
        tbody.innerHTML = '';

        libros.forEach(libro => {
            const fecha = new Date(libro.fecha_publicacion).toISOString().split('T');
            const badgeEstado = libro.disponible_venta 
                ? '<span class="badge bg-success">En Venta</span>' 
                : '<span class="badge bg-secondary">Agotado / Pausado</span>';

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="fw-bold">${libro.titulo}</div>
                        <div class="text-muted small">${libro.autor}</div>
                    </td>
                    <td><code>${libro.isbn}</code></td>
                    <td>${libro.ejemplares_disponibles}</td>
                    <td>$${parseFloat(libro.precio_venta).toFixed(2)}</td>
                    <td>${fecha}</td>
                    <td>${badgeEstado}</td>
                    <td>
                        <button onclick="editarLibro(${libro.id_libro}, ${libro.ejemplares_disponibles})" class="btn btn-sm btn-outline-primary me-1">Editar</button>
                        <button onclick="eliminarLibro(${libro.id_libro})" class="btn btn-sm btn-outline-danger">Borrar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        mostrarAlerta('Error al conectar con el servidor de Librería lucianoavilalopez.', 'danger');
    }
}

// CREATE: Registrar nuevo libro
document.getElementById('formLibro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoLibro = {
        titulo: document.getElementById('titulo').value.trim(),
        autor: document.getElementById('autor').value.trim(),
        isbn: document.getElementById('isbn').value.trim(),
        ejemplares_disponibles: document.getElementById('ejemplares_disponibles').value,
        precio_venta: document.getElementById('precio_venta').value,
        fecha_publicacion: document.getElementById('fecha_publicacion').value,
        disponible_venta: document.getElementById('disponible_venta').checked
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoLibro)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        mostrarAlerta('Libro agregado al catálogo exitosamente.', 'success');
        document.getElementById('formLibro').reset();
        document.getElementById('fecha_publicacion').valueAsDate = new Date();
        cargarLibros();
    } catch (error) {
        mostrarAlerta(error.message, 'danger');
    }
});

// UPDATE: Editar stock y estado de venta
async function editarLibro(id, stockActual) {
    const nuevoStock = prompt('Ingresa la nueva cantidad de ejemplares disponibles:', stockActual);
    if (nuevoStock === null || isNaN(nuevoStock) || nuevoStock < 0) return;

    const disponible = confirm('¿El libro está DISPONIBLE para venta al público? (Aceptar = Sí / Cancelar = No)');

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ejemplares_disponibles: nuevoStock, disponible_venta: disponible })
        });

        if (!res.ok) throw new Error('No se pudo actualizar el libro.');
        mostrarAlerta('Inventario actualizado correctamente.', 'info');
        cargarLibros();
    } catch (error) {
        mostrarAlerta(error.message, 'danger');
    }
}

// DELETE: Eliminar libro
async function eliminarLibro(id) {
    if (!confirm('¿Confirmas que deseas eliminar este libro del catálogo de Librería lucianoavilalopez?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('No se pudo eliminar el registro.');
        mostrarAlerta('Libro eliminado del sistema.', 'warning');
        cargarLibros();
    } catch (error) {
        mostrarAlerta(error.message, 'danger');
    }
}
