const userValidations = (params, fieldsArr) => {

  for (const field of fieldsArr) {
    switch (field) {
      case 'nombre':
      case 'apellido':
        if (!params[field] || params[field].trim() == '') {
          throw new Error("El campo " + field + " es requerido");
        } else {
          params[field] = params[field].toUpperCase().trim();
        }
        break;
      case 'fecha_nacimiento':
        if (!params[field] || params[field].trim() == '') {
          throw new Error("El campo " + field + " es requerido");
        }
        break;
      case 'lenguaje_prog_fav':
        if (!params[field] || params[field].trim() == '') {
          params[field] = null;
        } else {
          params[field] = params[field].toUpperCase().trim();
        }
        break;
      case 'password':
        if (!params[field] || params[field].trim() == '') {
          throw new Error("El campo " + field + " es requerido");
        }
        break;
      case 'email':
        if (!params[field] || params[field].trim() == '') {
          throw new Error("El campo " + field + " es requerido");
        }
        break;
      default:
        break;
    }
  }

  return params;
}

const repoValidations = (params, fieldsArr) => {

  for (const field of fieldsArr) {
    switch (field) {
      case 'nombre_proyecto':
      case 'lenguaje':
        if (!params[field] || params[field].toString().trim() == '') {
          throw new Error("El campo " + field + " es requerido");
        } else {
          params[field] = params[field].toString().toUpperCase().trim();
        }
        break;

      case 'usuario_id':
        if (!params[field] || params[field].toString().trim() == '') {
          throw new Error("El campo " + field + " es requerido");
        } else if (isNaN(params[field])) {
          throw new Error("El campo " + field + " debe ser numerico");
        } else {
          params[field] = params[field].toString().trim();
        }
        break;
      case 'descripcion':
        if (!params[field] || params[field].toString().trim() == '') {
          params[field] = null;
        }
        break;
      default:
        break;
    }
  }

  return params;
}

module.exports = {
  userValidations,
  repoValidations
}