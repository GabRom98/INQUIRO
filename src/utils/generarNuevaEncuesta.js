const generarNuevaEncuesta = (email,titulo,preguntas,idEncuesta,descripcion) => {
    return {
    InquiroPK: email,
    InquiroSK: idEncuesta,
    titulo,
    descripcion,
    preguntas,
    fechaCreacion: new Date().toISOString()
  };
}

export default generarNuevaEncuesta; 

