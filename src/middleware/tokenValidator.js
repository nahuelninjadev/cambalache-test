const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

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

module.exports = async (req, res, next) => {

  try {
    const authorization = req.get('authorization');

    let token = null;
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      token = authorization.substring(7);
    }

    if (!token) {
      throw new Error('Token perdido')
    }

    await client.connect(); //conexion a redis
    const inDenyList = await client.get(`bl_${token}`);
    if (inDenyList) {
      throw new Error('Token rechazado');
    }
    await client.disconnect();

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    if (!decodedToken) {
      throw new Error('Token invalido')
    }

    const { id, exp } = decodedToken;

    req.usuario_id = id;
    req.token = token;
    req.tokenExp = exp;
    
    next();
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}