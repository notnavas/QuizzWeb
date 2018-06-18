
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require("./config");
var db = require('./connection.js');
var multer = require("multer");
var upload = multer({ dest: 'public/img/' });
//Paquetes de autenticacion
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var Chart = require('chart.js');
// Necesario para el parseador
var docx4js = require("docx4js");
var WordExtractor = require("word-extractor");
var extractor = new WordExtractor();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
};

var sessionStore = new MySQLStore(options);

//*****************************************SESIONES****************************************************

app.use(session({
  secret: 'ENwjP4aL1R',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

//*********************************MIDDLEWARES DE AUTENTIFICACION*******************************************
function authEstoyEnClase(request, response, next) {
  var idClaseAct = request.query.id;
  var user = request.session.user;
  //estoy en clase o soy su profesor

  db.compruebaPertenezcoAClase(user.email, idClaseAct, function (err, result) {
    if (result) {
      console.log("pertenezco a esta clase!")
      next();

    }
    else {

      var user = {
        email: request.query.name
      }
      db.compruebaEsMiClase(user, idClaseAct, function (err, result) {
        if (result) {
          console.log("es mi clase!")
          next();

        }
        else {
          response.redirect("/index")
          console.log("NO es mi clase ni pertenezco a ella !")
        }
      });

    }
  });

}
function authProf(request, response, next) {
  if (request.session.user === undefined) {
    response.redirect("/index")
  } else if (request.session.user.role == "Teacher") {
    next();
  } else {
    response.redirect("/index")
  }
}
function authStud(request, response, next) {
  if (request.session.user === undefined) {
    response.redirect("/index")
  } else if (request.session.user.role == "Student") {
    next();
  } else {
    response.redirect("/index")
  }
}

function authClase(request, response, next) {
  var idClaseAct = request.query.id;
  db.compruebaEsMiClase(request.session.user, idClaseAct, function (err, result) {
    if (result) {
      console.log("es mi clase!")
      next();

    }
    else {
      response.redirect("/index")
      console.log("NO es mi clase!")
    }
  });


}

function authAlumno(request, response, next) {

  var mailAlumnoAct = request.query.id;

  db.compruebaEsMiAlumno(request.session.user, mailAlumnoAct, function (err, result) {
    if (result) {
      console.log("Es mi alumno!")
      next();
    }
    else {
      response.redirect("/index")
      console.log("NO es mi alumno!")
    }
  });
}





/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/
/*********************************************************** INDEX Y LOGUEOS *****************************************************************************/
/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/


app.get("/", function (request, response) {
  response.redirect("/index");
});

app.get("/index", function (request, response) {

  if (request.session.user === undefined) {
    response.render("pages/index", { errores: "" });
  } else if (request.session.user.role == "Teacher") {
    response.redirect("/perfil");
  } else if (request.session.user.role == "Student") {
    response.redirect("/inicioAlumno");
  }

});


/**********************************************POST LOGIN*****************************************************/

app.post('/index', function (request, response, next) {
  var error = "";
  var usuario = {
    mail: request.body.mail,
    pass: request.body.password
  };

  db.buscarPorMail(usuario, function (err, result) {
    if (result) {
      console.log(result);
      var usermail = usuario.mail;

      delete request.session.user;
      request.session.user = result;

      db.numeroSolicitudes(usermail, function (err, result) {
        if (result) {

          request.session.user.numSolicitudes = result;
        }
        else {
          request.session.user.numSolicitudes = 0;
        }
        response.redirect("/index");
        response.status(200);
        response.end();
      });
    }
    else {
      var error = "¡Usuario o contraseña  incorrectos!"
      response.render("pages/index", { errores: error });
    }
  });
});

/******************************************LOGOUT**********************************/
app.get('/logout', function (request, response) {

  request.session.destroy();
  response.redirect('/');
});
/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/
/****************************PARTE DE LA PAGINA DESTINADA AL PROFESOR ******************************************************************/
/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/


app.get('/perfil', authProf, function (request, response) {
  console.log(request.session.user);
  var user = request.session.user;
  var clases = [];
  var alumnos = [];
  db.numeroSolicitudes(user.email, function (err, result) {
    if (result) {

      request.session.user.numSolicitudes = result;
    }
    else {
      request.session.user.numSolicitudes = 0;
    }
    db.buscarClases(user, function (err, result) {
      if (result) {
        clases = result;
        request.session.user.numClases = clases.length;
        db.buscarAlumnos(user, function (err, result) {
          if (result) {
            alumnos = result;
            request.session.user.numAlumnos = alumnos.length;
            response.render("pages/perfil", { user: user, clases: clases, alumnos: alumnos });
            response.status(200);
            response.end();

          }
          else {
            request.session.user.numAlumnos = 0;
            response.render("pages/perfil", { user: user, clases: clases, alumnos: alumnos });
            response.status(204);
            response.end();
          }
        });
      }
      else {
        request.session.user.numAlumnos = 0;
        request.session.user.numClases = 0;
        response.render("pages/perfil", { user: user, clases: clases, alumnos: alumnos });
        response.status(204);
        response.end();
      }
    });
  });


});
//comrpobar que eres el profesor de este alumno ( Mostrar estadisticas de alumno por clase?? )
app.get('/perfilAlumno', authProf, authAlumno, function (request, response) {
  var user;
  var mailAlumnoAct = request.query.id;
  var contribuciones = [];
  var estadisticas = [];
  user = request.session.user;

  db.buscarAlumno(mailAlumnoAct, function (err, result) {
    if (result) {
      var alumno = result;
      db.buscarContribucionesAlumno(alumno, function (err, result) {
        if (result) {
          contribuciones = result;
        }
        db.buscarEstadisticasAlumno(alumno, function (err, result) {
          if (result) {
            estadisticas = result;
          }
          db.buscarClasesAlumno(alumno, function (err, result) {
            if (result) {
              var clases = result;
              response.render("pages/perfilAlumno", { estadisticas: estadisticas, user: user, clases: clases, contribuciones: contribuciones, alumno: alumno });
              response.status(200);
              response.end();
            }
            else {
              response.redirect("/index")
              response.status(204);
              response.end();
            }
          });
        });

      });

    }
    else {
      response.redirect("/index")
      response.status(204);
      response.end();
    }
  });


});
//comprobar que eres el profesor de esta clase 
app.get('/infoClase', authProf, authClase, function (request, response) {
  var user;
  var idClaseAct = request.query.id;
  var sections = [];
  var section_content = [];
  var estadisticasClase = [];
  var contribucionesClase = [];
  user = request.session.user;

  db.buscarContribucionesClase(idClaseAct, function (err, result) {
    if (result) {
      contribucionesClase = result;

    }
    db.buscarEstadisticasClase(idClaseAct, function (err, result) {
      if (result) {
        estadisticasClase = result;

      }
      db.buscarClase(idClaseAct, function (err, result) {
        if (result) {
          var clase = result;
          db.buscarSectionsClase(idClaseAct, function (err, result) {
            if (result) {
              sections = result;

              db.buscarSectionsAndContentClase(idClaseAct, function (err, result) {
                if (result) {
                  section_content = result;

                  response.render("pages/infoClase", { contribucionesClase: contribucionesClase, estadisticasClase: estadisticasClase, user: user, clase: clase, sections: sections, section_content: section_content });
                  response.status(200);
                  response.end();
                }
                else {
                  response.render("pages/infoClase", { contribucionesClase: contribucionesClase, estadisticasClase: estadisticasClase, user: user, clase: clase, sections: sections, section_content: section_content });
                  response.status(204);
                  response.end();
                }
              });
            }
            else {
              response.render("pages/infoClase", { contribucionesClase: contribucionesClase, estadisticasClase: estadisticasClase, user: user, clase: clase, sections: sections, section_content: section_content });
              response.status(204);
              response.end();
            }
          });

        } else {
          response.redirect("/index")
          response.status(204);
          response.end();
        }
      });

    });

  });



});
//para añadir su clase 
app.get('/crearClase', authProf, function (request, response) {
  var user = request.session.user;
  var code = "";
  var errores = "";
  var state = request.query.state;

  if (state != undefined) {
    if (state == -1) {
      errores = "Error insertando clase"
    } else {
      code = "Tu clase se ha creado correctamente. El codigo de tu clase es <h3>" + state + "</h3>";
    }

  }

  response.render("pages/crearClase", { user: user, errores: errores, code: code });
  response.status(200);
  response.end();


});
app.post('/crearClase', authProf, function (request, response) {
  var user = request.session.user;
  var code = "";

  console.log(request.body.nombreClase);
  console.log(request.body.cursoClase);
  var errores = "";
  var clase = {
    name: request.body.nombreClase,
    grade: request.body.cursoClase,
    teacher_id: request.session.user.email,
  }

  db.insertarClase(clase, function (err, result) {
    if (result) {
      response.redirect("crearClase?state=" + result.toString());
      response.status(200);
      response.end();
    }
    else {

      errores = "-1";
      response.redirect("crearClase?state=" + errores);
      response.status(400);
      response.end();
    }
  });

});
//se pueden pasar los errores por cookie o req session 
app.post('/crearSeccion', authProf, function (request, response) {
  var user = request.session.user;
  var idClase = request.body.idClaseActual;
  var seccion = request.body.nuevaSeccion;

  db.insertarSeccion(idClase, seccion, function (err, result) {
    if (result) {


      response.redirect('/infoClase?id=' + idClase);
      response.status(200);
      response.end();
    }
    else {
      response.redirect('/infoClase?id=' + idClase);
      response.status(400);
      response.end();
    }
  });
});
app.post('/crearContenido', authProf, upload.single('imagenContenido'), function (request, response) {
  var user = request.session.user;
  var idClase = request.body.idClaseActual;
  var tituloContenido = request.body.nuevoTituloContenido;
  var idSeccionContenido = request.body.seccionDelContenido;
  var descripcionContenido = request.body.descripcionContenido;
  var linkContenido = request.body.linkContenido; //falta or añadir
  var imagenContenido = "";//request.file
  // imagenContenido= null;
  console.log(tituloContenido);
  console.log(idSeccionContenido);
  console.log(descripcionContenido);
  console.log(imagenContenido);
  //falta por insertar la imagen y el Link
  db.insertarContenido(tituloContenido, descripcionContenido, idSeccionContenido, imagenContenido, linkContenido, function (err, result) {
    if (result) {
      response.redirect('/infoClase?id=' + idClase);
      response.status(200);
      response.end();
    }
    else {
      
      response.redirect('/infoClase?id=' + idClase);
      response.status(400);
      response.end();
    }
  });

});

app.get('/solicitudesPendientes', authProf, function (request, response) {
  var idUser = request.session.user.email;
  var user = request.session.user;

  var solicitudesEjercicios = [];
  var solicitudesContenido = [];
  db.buscarMisSolicitudesPendientesCont(idUser, function (err, result) {
    if (result) {
      solicitudesContenido = result;
    }
  });
  db.buscarMisSolicitudesPendientesEj(idUser, function (err, result) {
    if (result) {
      solicitudesEjercicios = result;
      construyeEjerciciosFinal(solicitudesEjercicios, function (err, arrayEjerciciosFinal) {

        response.render("pages/solicitudesPendientes", { user: user, arrayEjerciciosFinal: arrayEjerciciosFinal, solicitudesContenido: solicitudesContenido });
        response.status(200);
        response.end();
      });

    } else {

      response.render("pages/solicitudesPendientes", { user: user, solicitudesEjercicios: solicitudesEjercicios, arrayEjerciciosFinal: [], solicitudesContenido: solicitudesContenido });
      response.status(204);
      response.end();
    }
  });
});
//ACEPTAR/RECHAZAR CONTENIDOS 
app.post('/rechazarSolicitudContenido', authProf, function (request, response) {
  var user = request.session.user;
  var contRechazado = request.body.solContRechazado;
  contRechazado = JSON.parse(contRechazado);
  var acepted = 0;
  var idSolicitud = contRechazado.id;

  console.log(contRechazado);
  db.eliminarSolicitudContenido(idSolicitud, function (err, result) {
    if (result) {
      db.insertarContribucionContenido(contRechazado.idUserReq, null, contRechazado.idSection, acepted, function (err, result) {
        if (result) {

          response.redirect("/solicitudesPendientes");
          response.status(200);
          response.end();
        }
        else {
          response.redirect("/solicitudesPendientes");
          response.status(400);
          response.end();
        }

      });
    }
    else {
      response.redirect("/solicitudesPendientes");
      response.status(400);
      response.end();
    }
  });
});
//**************************************************ACEPTAR/RECHAZAR CONTENIDOS *****************************************************************
app.post('/aceptarSolicitudContenido', authProf, function (request, response) {
  var user = request.session.user;
  var contAceptado = request.body.solContAceptado;
  var acepted = 1;
  contAceptado = JSON.parse(contAceptado);

  var idSolicitud = contAceptado.id;
  console.log(contAceptado);

  db.insertarContenido(contAceptado.name, contAceptado.description, contAceptado.idSection, contAceptado.image, contAceptado.link, function (err, result) {
    if (result) {
      console.log(result);//devolvemos el id del contenido insertado como result

      db.insertarContribucionContenido(contAceptado.idUserReq, result, contAceptado.idSection, acepted, function (err, result) {
        db.eliminarSolicitudContenido(idSolicitud, function (err, result) {
          if (result) {

            response.redirect("/solicitudesPendientes");
            response.status(200);
            response.end();
          }
          else {
            response.redirect("/solicitudesPendientes");
            response.status(400);
            response.end();
          }
        });
      });

    }
    else {
      response.redirect("/solicitudesPendientes");
      response.status(400);
      response.end();
    }
  });
});
//**************************************************ACEPTAR//RECHAZAR EHERCICIOS ***********************************************************
//ACEPTAR 
//GENIUS
//COMPLETO A FALTA DE AÑADIR EL TEST_ID Y EL ID_CONTENT -> NECESARIO HACERLO AQUI YA QUE LUEGO NO TENDREMOS EL IDCONTENT

app.post('/aceptarSolicitudEjercicio', authProf, function (request, response) {
  var user = request.session.user;
  var ejAceptado = request.body.solEjAceptado;
  ejAceptado = JSON.parse(ejAceptado);
  //tenemos el ejercicio a aceptar, ahora hay que insertarlo, usar una unica funcion dividida por "cases" lo veo como mejor opcion  
  var idSolicitud = ejAceptado.id;
  console.log(ejAceptado);
  var acepted = 1;


  db.eliminarSolicitudEjercicio(idSolicitud, function (err, result) {
    if (result) {
      //primero elimino la solicitud, y si lo he conseguido, inserto el ejercicio en la bd
      //aqui esta lo dificil
      db.aceptarSolicitudEjercicio(ejAceptado, function (err, result) {
        if (result) {
          console.log(result);//el  id del ejercicio aceptado
          db.insertarContribucionEjercicio(ejAceptado.idUser, result, ejAceptado.idContent, acepted, function (err, result) {
            if (result) {

              response.redirect("/solicitudesPendientes");
              response.status(200);
              response.end();
            }
            else {
              response.redirect("/solicitudesPendientes");
              response.status(400);
              response.end();
            }
          });
        }
        else {

          response.redirect("/solicitudesPendientes");
          response.status(400);
          response.end();
        }
      });

    }
    else {
      response.redirect("/solicitudesPendientes");
      response.status(400);
      response.end();
    }
  });





});
app.post('/rechazarSolicitudEjercicio', authProf, function (request, response) {
  var user = request.session.user;
  var ejRechazado = request.body.solEjRechazado;
  ejRechazado = JSON.parse(ejRechazado);

  var idSolicitud = ejRechazado.id;
  var acepted = 0;


  db.eliminarSolicitudEjercicio(idSolicitud, function (err, result) {
    if (result) {
      db.insertarContribucionEjercicio(ejRechazado.idUser, null, ejRechazado.idUser, acepted, function (err, result) {
        if (result) {

          response.redirect("/solicitudesPendientes");
          response.status(200);
          response.end();
        }
        else {
          response.redirect("/solicitudesPendientes");
          response.status(400);
          response.end();
        }
      });
    }
    else {
      response.redirect("/solicitudesPendientes");
      response.status(400);
      response.end();
    }
  });





});
/******Esta funcion se encarga de recoger la forma especifica de cada tipo de ejercicio y de construir su visualización ******
******************************************************************************************************************************/
function construyeEjerciciosFinal(arrayEjercicios, callback) {

  var arrayFinalEjercicios = [];

  var itemsProcessed = 0;

  arrayEjercicios.forEach(function (valor, indice, array) {
    switch (valor.type) {
      case "TF": {
        var sql = "SELECT  tf.* FROM question_request qr, question_request_tf tf WHERE qr.id = tf.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result[0];
            var pintacorrect = "";
            if (parteEspecifica.correct == 0) pintacorrect = "Falso";
            else pintacorrect = "Verdadero";
            var HTMLvisu = '   <h3> Descripcion:</h3>  ' +
              '                                   <br>  ' +
              '                                   <p>Este ejercicio se trata de identificar si un enuniciado es verdadero o falso.</p>  ' +
              '                                   <br>  ' +
              '                                   <h3> Ejercicio:</h3>  ' +
              '                                   <br>  ' +
              '                                   <b>Enunciado:</b>  ' +
              '                                   <br>' + valor.statement +
              '                                   <br>  ' +
              '                                    <b>//Comentario: </b> <br>' + parteEspecifica.comment + '<br>' +
              '                                   <b>¿El enunciado es correcto? </b><br>' +
              '                                   <ul>  ' +
              '                                     <li> ' + pintacorrect + '</li>  ' +
              '     ' +
              '                                   </ul>  ' +
              '     ' +
              '    ';
            var ejercicioCompletoTF = {
              id: valor.id,
              nombreContenido: valor.nombreContenido,
              seccionContenido: valor.seccionContenido,
              statement: valor.statement,
              idContent: valor.idContent,
              idUser: valor.idUser,
              type: valor.type,
              //ahora lo especifico
              parteEspecifica: parteEspecifica,
              visualizacion: HTMLvisu
            }
            console.log("semiacabo TF 1 ")
            arrayFinalEjercicios.push(ejercicioCompletoTF);
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              callback(null, arrayFinalEjercicios);
            }
          }
        });
      } break;
      case "FG": {

        var sql = "SELECT  fg.* FROM question_request qr, question_request_fg fg WHERE qr.id = fg.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result;
          }
          var HTMLpalClave = "";
          parteEspecifica.forEach(function (valor, indice) {
            HTMLpalClave = HTMLpalClave + ' <li>' + valor.concept + ' --- order: <b> (' + valor.gap_number + ')</b> </li>  ';
          });
          var HTMLvisu = '   <h3> Descripcion:</h3>  ' +
            '                                   <br>  ' +
            '                                   <p>Este ejercicio se trata de rellenar un enunciado con una serie de palabras, en el enunciado  ' +
            '                                     vendrán los huecos en los que el usuario introducirá las palabras en el orden adecuado.</p>  ' +
            '                                   <br>  ' +
            '                                   <h3> Ejercicio:</h3>  ' +
            '                                   <br>  ' +
            '                                   <b>Enunciado:</b>  ' +
            '                                   <br>' + valor.statement +
            '                                   <br>  ' +
            '     ' +
            '                                   <b>Palabras clave:</b>  ' +
            '                                   <ul>  ' +
            HTMLpalClave
          '                                  </ul>  ';
          var ejercicioCompletoFG = {
            id: valor.id,
            nombreContenido: valor.nombreContenido,
            seccionContenido: valor.seccionContenido,
            statement: valor.statement,
            idContent: valor.idContent,
            idUser: valor.idUser,
            type: valor.type,
            //ahora lo especifico
            parteEspecifica: parteEspecifica,
            visualizacion: HTMLvisu,



          }
          arrayFinalEjercicios.push(ejercicioCompletoFG);
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            callback(null, arrayFinalEjercicios);
          }
        });
        console.log("acabo TF")
      } break;
      case "MA": {
        var sql = "SELECT  ma.* FROM question_request qr, question_request_ma ma WHERE qr.id = ma.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result;
          }
          var HTMLmulti = "";
          var pintacorrect = "";
          parteEspecifica.forEach(function (valor, indice) {
            if (valor.correct == 0) pintacorrect = "Falsa";
            else pintacorrect = "Correcta";
            HTMLmulti = HTMLmulti + '<li>' + valor.description + '[<b>' + pintacorrect + '</b>], ---/// Comentario: ' + valor.comment + '</li>  ';
          });
          var HTMLvisu = '   <h3> Descripcion:</h3>  ' +
            '                                   <br>  ' +
            '                                   <p>Este ejercicio se trata de elegir entre varias respuestas para una pregunta. Varias respuestas  ' +
            '                                     pueden ser correctas. Al responder la pregunta se le mostrara un comentario de por qué cada opcion es o no es correcta</p>  ' +
            '                                   <br>  ' +
            '                                   <h3> Ejercicio:</h3>  ' +
            '                                   <br>  ' +
            '                                   <b>Enunciado:</b>  ' +
            '                                   <br> ' + valor.statement +
            '                                   <br>  ' +
            '     ' +
            '                                   <b>Posibles respuestas:</b>  ' +
            '                                   <ol>  ' +
            HTMLmulti
          '                                  </ol>  ';
          var ejercicioCompletoMA = {
            id: valor.id,
            nombreContenido: valor.nombreContenido,
            seccionContenido: valor.seccionContenido,
            statement: valor.statement,
            idContent: valor.idContent,
            idUser: valor.idUser,
            type: valor.type,
            //ahora lo especifico
            parteEspecifica: parteEspecifica,
            visualizacion: HTMLvisu


          }
          arrayFinalEjercicios.push(ejercicioCompletoMA);
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            console.log("acabo")
            console.log(arrayFinalEjercicios)
            callback(null, arrayFinalEjercicios);
          }
        });

      } break;
      case "DQ": {
        var sql = "SELECT  dq.* FROM question_request qr, question_request_dq dq WHERE qr.id = dq.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result[0];
          }
          var HTMLvisu = '                                   <h3> Descripcion:</h3>  ' +
            '                                   <br>  ' +
            '                                   <p>En este ejercicio el usuario deberá responder a una pregunta. La pregunta escrita deberá  ' +
            '                                     tener una respuesta clara y concisa, que no de posibilidad a otras respuestas.</p>  ' +
            '                                   <br>  ' +
            '                                   <h3> Ejercicio:</h3>  ' +
            '                                   <br>  ' +
            '                                   <b>Enunciado:</b>  ' +
            '                                   <br>' + valor.statement +
            '                                   <br>  ' +
            '     ' +
            '                                   <b>Respuesta:</b> ' + parteEspecifica.answer +
            '     ' +
            '                                  </p>  ';
          var ejercicioCompletoDQ = {
            id: valor.id,
            nombreContenido: valor.nombreContenido,
            seccionContenido: valor.seccionContenido,
            statement: valor.statement,
            idContent: valor.idContent,
            idUser: valor.idUser,
            type: valor.type,
            parteEspecifica: parteEspecifica,
            //ahora lo especifico
            visualizacion: HTMLvisu
          }
          arrayFinalEjercicios.push(ejercicioCompletoDQ);
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            console.log("acabo")
            console.log(arrayFinalEjercicios)
            callback(null, arrayFinalEjercicios);
          }
        });

      } break;
      case "OS": {
        var sql = "SELECT  os.* FROM question_request qr, question_request_os os WHERE qr.id = os.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result;
          }
          var HTMLmulti = "";
          var pintacorrect = "";
          parteEspecifica.forEach(function (valor, indice) {

            HTMLmulti = HTMLmulti + '  <li>  ' + valor.sentence +
              '                             <p >    Order: <b>(' + valor.order_sentence + ')</b></p>  ' +
              '                             </li>  ';
          });
          var HTMLvisu = '          <h3> Descripcion:</h3>  ' +
            '                                   <br>  ' +
            '                                   <p>En este ejercicio el usuario deberá introducir el orden correcto de las frases que se le  ' +
            '                                     muestran.  ' +
            '                                   </p>  ' +
            '                                   <br>  ' +
            '                                   <p>El "orden real", será el correcto, y el "orden a mostrar" será el orden en el que le aparecerán  ' +
            '                                     las frases al usuario</p>  ' +
            '                                   <h3> Ejercicio:</h3>  ' +
            '                                   <br>  ' +
            '                                   <b>Enunciado:</b>  ' +
            '                                   <br> Place sentences in chronological order:  ' +
            '                                   <br>  ' +
            '                                   <b>Frases:</b>  ' +
            '                                   <br>  ' +
            '                                   <ul>  ' +
            HTMLmulti +
            '                                  </ul>  ';
          var ejercicioCompletoOS = {
            id: valor.id,
            nombreContenido: valor.nombreContenido,
            seccionContenido: valor.seccionContenido,
            statement: valor.statement,
            idContent: valor.idContent,
            idUser: valor.idUser,
            type: valor.type,
            parteEspecifica: parteEspecifica,
            //ahora lo especifico
            visualizacion: HTMLvisu


          }
          arrayFinalEjercicios.push(ejercicioCompletoOS);
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            console.log("acabo")
            console.log(arrayFinalEjercicios)
            callback(null, arrayFinalEjercicios);
          }
        });

      } break;
      case "PW": {
        var sql = "SELECT  pw.* FROM question_request qr, question_request_pw pw WHERE qr.id = pw.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result;
          }
          var HTMLmulti = "";
          var pintacorrect = "";
          parteEspecifica.forEach(function (valor, indice) {

            HTMLmulti = HTMLmulti + '<li>' + valor.concept1 + ' --- ' + valor.concept2 + '</li>';

          });
          var HTMLvisu = '                                   <h3> Descripcion:</h3>  ' +
            '                                   <br>  ' +
            '                                   <p>En este ejercicio el usuario debe relacionar conceptos afines y emparejarlos de la manera  ' +
            '                                     adecuada  ' +
            '                                   </p>  ' +
            '                                   <br>  ' +
            '                                   <p></p>  ' +
            '                                   <h3> Ejercicio:</h3>  ' +
            '                                   <br>  ' +
            '                                   <b>Enunciado:</b>  ' +
            '                                   <br>' + valor.statement +
            '                                   <br>  ' +
            '                                   <b>Respuesta:</b>  ' +
            '                                   <ul>  ' +
            HTMLmulti
          '                                  </ul>  ';
          var ejercicioCompletoPW = {
            id: valor.id,
            nombreContenido: valor.nombreContenido,
            seccionContenido: valor.seccionContenido,
            statement: valor.statement,
            idContent: valor.idContent,
            idUser: valor.idUser,
            type: valor.type,
            parteEspecifica: parteEspecifica,
            //ahora lo especifico
            visualizacion: HTMLvisu


          }
          arrayFinalEjercicios.push(ejercicioCompletoPW);
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            console.log("acabo")
            console.log(arrayFinalEjercicios)
            callback(null, arrayFinalEjercicios);
          }
        });

      } break;
      case "RT": {
        var sql = "SELECT  rt.* FROM question_request qr, question_request_rt rt WHERE qr.id = rt.idQuest and qr.id = ?"
        db.getSolicitudEjercicioParteEspecifica(valor.id, sql, function (err, result) {
          if (result) {
            var parteEspecifica = result;
          }
          var HTMLmulti = "";
          parteEspecifica.forEach(function (valor, indice) {
            if (valor.correct == 0) pintacorrect = "Falsa";
            else pintacorrect = "Correcta";
            HTMLmulti = HTMLmulti + '  <li><b>Titulo:</b> ' + valor.title + ' <b>Tema: </b>' + valor.theme + '------- <b>' + pintacorrect + ' </b> </li>  ';


          });
          var HTMLvisu = '   <h3> Descripcion:</h3>  ' +
            '                                   <br>  ' +
            '                                   <p>En este ejercicio al usuario se le presenta un texto, y debe elegir entre varias opciones  ' +
            '                                     el titulo y el tema de dicho texto  ' +
            '                                   </p>  ' +
            '                                   <br>  ' +
            '                                   <p></p>  ' +
            '                                   <h3> Ejemplo:</h3>  ' +
            '                                   <br>  ' +
            '                                   <b>Enunciado/texto:</b>  ' +
            '                                   <br>  ' +
            '                                   <p>' + valor.statement + '</p>  ' +
            '                                   <br>  ' +
            '                                   <b>Respuesta:</b>  ' +
            '                                   <ul>  ' +
            HTMLmulti +
            '                                  </ul>  ';
          var ejercicioCompletoRT = {
            id: valor.id,
            nombreContenido: valor.nombreContenido,
            seccionContenido: valor.seccionContenido,
            statement: valor.statement,
            idContent: valor.idContent,
            idUser: valor.idUser,
            type: valor.type,
            parteEspecifica: parteEspecifica,
            //ahora lo especifico
            visualizacion: HTMLvisu


          }
          arrayFinalEjercicios.push(ejercicioCompletoRT);
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            console.log("acabo")
            console.log(arrayFinalEjercicios)
            callback(null, arrayFinalEjercicios);

          }
        });

      } break;
      default: { console.log("ERROR: TIPO DE EJERCICIO DESCONOCIDO!!!!!!!!!!!!!!"); }
    }
  });
}

