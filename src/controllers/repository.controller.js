const { repoValidations } = require('../utils');
const pool = require('../db');


const RepositoryController = {
  async getAll(req, res){
    const response = await pool.query("SELECT t1.*, CONCAT(t2.nombre, ' ', t2.apellido) as usuario FROM public.repositorios t1 INNER JOIN public.usuarios t2 ON t1.usuario_id = t2.id WHERE t2.estado = true");
    res.status(200).json(response.rows);
  },

  async getOne(req, res){
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El parametro id debe ser un dato numerico y entero");
      }

      const response = await pool.query("SELECT t1.*, CONCAT(t2.nombre, ' ', t2.apellido) as usuario FROM public.repositorios t1 INNER JOIN public.usuarios t2 ON t1.usuario_id = t2.id WHERE t1.id = $1 AND t2.estado = true", [id]);
      res.status(200).json(response.rows);

    } catch (error) {
      res.status(400).json({error: error.message});
    }
  },

  async create(req, res){
    try{

      const usuario_id = req.usuario_id;

      const {nombre_proyecto, lenguaje, descripcion} = repoValidations(req.body, [
        'nombre_proyecto', 
        'lenguaje',
        'descripcion'
      ]);

      const stmt = `
        INSERT INTO public.repositorios
        (
          nombre_proyecto, lenguaje, fecha_creacion, fecha_modificacion, descripcion, usuario_id
        )
        VALUES 
          ($1, $2, NOW(), NOW(), $3, $4)
        RETURNING id, nombre_proyecto,  lenguaje, fecha_creacion, fecha_modificacion, descripcion, usuario_id
      `;
  
      const response = await pool.query(stmt, [nombre_proyecto, lenguaje, descripcion, usuario_id]);
      res.status(201).json(response.rows[0])
      
    }catch(error){
      res.status(400).json({error: error.message});
    }
    
  },

  async update(req, res){
    try {
      const {usuario_id} = req;
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El parametro id debe ser un dato numerico y entero");
      }

      const {nombre_proyecto, lenguaje, descripcion} = repoValidations(req.body, [
        'nombre_proyecto', 
        'lenguaje',
        'descripcion'
      ]);

      const stmt = `
        UPDATE public.repositorios
        SET  nombre_proyecto = $1, lenguaje = $2, fecha_modificacion=NOW(), descripcion = $3
        WHERE id = $4 and usuario_id = $5
        RETURNING id, nombre_proyecto,  lenguaje, fecha_creacion, fecha_modificacion, descripcion, usuario_id
      `;

      const response = await pool.query(stmt, [nombre_proyecto, lenguaje, descripcion, id, usuario_id]);
      
      if(response.rowCount > 0){
        res.status(200).json(response.rows[0])
      }else{
        res.status(200).json({});
      }
      

    } catch (error) {
      res.status(400).json({error: error.message});
    }
  },

  async deleteRepo(req, res){
    try {
      const {usuario_id} = req;
      const { id } = req.params;
      if (isNaN(id)) {
        throw new Error("El parametro id debe ser un dato numerico y entero");
      }
      const response = await pool.query("DELETE FROM public.repositorios WHERE id = $1 AND usuario_id = $2", [id, usuario_id]);
      res.status(200).json({ message: 'Eliminado con exito' })
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  },
}

module.exports = RepositoryController;