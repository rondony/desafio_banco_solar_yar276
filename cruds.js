import pool from './database/db.js';

const consultarDB = (consulta) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await pool.query(consulta);
            resolve(result);
        } catch (error) {
            console.log(error);
            reject("No se pudo traer la información de los registros.");
        }
    });
};

const nuevoUsuario = async (nombre, balance) => {
    try {
        const query = {
            text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING id, nombre, balance",
            values: [nombre, balance],
        };
        let results = await consultarDB(query);
        let nuevoUser = results.rows[0];
        console.log(results.rows);
        return nuevoUser
    } catch (error) {
        console.log('Error en la consulta a la base de datos', error);
        throw new Error("Error al intentar agregar un nuevo usuario.");
    }
};

const obtenerUsuarios = async () => {
    try {
        let query = "SELECT * FROM usuarios ORDER BY id";
        let results = await consultarDB(query);
        let usuarios = results.rows;
        return usuarios;
    } catch (error) {
        console.log(error);
        throw new Error("Error al obtener usuarios.");
    }
};

const actualizarUsuario = async (id, name, balance) => {
    console.log(id, name, balance)
    try {
        const query = {
            text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING id, nombre, balance",
            values: [name, balance, id],
        };
        let results = await consultarDB(query);
        let usuarioActualizado = results.rows[0];
        return usuarioActualizado
    } catch (error) {
        console.log(error);
        throw new Error("Error al actualizar usuario.");
    }
};

const eliminarUsuario = async (id) => {
    try {
        const query = {
            text: 'DELETE FROM usuarios WHERE id = $1 RETURNING id',
            values: [id]
        }
        let results = await consultarDB(query);
        if (results.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        throw new Error("Error al eliminar usuario.");
    }
};

const transferencia = async (idEmisor, idReceptor, monto) => {
    try {
        const saldoEmisor = 'SELECT balance from usuarios where id = $1'
        const resSaldoEmisor = await pool.query(saldoEmisor, [idEmisor])
        if (resSaldoEmisor.rows[0].balance < monto) {
            return res.status(400).json({ message: 'Saldo insuficiente para transacción.' })
        }
        const emisorExists = await pool.query('SELECT EXISTS (SELECT 1 FROM usuarios WHERE id = $1)', [idEmisor])
        const receptorExists = await pool.query('SELECT EXISTS (SELECT 1 FROM usuarios WHERE id = $1)', [idReceptor])
        if (!emisorExists.rows[0].exists || !receptorExists.rows[0].exists) {
            return res.status(400).json({ message: 'No hay emisor o receptor en los registros.' })
        }
        await pool.query('BEGIN')
        await pool.query('UPDATE usuarios SET balance = balance - $1 WHERE id = $2', [monto, idEmisor])
        await pool.query('UPDATE usuarios SET balance = balance + $1 WHERE id = $2', [monto, idReceptor])
        await pool.query('COMMIT')
        await registroTransferencias(idEmisor, idReceptor, monto);
        return true
    } catch (error) {
        await pool.query('ROLLBACK')
        throw error
    }
}

const registroTransferencias = async (idEmisor, idReceptor, monto) => {
    try {
        const queryFecha = await pool.query('SELECT NOW()')
        const fechaActual = queryFecha.rows[0].now;
        const query = {
            text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING id, emisor, receptor, monto, fecha",
            values: [idEmisor, idReceptor, monto, fechaActual],
        };
        let results = await consultarDB(query);
        let nuevaTransferencia = results.rows[0];
        return nuevaTransferencia
    } catch (error) {
        console.log('Error en la consulta a la base de datos', error);
        throw new Error("Error al agregar registro de transferencia.");
    }
};

const obtenerTransferencias = async () => {
    try {
        let query = "SELECT id, emisor, receptor, monto, fecha FROM transferencias ORDER BY id";
        let results = await consultarDB(query);
        let transferencias = results.rows;
        return transferencias;
    } catch (error) {
        console.log(error);
        throw new Error("Error al traer los datos");
    }
};

let operaciones = {
    nuevoUsuario,
    obtenerUsuarios,
    actualizarUsuario,
    eliminarUsuario,
    transferencia,
    obtenerTransferencias
}

export default operaciones;