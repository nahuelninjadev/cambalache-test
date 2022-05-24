const pool = require('../db');
const { userValidations } = require('../utils');
const bcrypt = require('bcrypt');
const saltRounds = 10;




const UserController = {
  async getAll(req, res) {
    const stmt = `SELECT
    u.id,
    u.nombre, 
    u.apellido, 
    u.fecha_nacimiento, 
    u.lenguaje_prog_fav, 
    u.fecha_creacion, 
    u.fecha_modificacion,
    u.email,
    json_agg(r) FILTER (WHERE r.id IS NOT NULL) as repos
    FROM public.usuarios u
    LEFT JOIN public.repositorios r ON r.usuario_id = u.id
    WHERE u.estado = true group by u.id`;

    const response = await pool.query(stmt);
    res.status(200).json(response.rows);
  },

  async getOne(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El parametro id debe ser un dato numerico y entero");
      }
      const stmt = `SELECT
                    id, 
                    nombre, 
                    apellido, 
                    fecha_nacimiento, 
                    lenguaje_prog_fav, 
                    fecha_creacion, 
                    fecha_modificacion,
                    u.email 
                  FROM public.usuarios u 
                  WHERE u.estado = true AND id = $1`;
      const response = await pool.query(stmt, [id]);
      res.status(200).json(response.rows);
    } catch (error) {
      res.json({ error: error.message });
    }

  },

  async create(req, res) {
    try {
      const {
        nombre,
        apellido,
        fecha_nacimiento,
        lenguaje_prog_fav,
        password,
        email
      } = userValidations(req.body, [
        'nombre',
        'apellido',
        'fecha_nacimiento',
        'lenguaje_prog_fav',
        'password',
        'email'
      ]);

      const matchQry = await pool.query("SELECT email FROM public.usuarios u WHERE u.email = $1", [email]);
      if(matchQry.rowCount > 0){
        throw new Error("Ya existe un usuario con ese email");
      } 

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const stmt = `
        INSERT INTO public.usuarios 
          (nombre, apellido, fecha_nacimiento, lenguaje_prog_fav,  password, fecha_creacion, fecha_modificacion, email)
        VALUES
          ($1, $2, $3, $4, $5, NOW(), NOW(), $6)
        RETURNING nombre, apellido, fecha_nacimiento, lenguaje_prog_fav, password, fecha_creacion, fecha_modificacion, email
      `;
      const response = await pool.query(stmt, [
        nombre,
        apellido,
        fecha_nacimiento,
        lenguaje_prog_fav,
        hashedPassword,
        email
      ]);
      res.status(201).json(response.rows[0]);
    } catch (error) {
      res.json({ error: error.message });
      console.log(error);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El parametro id debe ser un dato numerico y entero");
      }
      const {
        nombre,
        apellido,
        fecha_nacimiento,
        lenguaje_prog_fav,
        email
      } = userValidations(req.body, [
        'nombre',
        'apellido',
        'fecha_nacimiento',
        'lenguaje_prog_fav',
        'email'
      ]);


      const stmt = `
        UPDATE public.usuarios SET
        nombre = $1,
        apellido = $2,
        fecha_nacimiento = $3,
        lenguaje_prog_fav = $4,
        email = $5,
        fecha_modificacion = NOW()
        WHERE id = $6
        RETURNING nombre, apellido, fecha_nacimiento, lenguaje_prog_fav, password, fecha_creacion, fecha_modificacion, email
      `;
      const response = await pool.query(stmt, [
        nombre,
        apellido,
        fecha_nacimiento,
        lenguaje_prog_fav,
        email,
        id
      ]);
      res.status(200).json(response.rows[0]);
    } catch (error) {
      res.json({ error: error.message });
      console.log(error);
    }
  },

  async updatePassword(req, res) {

    try {
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El parametro id debe ser un dato numerico y entero");
      }

      const { password } = userValidations(req.body, ['password']);
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const response = await pool.query("UPDATE public.usuarios SET password = $1 WHERE id = $2", [hashedPassword, id]);
      res.status(200).json({message: "Password cambiada con exito"});

    } catch (error) {
      res.status(400).json({error: error.message});
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El id debe ser un dato numerico y entero");
      }
      const response = await pool.query("UPDATE public.usuarios SET estado = false WHERE id = $1", [id]);
      res.status(200).json({ message: 'Eliminado con exito' })
    } catch (error) {
      console.log(error)
      res.json({ error: error.message });
    }
  },
}

module.exports = UserController