///************************************************FORMAR TEST*********************************************************************** */

app.get('/generarTest', authProf, function (request, response) {
  var idUser = request.session.user.email;
  var user = request.session.user;

  var quest_content = [];
  var contentsConEjs = [];
  var listaEjercicios = [];
  var aviso = "";
  //get no_test_quest
  //get no_test_quest_contents
  db.Get_no_test_quest(user, function (err, result) {
    if (result) {
      quest_content = result;
      db.Get_no_test_quest_contents(user, function (err, result) {
        if (result) {
          result.forEach(function (valorCo, indice) {
            var contentConEj = {
              idContent: valorCo.id,
              name: valorCo.name,
              numEjercicios: valorCo.numEjercicios,
              listaEjercicios: []
            };
            quest_content.forEach(function (valorEj, indice) {

              if (valorEj.idContent == valorCo.id) {
                contentConEj.listaEjercicios.push(valorEj.idQuest);
              }

            });

            contentsConEjs.push(contentConEj);

          });
          console.log(quest_content)
          console.log(contentsConEjs)
          response.render("pages/generarTest", { user: user, errores: "", aviso: aviso, contentsConEjs: contentsConEjs, quest_content: quest_content });
          response.status(200);
          response.end();
        }
        else {

          response.render("pages/generarTest", { user: user, errores: "", aviso: aviso, contentsConEjs: contentsConEjs, quest_content: quest_content });
          response.status(200);
          response.end();
        }
      });
    }
    else {

      response.render("pages/generarTest", { user: user, errores: "", aviso: aviso, contentsConEjs: contentsConEjs, quest_content: quest_content });
      response.status(200);
      response.end();
    }
  });

});
app.post('/generarTest', authProf, function (request, response) {
  var user = request.session.user;
  var contenidoConEjs = request.body.contenidosConEjs;
  var numEjs = Number(request.body.numEjercicios);
  contenidoConEjs = JSON.parse(contenidoConEjs);

  var numEliminamos = contenidoConEjs.listaEjercicios.length - numEjs;
  //nos quedamos con numEjs ejercicios aleatorios del array, que son los que se añadirán al test
  contenidoConEjs.listaEjercicios.sort(function (a, b) { return 0.5 - Math.random() });


  contenidoConEjs.listaEjercicios.splice(numEjs, numEliminamos);

 
  db.eliminarTestRequestQuestions(contenidoConEjs, function (err, result) {
    if (result) {
      db.insertarTestGenerado(contenidoConEjs, function (err, result) {
        if (result) {

          response.redirect("/generarTest");
          response.status(200);
          response.end();
        }
        else {
          response.redirect("/generarTest");
          response.status(400);
          response.end();
        }
      });
    }
    else {
      response.redirect("/generarTest");
      response.status(400);
      response.end();
    }
  });

});
//*******************************************COPIAR TODO EL CONTENIDO DE UNA CLASE A OTRA********************************************** */
//PENDIENTE//
app.get('/copiarClase', authProf, function (request, response) {

  var user = request.session.user;

  db.buscarClases(user, function (err, result) {
    if (result) {
      clases = result;
      response.render("pages/copiarClase", { user: user, clases: clases });
      response.status(200);
      response.end();
    }
    else {
      response.render("pages/copiarClase", { user: user, clases: clases });
      response.status(204);
      response.end();
    }
  });

});
app.post('/copiarClase', authProf, function (request, response) {


  console.log(request.body.idClase1)
  console.log(request.body.idClase2)

});

