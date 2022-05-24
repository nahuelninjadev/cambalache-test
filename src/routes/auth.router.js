const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const tokenValidator = require('../middleware/tokenValidator');
const { createClient } = require('redis');

const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL
  })
  client.on("connect", (err) => {
    console.log("Client connected to Redis...");
  });
  client.on("ready", (err) => {
    console.log("Redis ready to use");
  });
  client.on("error", (err) => {
    console.error("Redis Client", err);
  });
  client.on("end", () => {
    console.log("Redis disconnected successfully");
  });

  await client.connect();
  return client;
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Debe proporcionar email y contraseña' })
    return;
  }

  const usuario = await pool.query("SELECT u.id, CONCAT(u.nombre, ' ', u.apellido) as nombre_apellido, password FROM public.usuarios u WHERE u.email = $1 and u.estado = true", [email]);

  if (usuario.rowCount <= 0) {
    res.status(404).json({ error: 'El usuario ingresado no existe' });
    return;
  }

  const userId = usuario.rows[0].id;
  const nombre_apellido = usuario.rows[0].nombre_apellido;

  const hashedPassword = usuario.rows[0].password;
  const match = await bcrypt.compare(password, hashedPassword);

  if (!match) {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  } else {
    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: '1h' });

    const loginRegister = await pool.query(`
      INSERT INTO public.historial_login(
      usuario_id, fecha_hora, tipo)
      VALUES ( $1, now(), 'LOGIN');
    `, [userId]);

    res.status(200).json({
      nombre_apellido: nombre_apellido,
      t: token
    });
  }

});

router.post('/logout', tokenValidator, async (req, res) => {

  try {
    const { usuario_id, token, tokenExp } = req;

  await pool.query(`
      INSERT INTO public.historial_login(
      usuario_id, fecha_hora, tipo)
      VALUES ( $1, now(), 'LOGOUT');
    `, [usuario_id]);

  const token_key = `bl_${token}`;
  const client = await getRedisClient();
  await client.set(token_key, token);
  client.expireAt(token_key, tokenExp);
  

  res.status(200).end();
  } catch (error) {
    res.status(500).json({error:error.message});
  }
  
})




module.exports = router;