/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/
/****************************PARTE DE LA PAGINA DESTINADA AL ALUMNO Y LA SUBIDA DE NUEVOS CONTENIDOS*****************************************/
/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/


app.get('/inicioAlumno', authStud, function (request, response) {
  var user;
  var errores = "";
  var clases = [];
  var sections = [];
  var contribuciones = [];
  var estadisticas = [];
  user = request.session.user;


  db.buscarEstadisticasAlumno(user, function (err, result) {
    if (result) {
      estadisticas = result;
    }
    db.buscarContribucionesAlumno(user, function (err, result) {
      if (result) {
        contribuciones = result;
      }
      db.buscarClasesAlumno(user, function (err, result) {
        if (result) {
          clases = result;
          db.buscarSectionsAlumno(user, function (err, result) {
            if (result) {
              sections = result;
              console.log(clases);
              console.log(sections);
              console.log(contribuciones);
              response.render("pages/inicioAlumno", { errores: errores, user: user, clases: clases, sections: sections, estadisticas: estadisticas, contribuciones: contribuciones });
              response.status(200);
              response.end();
            }
            else {
              response.render("pages/inicioAlumno", { errores: errores, user: user, clases: clases, sections: sections, estadisticas: estadisticas, contribuciones: contribuciones });
              response.status(204);
              response.end();
            }
          });
        }
        else {
          response.render("pages/inicioAlumno", { errores: errores, user: user, clases: clases, sections: sections, estadisticas: estadisticas, contribuciones: contribuciones });
          response.status(204);
          response.end();
        }
      });
    });

  });


});
//VOY POR AQUI
app.get('/estadisticasAlumno', authStud, function (request, response) {
  var user;
  var errores = "";
  var clases = [];
  var sections = [];
  var contribuciones = [];
  var estadisticas = [];
  user = request.session.user;

  db.buscarEstadisticasAlumno(user, function (err, result) {
    if (result) {
      estadisticas = result;
    }
    console.log(estadisticas)
    db.buscarContribucionesAlumno(user, function (err, result) {
      if (result) {
        contribuciones = result;
      }
      db.buscarClasesAlumno(user, function (err, result) {
        if (result) {
          clases = result;
          db.buscarSectionsAlumno(user, function (err, result) {
            if (result) {
              sections = result;
              /*console.log(clases);
              console.log(sections); 
              console.log(contribuciones);
              console.log(estadisticas);*/
              response.render("pages/estadisticasAlumno", { estadisticas: estadisticas, errores: errores, user: user, clases: clases, sections: sections, contribuciones: contribuciones });
              response.status(200);
              response.end();
            }
            else {
              response.render("pages/estadisticasAlumno", { estadisticas: estadisticas, errores: errores, user: user, clases: clases, sections: sections, contribuciones: contribuciones });
              response.status(204);
              response.end();
            }
          });
        }
        else {
          response.render("pages/estadisticasAlumno", { estadisticas: estadisticas, errores: errores, user: user, clases: clases, sections: sections, contribuciones: contribuciones });
          response.status(204);
          response.end();
        }
      });
    });
  });




});
app.post('/eligeClassAndSection', authStud, function (request, response) {
  var user = request.session.user;

  var idSeccionContenido = request.body.eligeSection; //esto es el nombre 
  var radioContOrEj = request.body.radioContOrEj;


  console.log(idSeccionContenido);
  console.log(radioContOrEj);
  if (radioContOrEj == "ejercicio") {
    response.redirect('/solicitudEjercicio?idSec=' + idSeccionContenido);
  } else if (radioContOrEj == "contenido") {
    response.redirect('/solicitudContenido?idSec=' + idSeccionContenido);
  } else {
    response.redirect("/");
  }


  user = request.session.user;


});
// *****************************SOLICITUD DE CONTENIDOS***********************************
//GET
app.get('/solicitudContenido', authStud, function (request, response) {
  var user;
  var errores = "";
  var idSecAct = request.query.idSec;
  var sections = [];
  var section_content = [];
  user = request.session.user;

  response.render("pages/addContenidoAlumno", { user: user, errores: errores, idSecAct: idSecAct });
  response.status(200);
  response.end();


});
//POST
app.post('/solicitudContenido', authStud, upload.single('imagenContenido'), function (request, response) {
  var userMail = request.session.user.email;
  var tituloContenido = request.body.nuevoTituloContenido;
  var idSeccionContenido = request.body.seccionDelContenido; //esto es el nombre 
  var descripcionContenido = request.body.descripcionContenido;
  var linkContenido = request.body.linkContenido;
  var imagenContenido = "";
  var errores = "";
  // imagenContenido= null;
  console.log(tituloContenido);
  console.log(linkContenido);
  console.log(idSeccionContenido);
  console.log(descripcionContenido);
  console.log(imagenContenido);


  user = request.session.user;

  db.insertarSolicitudContenido(idSeccionContenido, tituloContenido, descripcionContenido, userMail, imagenContenido, linkContenido, function (err, result) {
    if (result) {

      response.redirect("/");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el contenido";
      response.render("pages/addContenidoAlumno", { user: user, errores: errores, idSecAct: idSeccionContenido });
      response.status(400);
      response.end();
    }
  });

});
// ***************************** SOLICITUD DE EJERCICIOS ALUMNO ***********************************
//GET
app.get('/solicitudEjercicio', authStud, function (request, response) {
  var user;
  var errores = "";
  var idSectionAct = request.query.idSec;//request.query.id;
  var contents = [];

  user = request.session.user;


  db.buscarContenidoSection(idSectionAct, function (err, result) {
    if (result) {
      contents = result;

      response.render("pages/addEjercicio", { user: user, errores: errores, contents: contents });
      response.status(200);
      response.end();
    }
    else {
      contents = result;

      errores = "¡Esta seccion no tiene contenido, cree contenido antes de crear ejercicios!";
      //mostrar error

      response.redirect("/");
      response.status(204);
      response.end();
    }
  });
});
//POST especifico para cada tipo de ejercicio
app.post('/solicitudEjercicioTF', authStud, function (request, response) {
  var idUser = request.session.user.email;
  var errores = "";
  var contents = [];
  var comment = request.body.comentarioTF;
  var isTrue = request.body.radioTF;
  var enunciado = request.body.enunciadoTF;
  var contentID = request.body.contenidoDelEjercicioTF;
  console.log(isTrue);
  console.log(idUser);
  console.log(enunciado);
  console.log(contentID);



  db.insertarSolicitudEjercicioTF(contentID, idUser, enunciado, isTrue, comment, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio TFS";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });
});
app.post('/solicitudEjercicioFG', authStud, function (request, response) {
  var idUser = request.session.user.email;
  var errores = "";
  var contents = [];
  var numPalabras = request.body.numPalabrasFG;
  var arrayPalabrasClave = [];
  var enunciado = request.body.enunciadoFG;
  var contentID = request.body.contenidoDelEjercicioFG;
  var cadEvalOrig = "request.body.palabraClave";
  var cadeValMod = "";
  // un for a numpalabras con un eval ? aniadiendo al array y usando i 
  for (var i = 0; i < numPalabras; i++) {
    cadEvalMod = cadEvalOrig + (i + 1);
    arrayPalabrasClave.push(eval(cadEvalMod));

  }

  console.log(enunciado);
  console.log(numPalabras);
  console.log(arrayPalabrasClave);
  console.log(contentID);


  db.insertarSolicitudEjercicioFG(contentID, idUser, enunciado, arrayPalabrasClave, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });

});
app.post('/solicitudEjercicioMA', authStud, function (request, response) {
  var idUser;
  var errores = "";
  var idSection = 1;//request.query.id;
  var contents = [];
  var numRespuestas = request.body.numRespuestasMA;

  var arrayRespuestas = [];
  var enunciado = request.body.enunciadoMA;
  var contentID = request.body.contenidoDelEjercicioMA;
  var cadEvalOrigRespuesta = "request.body.posibleRespuestaMA";
  var cadeValModRespuesta = "";
  var cadEvalOrigChk = "request.body.chkMA";
  var cadeValModChk = "";
  var cadEvalOrigComent = "request.body.comentarioMA";
  var cadeValModComent = "";
  // un for a numpalabras con un eval ? aniadiendo al array y usando i 
  for (var i = 0; i < numRespuestas; i++) {
    cadeValModRespuesta = cadEvalOrigRespuesta + (i + 1);
    cadeValModChk = cadEvalOrigChk + (i + 1);
    cadeValModComent = cadEvalOrigComent + (i + 1);
    if (eval(cadeValModChk) == "1") cadeValModChk = 1;
    else cadeValModChk = 0;
    var respuestaFinal = {
      respuesta: eval(cadeValModRespuesta),
      esCorrecta: eval(cadeValModChk),
      comentario: eval(cadeValModComent)
    };
    arrayRespuestas.push(respuestaFinal);

  }
  console.log(enunciado);
  console.log(numRespuestas);
  console.log(arrayRespuestas);
  console.log(contentID);
  idUser = request.session.user.email;

  db.insertarSolicitudEjercicioMA(contentID, idUser, enunciado, arrayRespuestas, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });

});
app.post('/solicitudEjercicioDQ', authStud, function (request, response) {
  var idUser = request.session.user.email;
  var errores = "";
  var contents = [];
  var respuesta = request.body.respuestaDQ;
  var enunciado = request.body.enunciadoDQ;
  var contentID = request.body.contenidoDelEjercicioDQ;

  console.log(enunciado);
  console.log(respuesta);
  console.log(contentID);




  db.insertarSolicitudEjercicioDQ(contentID, idUser, enunciado, respuesta, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio DQ";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });

});
app.post('/solicitudEjercicioOS', authStud, function (request, response) {
  var idUser;
  var errores = "";
  var contents = [];
  var numFrases = request.body.numFrasesOS;

  var arrayFrases = [];
  var enunciado = request.body.enunciadoOS;
  var contentID = request.body.contenidoDelEjercicioOS;
  var cadEvalOrigFrase = "request.body.fraseOS";
  var cadeValModFrase = "";
  var cadEvalOrigPos = "request.body.ordenRealFrasesOS";
  var cadeValModPos = "";
  // un for a numpalabras con un eval ? aniadiendo al array y usando i 
  for (var i = 0; i < numFrases; i++) {
    cadeValModFrase = cadEvalOrigFrase + (i + 1);
    cadeValModPos = cadEvalOrigPos + (i + 1);

    var fraseFinal = {
      frase: eval(cadeValModFrase),
      pos: eval(cadeValModPos)
    };
    arrayFrases.push(fraseFinal);

  }
  idUser = request.session.user.email;
  console.log(enunciado);
  console.log(numFrases);
  console.log(arrayFrases);
  console.log(contentID);



  db.insertarSolicitudEjercicioOS(contentID, idUser, enunciado, arrayFrases, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio DQ";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });


});
app.post('/solicitudEjercicioPW', authStud, function (request, response) {
  var idUser;
  var errores = "";
  var contents = [];
  var numConceptos = request.body.numConceptosPW;

  var arrayConceptos = [];
  var enunciado = request.body.enunciadoPW;
  var contentID = request.body.contenidoDelEjercicioPW;
  var cadEvalOrigConcepto1 = "request.body.concepto1PW";
  var cadeValModConcepto1 = "";
  var cadEvalOrigConcepto2 = "request.body.concepto2PW";
  var cadeValModConcepto2 = "";
  // un for a numpalabras con un eval ? aniadiendo al array y usando i 
  for (var i = 0; i < numConceptos; i++) {
    cadeValModConcepto1 = cadEvalOrigConcepto1 + (i + 1);
    cadeValModConcepto2 = cadEvalOrigConcepto2 + (i + 1);

    var parejaFinal = {
      concepto1: eval(cadeValModConcepto1),
      concepto2: eval(cadeValModConcepto2)
    };
    arrayConceptos.push(parejaFinal);

  }
  console.log(enunciado);
  console.log(numConceptos);
  console.log(arrayConceptos);
  console.log(contentID);
  idUser = request.session.user.email;


  db.insertarSolicitudEjercicioPW(contentID, idUser, enunciado, arrayConceptos, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio DQ";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });

});
app.post('/solicitudEjercicioRT', authStud, function (request, response) {
  var idUser;
  var errores = "";
  var contents = [];
  var numConceptos = request.body.numConceptosRT;

  var arrayParejas = [];
  var enunciado = request.body.enunciadoRT;
  var contentID = request.body.contenidoDelEjercicioRT;
  var posCorrecta = request.body.radioRT;

  var cadEvalOrigTitulo = "request.body.tituloRT";
  var cadeValModTitulo = "";
  var cadEvalOrigTema = "request.body.temaRT";
  var cadeValModTema = "";

  // un for a numpalabras con un eval ? aniadiendo al array y usando i 
  for (var i = 0; i < numConceptos; i++) {
    cadeValModTitulo = cadEvalOrigTitulo + (i + 1);
    cadeValModTema = cadEvalOrigTema + (i + 1);
    var boolCorrecta;
    if (i == posCorrecta) boolCorrecta = 1;
    else boolCorrecta = 0;
    var parejaFinal = {
      titulo: eval(cadeValModTitulo),
      tema: eval(cadeValModTema),
      esCorrecta: boolCorrecta
    };
    arrayParejas.push(parejaFinal);

  }
  console.log(posCorrecta);
  console.log(enunciado);
  console.log(numConceptos);
  console.log(arrayParejas);
  console.log(contentID);
  idUser = request.session.user.email;
  db.insertarSolicitudEjercicioRT(contentID, idUser, enunciado, arrayParejas, function (err, result) {
    if (result) {

      response.redirect("/solicitudEjercicio");
      response.status(200);
      response.end();
    }
    else {

      errores = "no se pudo crear el ejercicio DQ";
      console.log(errores);
      response.redirect("/solicitudEjercicio");
      response.status(400);
      response.end();
    }
  });

});

/****************************************************************************************
******************** CHAT de clase con sockets ***************************************/
/**************************************************************************************
 * ***********************************************************************************/


//falta cambiar el auth para usar el usser session y no cogerlo de la query
var io = require('socket.io').listen(app.listen(config.port));

app.get('/chat', authEstoyEnClase, function (request, response) {

  var user = request.session.user;

  if (request.session.user.role == "Teacher") {
    response.render("pages/chatTeacher", { idClase: request.query.id, user: user });
  } else if (request.session.user.role == "Student") {
    response.render("pages/chatStudent", { idClase: request.query.id, user: user });
  }

});

var chat = io.on('connection', function (socket) {

  socket.on('join', function (data) {
    var room = findClientsSocket(io, data);
    socket.join(data);
    console.log("join con " + data);

  });

  socket.on('chat message', function (data) {

    console.log(data.user)
    chat.in(data.idClase).emit('chat message', { msg: data.msg.toString(), user: data.user });
  });

});


function findClientsSocket(io, roomId, namespace) {
  var res = [],
    ns = io.of(namespace || "/");    // the default namespace is "/"

  if (ns) {
    for (var id in ns.connected) {
      if (roomId) {
        var index = ns.connected[id].rooms.indexOf(roomId);
        if (index !== -1) {
          res.push(ns.connected[id]);
        }
      }
      else {
        res.push(ns.connected[id]);
      }
    }
  }
  return res;
}

app.get('/preChatStudent', authStud, function (request, response) {
  var user;
  var clases = [];


  user = request.session.user;
  db.buscarClasesAlumno(user, function (err, result) {
    if (result) {
      clases = result;
      response.render("pages/preChatStudent", { user: user, clases: clases });
      response.status(200);
      response.end();
    }
    else {
      response.render("pages/preChatStudent", { user: user, clases: clases });
      response.status(204);
      response.end();
    }
  });
});
app.get('/preChatTeacher', authProf, function (request, response) {
  var user;
  var clases = [];


  user = request.session.user;
  db.buscarClases(user, function (err, result) {
    if (result) {
      clases = result;
      response.render("pages/preChatTeacher", { user: user, clases: clases });
      response.status(200);
      response.end();
    }
    else {
      response.render("pages/preChatTeacher", { user: user, clases: clases });
      response.status(204);
      response.end();
    }
  });
});

app.post('/preChatStudent', authStud, function (request, response) {
  console.log(request.body.idClase);

  response.redirect("chat?id=" + request.body.idClase);
  response.status(200);
  response.end();
});
app.post('/preChatTeacher', authProf, function (request, response) {
  console.log(request.body.idClase);

  response.redirect("chat?id=" + request.body.idClase);
  response.status(200);
  response.end();
});

/*******************************************LOGOUT************************************** */
app.get('/logout', function (request, response) {
  request.logout();
  request.session.destroy();
  response.redirect('/');
});

/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/
/****************************PARTE DE LA APLICACIÓN DESTINADA A PARSER DE DOCUMENTOS WORD***************************************************/
/*******************************************************************************************************************************************/
/*******************************************************************************************************************************************/




// llamada get al parser 
app.post('/parser', authProf, upload.single('documentoWord'), function (request, response) {
  var user;
  var clases = [];
  var doc = ""; //ruta del archivo.
  var idClase = request.body.idClaseActual;
  var documentoWord = request.file.path;//
  var idSeccion =request.body.seccionContenidoWord; //seccion de prueba.

  user = request.session.user;
  fs.renameSync(documentoWord, documentoWord+".doc");
  documentoWord = documentoWord+".doc";
  console.log(idSeccion);  
  console.log(documentoWord);  
  console.log();
  parser(documentoWord, idSeccion);

  response.redirect('/infoClase?id=' + idClase);
  response.status(200);
  response.end();
  console.log("FINALIZADO");
});

  function parser(doc, idSeccionContenido) {
    var extracted = extractor.extract(doc);
    extracted.then(function (doc) {
      var posFinal = doc.getBody().length;

      var body = doc.getBody();

      var comprobacion = 0;
      // while (comprobacion !== 2)
      // {
      var pos = body.search("\n");

      // Nombre final 
      console.log("\n" + "Nombre del notas");
      var name = body.substr(0, pos);
      console.log(name);

      var tituloContenido = name;

      pos++;
      body = body.substr(pos, posFinal);
      pos = body.search("\n");

      body = body.substr(pos + 1, posFinal);
      pos = body.search("EXERCICES");

      // Introducción final
      console.log("\n" + "Introducción del asunto");
      var introduction = body.substr(0, pos);
      console.log(introduction);

      var descripcionContenido = introduction;

      body = body.substr(pos + 2, posFinal);
      pos = body.search("\n");
      body = body.substr(pos + 1, posFinal);

      var idContentAux;

      db.insertarContenido(tituloContenido, descripcionContenido, idSeccionContenido, null, "null", function (err, result) {
        if (result) {
          idContentAux = result;

          var numCuestions = 0;

          // Se comprueba si hay preguntas del tipo "Multiple answer"
          pos = body.search("Multiple answer");
          comprobacion++;
          if (pos !== -1) {
            numCuestions++;
            var ejercicio = new Object();
            ejercicio.type = "MA";
            ejercicio.idContent = idContentAux;

            var posB = ("Multiple answer").length;
            body = body.substr(pos + posB + 1, posFinal);

            var n = body.search("\n");

            // Pregunta "Multiple answer" final
            console.log("\n" + "Pregunta Multiple answer");
            var questionMC = body.substr(0, n);
            console.log(questionMC);

            ejercicio.statement = questionMC;

            body = body.substr(n + 1, posFinal);

            pos = body.search("Answer:");

            n = body.search("\n");

            var choices = new Array();

            var aux = 0;
            var jambo = body.substr(0, pos);
            while (n < pos) {
              console.log("\n" + "Respuesta " + (aux + 1) + " Multiple answer");
              var choice = new Object();
              choice.description = body.substr(0, n);
              console.log(choice.description);
              choices.push(choice);
              body = body.substr(n + 2);
              n = body.search("\n");
              pos = body.search("Answer:");
              ++aux;
            }


            body = body.substr(n + 1, posFinal);

            n = body.search("\n");

            for (var i = 0; i < aux; ++i) {
              var incorrect = body.search("INCORRECT");
              var correct = body.search("CORRECT");

              if (incorrect < correct && incorrect !== -1) {
                choices[i].correct = 0;
              }
              else if (correct < incorrect && correct !== -1) {
                choices[i].correct = 1;
              }
              n = body.search("\n");
              pos = body.search(":") + 2;
              choices[i].comment = body.substr(pos, n - pos);
              console.log(body.substr(pos, n - pos));
              body = body.substr(n + 1);
            }


            ejercicio.parteEspecifica = choices;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });

          }

          // Se comprueba si hay preguntas del tipo "True or false"
          pos = body.search("True or false");
          comprobacion++;
          if (pos !== -1) {
            numCuestions++;
            var ejercicio = new Object();
            ejercicio.type = "TF";
            ejercicio.idContent = idContentAux;

            var parteEspecifica =
              {
                comment: "",
                correct: ""
              };

            body = body.substr(pos);
            n = body.search("\n");

            body = body.substr(n + 1);
            n = body.search("-");
            body = body.substr(n + 2);

            n = body.search("\n");

            // Pregunta "True or false" final
            console.log("\n" + "Pregunta True or false");
            var preguntaTrueOrFalse = body.substr(0, n);
            console.log(preguntaTrueOrFalse);

            ejercicio.statement = preguntaTrueOrFalse;

            body = body.substr(n + 1);

            var falsoVerdadero = 0;
            var explicacionTrueFalse;
            if (body.search("TRUE") !== -1) {
              falsoVerdadero = 1;
              body = body.substr(body.search("TRUE"));

              pos = body.search(":");
              body = body.substr(pos + 2);

              n = body.search("\n");

              // Explicación "True or false" final
              console.log("\n" + "Explicación True or false");
              explicacionTrueFalse = body.substr(0, n);
              console.log(explicacionTrueFalse);
            }
            else {
              body = body.substr(body.search("FALSE"));

              pos = body.search(":");
              body = body.substr(pos + 2);

              n = body.search("\n");

              // Explicación "True or false" final
              console.log("\n" + "Explicación True or false");
              var explicacionTrueFalse = body.substr(0, n);
              console.log(explicacionTrueFalse);
            }

            parteEspecifica.correct = falsoVerdadero;
            parteEspecifica.comment = explicacionTrueFalse;

            ejercicio.parteEspecifica = parteEspecifica;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result) {
                console.log("Correcto");
                //callback(null);
              }
              else {
                console.log(err);
                //callback(err);
              }
            });
          }

          //Se comprueba si hay preguntas del tipo "Fill in the gaps"
          pos = body.search("Fill in the gaps");
          comprobacion++;
          if (pos !== -1) {

            numCuestions++;
            var ejercicio = new Object();
            ejercicio.type = "FG";
            ejercicio.idContent = idContentAux;

            var parteEspecifica;

            var array = new Array();

            body = body.substr(pos);
            n = body.search("\n");
            body = body.substr(n + 1);
            n = body.search("\n");
            console.log("\n" + "Enunciado Fill In The Gaps");
            var fillGaps = body.substr(0, n);
            console.log(fillGaps);

            body = body.substr(n + 1);
            n = body.search("\n");

            // Texto con huecos
            console.log("\n" + "Texto con huecos");
            var textoHuecos = body.substr(0, n);
            console.log(textoHuecos);

            ejercicio.statement = textoHuecos;

            body = body.substr(n + 1);
            body = body.substr(body.search("\n") + 1);

            // Creamos un array con las palabras posibles
            var words = new Array();
            n = body.search("\n");
            var s = body.search(" ");
            i = 0;
            while (n < s) {
              parteEspecifica = new Object();

              words.push(body.substr(0, n));

              parteEspecifica.gap_number = i + 1;
              parteEspecifica.concept = body.substr(0, n);

              array.push(parteEspecifica);

              // Palabras a guardar
              if (words[i] !== "") {
                console.log("\n" + "Palabra " + (i + 1));
                console.log(words[i]);
              }

              ++i;
              body = body.substr(n + 1);
              n = body.search("\n");
              s = body.search(" ");
            }
            array.pop();

            ejercicio.parteEspecifica = array;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });
          }

          // Se comprueba si hay preguntas del tipo "Pair Words"
          pos = body.search("Pair words");
          comprobacion++;
          if (pos !== -1) {
            numCuestions++;
            var ejercicio = new Object();
            ejercicio.type = "PW";
            ejercicio.idContent = idContentAux;

            var arrayConceptos = new Array();

            body = body.substr(pos);

            n = body.search("\n");
            body = body.substr(n + 1);

            n = body.search("\n");
            var enunciado = body.substr(0, n);
            ejercicio.statement = enunciado;

            body = body.substr(n + 1);
            pos = body.search("Answer:");
            var prueba = body.substr(0, pos);

            var num = 1;
            var numeros = new Array();
            var letras = new Array();

            while (prueba !== "") {
              n = prueba.search(num.toString()) + 3;
              pos = prueba.search("\t");
              var numero = (prueba.substr(n, pos - 2)).replace(/^\s*|\s*$/g, "");
              numeros.push(numero);
              // Números
              console.log("\n" + "Palabra del número " + num.toString());
              console.log(numeros[num - 1]);
              prueba = prueba.substr(pos);
              n = prueba.search("\n");
              var letra = (prueba.substr(0, n)).replace(/^\s*|\s*$/g, "");
              letras.push(letra);
              // Letras
              console.log("\n" + "Palabra de la letra " + num.toString());
              console.log(letras[num - 1]);
              prueba = prueba.substr(n + 1);
              num++;
            }
            /*pos = body.search("Answer:");
            body = body.substr(pos);
            pos = body.search("\n");
            body = body.substr(pos + 1);*/

            n = body.search("1");
            body = body.substr(n + 3);

            n = body.search("Answer:");
            n = n + 8;
            s = body.search("\n");
            i = 0;

            body = body.substr(n);
            //console.log(body);

            for (var i = 0; i < numeros.length; ++i) {

              var concepto1 = numeros[i];
              //console.log(concept1 + "\n");
              console.log("numero " + (i + 1) + ": " + concepto1 + "\n");
              //console.log(body);
              s = body.search("-");
              //console.log(s);
              body = body.substr(s + 1);
              //console.log(body);
              var concepto2 = correspondencia(body.substr(0, 1));
              //console.log(concept2 + "\n");
              console.log("letra " + (i + 1) + ": " + letras[concepto2 - 1] + "\n");

              /*var numero = numeros[i];
              var letra = correspondencia(letras[i]);*/

              var parteEspecifica = {
                concept1: concepto1,
                concept2: letras[concepto2 - 1]
              };

              arrayConceptos.push(parteEspecifica);
            }

            ejercicio.parteEspecifica = arrayConceptos;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });

          }

          // Se comprueba si hay preguntas del tipo "Direct Questions"
          pos = body.search("Direct questions");
          comprobacion++;
          if (pos !== -1) {

            numCuestions++;
            var ejercicio = new Object();
            ejercicio.type = "DQ";
            ejercicio.idContent = idContentAux;

            var parteEspecifica = new Object();

            body = body.substr(pos);
            n = body.search("\n");
            body = body.substr(n + 4);

            n = body.indexOf("?") + 1;

            // Pregunta 1 Direct Question Final
            console.log("\n" + "Pregunta directa A");
            var preguntaA = body.substr(0, n);
            console.log(preguntaA);

            ejercicio.statement = preguntaA;

            n = body.indexOf(":") + 2;
            body = body.substr(n);
            n = body.search("\n");

            // Respuesta 1 Direct Question Final
            console.log("\n" + "Respuesta directa A");
            var respuestaA = body.substr(0, n);
            console.log(respuestaA);

            parteEspecifica.answer = respuestaA;

            ejercicio.parteEspecifica = parteEspecifica;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });

            body = body.substr(n + 4);

            n = body.indexOf("?") + 1;

            ejercicio = new Object();
            ejercicio.type = "DQ";
            ejercicio.idContent = idContentAux;
            parteEspecifica = new Object();

            // Pregunta 2 Direct Question Final
            console.log("\n" + "Pregunta directa B");
            var preguntaB = body.substr(0, n);
            console.log(preguntaB);

            ejercicio.statement = preguntaB;

            n = body.indexOf(":") + 2;
            body = body.substr(n);
            n = body.search("\n");

            // Respuesta 2 Direct Question Final
            console.log("\n" + "Respuesta directa B");
            var respuestaB = body.substr(0, n);
            console.log(respuestaB);

            parteEspecifica.answer = respuestaB;

            ejercicio.parteEspecifica = parteEspecifica;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });

            body = body.substr(n + 4);

            n = body.indexOf("?") + 1;

            ejercicio = new Object();
            ejercicio.type = "DQ";
            ejercicio.idContent = idContentAux;
            parteEspecifica = new Object();

            // Pregunta 3 Direct Question Final
            console.log("\n" + "Pregunta directa C");
            var preguntaC = body.substr(0, n);
            console.log(preguntaC);

            ejercicio.statement = preguntaC;

            n = body.indexOf(":") + 2;
            body = body.substr(n);
            n = body.search("\n");

            // Respuesta 3 Direct Question Final
            console.log("\n" + "Respuesta directa C");
            var respuestaC = body.substr(0, n);
            console.log(respuestaC);

            n = body.search("\n");
            body = body.substr(n);

            parteEspecifica.answer = respuestaC;

            ejercicio.parteEspecifica = parteEspecifica;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });

          }

          // Se comprueba si hay preguntas del tipo "Order sentences"
          pos = body.search("Order sentences");
          comprobacion++;
          if (pos !== -1) {

            numCuestions++;
            var ejercicio = new Object();
            ejercicio.type = "OS";

            ejercicio.idContent = idContentAux;

            var parteEspecifica;

            var numFrases = 0;
            body = body.substr(pos);
            n = body.search("\n") + 1;
            body = body.substr(n);
            pos = body.search("\n");
            var preguntaOrderSentences = body.substr(0, pos);
            console.log("\n" + "preguntaOrderSentences");
            console.log(preguntaOrderSentences);

            ejercicio.statement = preguntaOrderSentences;

            body = body.substr(pos + 4);
            pos = body.search("Answer");
            var frases = new Array();
            while (pos !== 0) {
              n = body.search("\n");

              // Primera frase a ordenar
              console.log("\n" + "Frase " + (numFrases + 1) + " a ordenar");
              var frase = body.substr(0, n);
              console.log(frase);

              frases.push(frase);

              body = body.substr(n + 1);

              numFrases++;

              pos = body.search("Answer");
            }
            if (frases[numFrases - 1].trim() === "")
              frases.pop();

            numFrases = 0;
            while (numFrases < frases.length) {
              if (frases[numFrases].startsWith((numFrases + 1).toString()))
                frases[numFrases] = frases[numFrases].substr(3);

              console.log(frases[numFrases]);

              numFrases++;
            }

            n = body.search("\n");
            body = body.substr(n + 4);

            var frasesOrdenadas = new Array();
            numFrases = 0;
            while (numFrases < frases.length) {
              n = body.search("\n");

              // Primera frase a ordenar
              console.log("\n" + "Frase ordenada " + (numFrases + 1));
              var frase = body.substr(0, n);
              console.log(frase);

              frasesOrdenadas.push(frase);

              body = body.substr(n + 1);

              numFrases++;
            }

            numFrases = 0;
            while (numFrases < frasesOrdenadas.length) {
              if (frasesOrdenadas[numFrases].startsWith((numFrases + 1).toString()))
                frasesOrdenadas[numFrases] = frasesOrdenadas[numFrases].substr(3);

              console.log(frasesOrdenadas[numFrases]);

              numFrases++;
            }
            arrayFrases = new Array();
            for (var i = 0; i < frasesOrdenadas.length; ++i) {
              parteEspecifica = new Object();

              parteEspecifica.sentence = frasesOrdenadas[i];
              parteEspecifica.order_sentence = i + 1;

              arrayFrases.push(parteEspecifica);
            }

            ejercicio.parteEspecifica = arrayFrases;

            db.aceptarSolicitudEjercicio(ejercicio, function (err, result) {
              if (result)
                console.log("Correcto");
              else
                console.log("Error");
            });

          }

        }
        else
          console.log("Error");
      });

      //console.log("\n" + "Hasta aquí lo guardado" + "\n");


      //console.log(body);

    });
  }

  function correspondencia(letra) {
    switch (letra) {
      case "A":
        return 1;
        break;
      case "B":
        return 2;
        break;
      case "C":
        return 3;
        break;
      case "D":
        return 4;
        break;
      case "E":
        return 5;
        break;
      case "F":
        return 6;
        break;
      case "G":
        return 7;
        break;
      case "H":
        return 8;
        break;
      default:
        return 9;
        break;
    }
  }


  module.exports = app;