


"use strict";

var mysql = require("mysql");
var config = require("./config");


var datosConexion = {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
};


//login

function buscarPorMail(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT * FROM user WHERE email = ? AND password = ? ";
            conexion.query(sql, [usuario.mail, usuario.pass],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) console.log("ERROR consulta LOGIN");
                    else console.log(result);

                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result[0]);
                    }
                });
        }
    });
}
function buscarClases(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT c.* , count(*)-1 as numAlumnos FROM class c,user u, student_classroom s WHERE c.teacher_id = ? AND c.id = s.class_id  AND u.email = s.student_id group by c.id ";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta GETCLASSES"); }
                    else {
                        console.log("Mis clases son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarClasesAlumno(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT c.*  FROM class c, student_classroom s WHERE  c.id = s.class_id  AND s.student_id= ? ";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta GETCLASSES ALUMNO"); }
                    else {
                        console.log("Mis clases son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarAlumnos(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT u.*, s.class_id, c.name AS class_name, c.code FROM `user` u, `class` c, `student_classroom` s WHERE c.teacher_id = ? AND s.student_id = u.email AND s.class_id = c.id and u.role = 'Student'";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta GETCLASSES"); }
                    else {
                        console.log("Mis clases son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarAlumno(email, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT * FROM user WHERE email = ?";
            conexion.query(sql, [email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar Alumno"); }
                    else {
                        console.log("Mi user es: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result[0]);
                    }
                });
        }
    });
}
function buscarClase(idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT c.* , count(*)-1 as numAlumnos FROM class c,user u, student_classroom s WHERE c.id = ? AND c.id = s.class_id AND u.email = s.student_id group by c.id";
            conexion.query(sql, [idClase],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar Clase"); }
                    else {
                        console.log("Mi clase es: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result[0]);
                    }
                });
        }
    });
}
function insertarClase(clase, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var class_id = "";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'INSERT INTO class (name,code,grade,teacher_id) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO student_classroom (student_id,class_id) VALUES(?,?)';
            var sql3 = 'UPDATE class SET code = ? WHERE id = ?';
            conexion.query(sql, [clase.name, Number(9999999), clase.grade, clase.teacher_id],
                function (err, result) {
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error registrando clase")

                    } else {
                        class_id = result.insertId;
                        conexion.query(sql2, [clase.teacher_id, class_id],
                            function (err, result) {
                                if (!!err) {
                                    console.log(sql);
                                    console.log(err);
                                    console.log("error registrando en student classroom")
                                } else {
                                    conexion.query(sql3, [class_id, class_id],
                                        function (err, result) {
                                            conexion.end();
                                            if (!!err) {
                                                console.log(sql);
                                                console.log(err);
                                                console.log("error registrando en student classroom")
                                            } else {

                                            }
                                        });
                                }
                            });

                    }
                    callback(null, class_id);
                });
        }
    });
}
function insertarSeccion(idClase, seccion, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'INSERT INTO section (name,class_id) VALUES(?,?)';
            conexion.query(sql, [seccion, idClase],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error registrando seccion")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function insertarContenido(tituloContenido, descripcionContenido, idSeccionContenido, imagenContenido, linkContenido, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {   //falta la imagen
            var sql = 'INSERT INTO content (name,description,image) VALUES(?,?,?)';
            var sql2 = 'INSERT INTO content_section (id_section,id_content) VALUES(?,?)'
            var sql3 = 'INSERT INTO content_link (name,link,content_id) VALUES(?,?,?)'
            conexion.query(sql, [tituloContenido, descripcionContenido, null],
                function (err, result) {
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        callback(null);
                        console.log("error registrando contenido")

                    } else {
                        var content_id = result.insertId;
                        conexion.query(sql2, [idSeccionContenido, content_id],
                            function (err, result) {
                                if (!!err) {
                                    console.log(sql);
                                    console.log(err);
                                    callback(null);
                                    console.log("error asignando contenido a seccion")
                                } else {
                                    //para añadir link 
                                    conexion.query(sql3, [tituloContenido, linkContenido, content_id],
                                        function (err, result) {
                                            if (!!err) {
                                                console.log(sql);
                                                console.log(err);
                                                console.log("error asignando link a contenido")
                                                callback(null);
                                            } else {
                                                conexion.end();

                                                callback(null, content_id);

                                            }
                                        });

                                }
                            });

                    }

                });
        }
    });
}
//SELECT s.*, c.*  FROM section s,content_section cs,content c where  cs.id_content = c.id and cs.id_section = s.id and s.class_id = 1 order by s.name
function buscarSectionsAndContentClase(idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT s.id as idSection, s.name as nombreSeccion,c.id as idContent, c.name as nombreContent, c.description, c.image FROM section s,content_section cs,content c where cs.id_content = c.id and cs.id_section = s.id and s.class_id = ? order by nombreSeccion";
            conexion.query(sql, [idClase],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar seccion y contenido"); }
                    else {
                        console.log("Mis secciones y contenido son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarSectionsClase(idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT s.* FROM section s where s.class_id = ?";
            conexion.query(sql, [idClase],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar seccion"); }
                    else {
                        console.log("Mis secciones son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarSectionsAlumno(alumno, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT s.*, c.name as sectionClassName FROM section s, student_classroom sc, class c where c.id = sc.class_id and sc.class_id = s.class_id and sc.student_id =?";
            conexion.query(sql, [alumno.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar seccion Alumno"); }
                    else {
                        console.log("Mis secciones son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarContenidoSection(idSection, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT c.*  FROM section s,content_section cs,content c where  cs.id_content = c.id and cs.id_section = s.id and s.id = ? ";
            conexion.query(sql, [idSection],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar content"); }
                    else {
                        console.log("Mi content son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function compruebaEsMiClase(user, idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);


    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT c.* FROM class c WHERE c.id = ? and c.teacher_id = ? ";
            conexion.query(sql, [idClase, user.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta esmiclase"); }
                    else {
                        if (result.length === 0) {
                            callback(null);//no es mi clase
                        }
                        else {
                            callback(null, result);//es mi clase
                        }
                    }

                });
        }
    });
}
function compruebaPertenezcoAClase(userMail, idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);


    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT c.* FROM student_classroom c WHERE c.class_id = ? and c.student_id = ? ";
            conexion.query(sql, [idClase, userMail],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta esmiclase"); }
                    else {
                        if (result.length === 0) {
                            callback(null);//no es mi clase
                        }
                        else {
                            callback(null, result);//es mi clase
                        }
                    }

                });
        }
    });
}
function compruebaEsMiAlumno(user, idAlumno, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);


    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT u.*, s.class_id, c.name AS class_name, c.code FROM `user` u, `class` c, `student_classroom` s WHERE c.teacher_id = ? AND s.student_id = u.email AND s.class_id = c.id and u.role = 'Student'and u.email = ?";
            conexion.query(sql, [user.email, idAlumno],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta esmiclase"); }
                    else {
                        if (result.length === 0) {
                            callback(null);//no es mi clase
                        }
                        else {
                            callback(null, result);//es mi clase
                        }
                    }

                });
        }
    });
}
//incsertar solicitud de contenido
function insertarSolicitudContenido(idSeccionContenido, tituloContenido, descripcionContenido, userMail, imagenContenido, linkContenido, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'INSERT INTO content_request (idSection,name,description,image,idUserReq,link) VALUES(?,?,?,?,?,?)';
            conexion.query(sql, [idSeccionContenido, tituloContenido, descripcionContenido, imagenContenido, userMail, linkContenido],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error solicitando contenido")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function insertarSolicitudEjercicioTF(idContenido, idUser, enunciado, isTrue, comment, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "TF";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_tf (idQuest,correct,comment) VALUES(?,?,?)';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        conexion.query(sql2, [idQuest, isTrue, comment],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function insertarSolicitudEjercicioDQ(idContenido, idUser, enunciado, answer, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "DQ";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_dq (idQuest,answer) VALUES(?,?)';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio dq pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        conexion.query(sql2, [idQuest, answer],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio dq pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
//SOLO CAMBIAN LOS SQL2
function insertarSolicitudEjercicioFG(idContenido, idUser, enunciado, arrayPalabrasClave, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "FG";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_fg (idQuest,concept, gap_number) VALUES ?';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio fg pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        var valuesSQL = [];

                        arrayPalabrasClave.forEach(function (valor, indice) {
                            valuesSQL.push([idQuest, valor, (indice + 1)]);
                        });
                        //randomizar el orden 
                        valuesSQL.sort(function (a, b) { return 0.5 - Math.random() });

                        conexion.query(sql2, [valuesSQL],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio fg pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function insertarSolicitudEjercicioMA(idContenido, idUser, enunciado, arrayRespuestas, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "MA";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_ma (idQuest,description,comment,correct) VALUES ?';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio ma pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        var valuesSQL = [];

                        arrayRespuestas.forEach(function (valor, indice) {
                            valuesSQL.push([idQuest, valor.respuesta, valor.comentario, valor.esCorrecta]);
                        });
                        //randomizar el orden 
                        //    valuesSQL.sort(function(a, b){return 0.5 - Math.random()});

                        conexion.query(sql2, [valuesSQL],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio ma pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function insertarSolicitudEjercicioOS(idContenido, idUser, enunciado, arrayFrases, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "OS";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_os (idQuest,sentence,order_sentence) VALUES ?';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio os pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        var valuesSQL = [];

                        arrayFrases.forEach(function (valor, indice) {
                            valuesSQL.push([idQuest, valor.frase, valor.pos]);
                        });
                        //randomizar el orden 
                        valuesSQL.sort(function (a, b) { return 0.5 - Math.random() });

                        conexion.query(sql2, [valuesSQL],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio os pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function insertarSolicitudEjercicioPW(idContenido, idUser, enunciado, arrayConceptos, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "PW";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_pw (idQuest,concept1,concept2) VALUES ?';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio pw pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        var valuesSQL = [];

                        arrayConceptos.forEach(function (valor, indice) {
                            valuesSQL.push([idQuest, valor.concepto1, valor.concepto2]);
                        });
                        //randomizar el orden 
                        valuesSQL.sort(function (a, b) { return 0.5 - Math.random() });

                        conexion.query(sql2, [valuesSQL],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio pw pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function insertarSolicitudEjercicioRT(idContenido, idUser, enunciado, arrayParejas, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "RT";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO question_request (idContent,idUser,statement,type) VALUES(?,?,?,?)';
            var sql2 = 'INSERT INTO question_request_rt (idQuest,title,theme,correct) VALUES ?';
            conexion.query(sql1, [idContenido, idUser, enunciado, type],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error solicitando ejercicio pw pt1")
                        callback(null);
                    } else {
                        var idQuest = result.insertId;
                        var valuesSQL = [];

                        arrayParejas.forEach(function (valor, indice) {
                            valuesSQL.push([idQuest, valor.titulo, valor.tema, valor.esCorrecta]);
                        });
                        //randomizar el orden 
                        valuesSQL.sort(function (a, b) { return 0.5 - Math.random() });

                        conexion.query(sql2, [valuesSQL],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error solicitando ejercicio pw pt2")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function buscarMisSolicitudesPendientesEj(idUser, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT qr.*, co.name as nombreContenido, s.name as seccionContenido FROM question_request qr,content_section cs, section s, class c, content co WHERE c.teacher_id = ? and s.class_id = c.id and cs.id_section = s.id and cs.id_content = qr.idContent and qr.idContent = co.id  ";
            conexion.query(sql, [idUser],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar solicitudes pendientes ejercicios"); }
                    else {
                        console.log("Mi solicitudes son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function buscarMisSolicitudesPendientesCont(idUser, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            var sql = "SELECT cr.*, s.name as sectionName FROM  section s, class c, content_request cr WHERE c.teacher_id =? and s.class_id = c.id and s.id = cr.idSection ";
            conexion.query(sql, [idUser],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar solicitudes pendientes contenido"); }
                    else {
                        console.log("Mi solicitudes son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
//le pasamos la consulta sql para conseguir la parte especifica del ejercicio, asi ahorramos en funciones y en consultas
function getSolicitudEjercicioParteEspecifica(idQuest, sql, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui traerte tambien las calificaciones
            conexion.query(sql, [idQuest],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR consulta Buscar parte especifica de solicitud del ejercicio"); }
                    else {
                        console.log("Mi solicitudes son: ");
                        console.log(result);
                    }
                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
//aceptarSolicitudEjercicio

function aceptarSolicitudEjercicio(ejercicio, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //aqui empieza el case 
            var sqlComun = 'INSERT INTO question (statement,type) VALUES(?,?)'
            var sqlComunTestContent = 'INSERT INTO no_test_question (idQuest, idContent) VALUES (?,?)'
            switch (ejercicio.type) {
                case "TF": {

                    var sqlEspecifico = 'INSERT INTO true_false (id,correct,coment) VALUES(?,?,?) ';
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var question_id = result.insertId;
                                conexion.query(sqlEspecifico, [question_id, ejercicio.parteEspecifica.correct, ejercicio.parteEspecifica.comment],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(sqlEspecifico);
                                            console.log(err);
                                            console.log("error aceptando ejercicio especifico")
                                            callback(null);
                                        } else {
                                            conexion.query(sqlComunTestContent, [question_id, ejercicio.idContent],
                                                function (err, result) {
                                                    conexion.end();
                                                    if (!!err) {
                                                        console.log(sqlComunTestContent);
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio especifico test")
                                                        callback(null);
                                                    } else {
                                                        console.log("ejercicio aceptado, DEVOLVEMOS SU ID ")
                                                        callback(null, question_id);
                                                    }
                                                });
                                        }
                                    });
                            }


                        });
                } break;
                //aqui acaba un case
                case "FG": {
                    var sqlEspecifico = 'INSERT INTO gap (gap_number, answer,fil_gap_id) VALUES ?';
                    var sqlIntermedio = 'INSERT INTO fill_gap (id) VALUES (?)'
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var idQuest = result.insertId;
                                var valuesSQL = [];

                                ejercicio.parteEspecifica.forEach(function (valor, indice) {
                                    valuesSQL.push([valor.gap_number, valor.concept, idQuest]);
                                });

                                conexion.query(sqlIntermedio, [idQuest],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(err);
                                            console.log("error aceptando ejercicio fg intermedio fill_gap")
                                            callback(null);
                                        } else {

                                            conexion.query(sqlEspecifico, [valuesSQL],
                                                function (err, result) {
                                                    if (!!err) {
                                                        console.log(sqlEspecifico);
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio especifico")
                                                        callback(null);
                                                    } else {
                                                        conexion.query(sqlComunTestContent, [idQuest, ejercicio.idContent],
                                                            function (err, result) {
                                                                conexion.end();
                                                                if (!!err) {
                                                                    console.log(sqlComunTestContent);
                                                                    console.log(err);
                                                                    console.log("error aceptando ejercicio especifico test")
                                                                    callback(null);
                                                                } else {
                                                                    console.log("ejercicio aceptado")
                                                                    callback(null, idQuest);
                                                                }
                                                            });
                                                    }

                                                });
                                        }

                                    });
                            }
                        });

                } break;
                case "MA": {
                    var sqlEspecifico = 'INSERT INTO options_multi (description, coment,correct,multi_id) VALUES ?';
                    var sqlIntermedio = 'INSERT INTO multi_answer (id) VALUES (?)'
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var idQuest = result.insertId;
                                var valuesSQL = [];

                                ejercicio.parteEspecifica.forEach(function (valor, indice) {
                                    valuesSQL.push([valor.description, valor.comment, valor.correct, idQuest]);
                                });

                                conexion.query(sqlIntermedio, [idQuest],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(err);
                                            console.log("error aceptando ejercicio ma intermedio ma")
                                            callback(null);
                                        } else {

                                            conexion.query(sqlEspecifico, [valuesSQL],
                                                function (err, result) {
                                                    if (!!err) {
                                                        console.log(sqlEspecifico);
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio especifico")
                                                        callback(null);
                                                    } else {
                                                        conexion.query(sqlComunTestContent, [idQuest, ejercicio.idContent],
                                                            function (err, result) {
                                                                conexion.end();
                                                                if (!!err) {
                                                                    console.log(sqlComunTestContent);
                                                                    console.log(err);
                                                                    console.log("error aceptando ejercicio especifico test")
                                                                    callback(null);
                                                                } else {
                                                                    console.log("ejercicio aceptado")
                                                                    callback(null, idQuest);
                                                                }
                                                            });
                                                    }

                                                });
                                        }

                                    });
                            }
                        });
                } break;
                case "OS": {
                    var sqlEspecifico = 'INSERT INTO order_sentences_options (sentence, order_sentences_id,order_sentence) VALUES ?';
                    var sqlIntermedio = 'INSERT INTO order_sentences (id) VALUES (?)'
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var idQuest = result.insertId;
                                var valuesSQL = [];

                                ejercicio.parteEspecifica.forEach(function (valor, indice) {
                                    valuesSQL.push([valor.sentence, idQuest, valor.order_sentence]);
                                });

                                conexion.query(sqlIntermedio, [idQuest],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(err);
                                            console.log("error aceptando ejercicio os intermedio ")
                                            callback(null);
                                        } else {

                                            conexion.query(sqlEspecifico, [valuesSQL],
                                                function (err, result) {
                                                    if (!!err) {
                                                        console.log(sqlEspecifico);
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio especifico")
                                                        callback(null);
                                                    } else {
                                                        conexion.query(sqlComunTestContent, [idQuest, ejercicio.idContent],
                                                            function (err, result) {
                                                                conexion.end();
                                                                if (!!err) {
                                                                    console.log(sqlComunTestContent);
                                                                    console.log(err);
                                                                    console.log("error aceptando ejercicio especifico test")
                                                                    callback(null);
                                                                } else {
                                                                    console.log("ejercicio aceptado")
                                                                    callback(null, idQuest);
                                                                }
                                                            });
                                                    }

                                                });
                                        }

                                    });
                            }
                        });
                } break;
                case "DQ": {

                    var sqlEspecifico = 'INSERT INTO direct_question (id,answer) VALUES(?,?) ';
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var question_id = result.insertId;
                                conexion.query(sqlEspecifico, [question_id, ejercicio.parteEspecifica.answer],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(sqlEspecifico);
                                            console.log(err);
                                            console.log("error aceptando ejercicio especifico")
                                            callback(null);
                                        } else {
                                            conexion.query(sqlComunTestContent, [question_id, ejercicio.idContent],
                                                function (err, result) {
                                                    conexion.end();
                                                    if (!!err) {
                                                        console.log(sqlComunTestContent);
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio especifico test")
                                                        callback(null);
                                                    } else {
                                                        console.log("ejercicio aceptado")
                                                        callback(null, question_id);
                                                    }
                                                });
                                        }
                                    });
                            }


                        });
                } break;
                case "PW": {
                    var sqlEspecifico = 'INSERT INTO word_pair (concept1, concept2,pair_id) VALUES ?';
                    var sqlIntermedio = 'INSERT INTO pair (id) VALUES (?)'
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var idQuest = result.insertId;
                                var valuesSQL = [];

                                ejercicio.parteEspecifica.forEach(function (valor, indice) {
                                    valuesSQL.push([valor.concept1, valor.concept2, idQuest]);
                                });

                                conexion.query(sqlIntermedio, [idQuest],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(err);
                                            console.log("error aceptando ejercicio os intermedio ")
                                            callback(null);
                                        } else {

                                            conexion.query(sqlEspecifico, [valuesSQL],
                                                function (err, result) {
                                                    if (!!err) {
                                                        console.log(sqlEspecifico);
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio especifico")
                                                        callback(null);
                                                    } else {
                                                        conexion.query(sqlComunTestContent, [idQuest, ejercicio.idContent],
                                                            function (err, result) {
                                                                conexion.end();
                                                                if (!!err) {
                                                                    console.log(sqlComunTestContent);
                                                                    console.log(err);
                                                                    console.log("error aceptando ejercicio especifico test")
                                                                    callback(null);
                                                                } else {
                                                                    console.log("ejercicio aceptado")
                                                                    callback(null, idQuest);
                                                                }
                                                            });
                                                    }

                                                });
                                        }

                                    });
                            }
                        });
                } break;
                case "RT": {
                    var sqlEspecifico1 = 'INSERT INTO recognise_title (title, correct,recognise_id) VALUES ?';
                    var sqlEspecifico2 = 'INSERT INTO recognise_theme (theme,correct, recognise_id) VALUES ?';
                    var sqlIntermedio = 'INSERT INTO recognise_text (id) VALUES (?)'
                    conexion.query(sqlComun, [ejercicio.statement, ejercicio.type],
                        function (err, result) {
                            if (!!err) {
                                console.log(sqlComun);
                                console.log(err);
                                console.log("error aceptando ejercicio")

                            } else {
                                var idQuest = result.insertId;
                                var valuesSQL1 = [];
                                var valuesSQL2 = [];

                                ejercicio.parteEspecifica.forEach(function (valor, indice) {
                                    valuesSQL1.push([valor.title, valor.correct, idQuest]);
                                    valuesSQL2.push([valor.theme, valor.correct, idQuest]);
                                });


                                conexion.query(sqlIntermedio, [idQuest],
                                    function (err, result) {
                                        if (!!err) {
                                            console.log(err);
                                            console.log("error aceptando ejercicio os intermedio ")
                                            callback(null);
                                        } else {

                                            conexion.query(sqlEspecifico1, [valuesSQL1],
                                                function (err, result) {

                                                    if (!!err) {
                                                        console.log(err);
                                                        console.log("error aceptando ejercicio os  ")
                                                        callback(null);
                                                    } else {


                                                        conexion.query(sqlEspecifico2, [valuesSQL2],
                                                            function (err, result) {
                                                                if (!!err) {
                                                                    console.log(sqlEspecifico);
                                                                    console.log(err);
                                                                    console.log("error aceptando ejercicio especifico")
                                                                    callback(null);
                                                                } else {
                                                                    conexion.query(sqlComunTestContent, [idQuest, ejercicio.idContent],
                                                                        function (err, result) {
                                                                            conexion.end();
                                                                            if (!!err) {
                                                                                console.log(sqlComunTestContent);
                                                                                console.log(err);
                                                                                console.log("error aceptando ejercicio especifico test")
                                                                                callback(null);
                                                                            } else {
                                                                                console.log("ejercicio aceptado")
                                                                                callback(null, idQuest);
                                                                            }
                                                                        });
                                                                }

                                                            });
                                                    }

                                                });
                                        }

                                    });
                            }
                        });
                } break;
                //aqui acaba un case
                default: console.log("ERROR EN EL TIPO DE EJERCICIO")
            }
            //aqui acaba el switch
        }
    });
}
function eliminarSolicitudEjercicio(idSolicitud, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'DELETE FROM question_request WHERE id=?';
            conexion.query(sql, [idSolicitud],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error eliminando solicitud de ejercicio")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function eliminarSolicitudContenido(idSolicitud, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'DELETE FROM content_request WHERE id=?';
            conexion.query(sql, [idSolicitud],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error eliminando solicitud de contenido")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
////get no_test_quest
function Get_no_test_quest(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT nq.* FROM no_test_question nq, content_section cs, section s, class c WHERE nq.idContent = cs.id_content and cs.id_section = s.id and s.class_id = c.id and c.teacher_id = ?";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR no_test_question"); }

                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
////get no_test_quest_contents
function Get_no_test_quest_contents(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT co.* , COUNT(*) as numEjercicios FROM no_test_question nq, content_section cs,content co, section s, class c WHERE nq.idContent = cs.id_content and co.id = nq.idContent and cs.id_section = s.id and s.class_id = c.id and c.teacher_id = ? group by co.id";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR no_test_question"); }

                    if (result.length === 0) {
                        callback(null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        }
    });
}
function insertarTestGenerado(contentConEjs, callback) {

    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);
    var type = "FG";
    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql1 = 'INSERT INTO test (content_id) VALUES (?)';
            var sql2 = 'INSERT INTO question (id,order_question,test_id) VALUES ? ON DUPLICATE KEY UPDATE id=VALUES(id), order_question=VALUES(order_question), test_id=VALUES(test_id)';
            conexion.query(sql1, [contentConEjs.idContent],
                function (err, result) {
                    if (!!err) {
                        console.log(sql1);
                        console.log(err);
                        console.log("error añadiendo idContenido a nuevo test generado")
                        callback(null);
                    } else {
                        var idTest = result.insertId;
                        var valuesSQL = [];

                        contentConEjs.listaEjercicios.forEach(function (valor, indice) {
                            valuesSQL.push([valor, indice, idTest]);
                        });


                        conexion.query(sql2, [valuesSQL],
                            function (err, result) {
                                conexion.end();
                                if (!!err) {
                                    console.log(sql2);
                                    console.log(err);
                                    console.log("error actualizando ejercicios al generar test")
                                    callback(null);
                                } else {

                                    callback(null, result);
                                }

                            });
                    }

                });
        }
    });
}
function eliminarTestRequestQuestions(contentConEjs, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'DELETE FROM no_test_question WHERE idQuest IN (?)';
            var valuesSQL = [];

            contentConEjs.listaEjercicios.forEach(function (valor, indice) {
                valuesSQL.push(valor);
            });
            conexion.query(sql, [valuesSQL],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error eliminando test requ questions")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function insentarImagenPrueba(imagen, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'INSERT INTO prueba_img (img) VALUES (?)';

            conexion.query(sql, [imagen],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error INSERTANDO IMAGEN DE PRUEBA")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function numeroSolicitudes(usermail, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = ' SELECT SUM(num) as numSol FROM (SELECT COUNT(*)as num FROM question_request qr, content_section cs , class c, section s WHERE c.teacher_id = ? and s.class_id = c.id and cs.id_section = s.id and cs.id_content = qr.idContent  ' +
                '  UNION SELECT COUNT(*)as num FROM content_request cr,  class c, section s WHERE c.teacher_id =? and s.class_id = c.id and s.id = cr.idSection) T1  ';
            conexion.query(sql, [usermail, usermail],
                function (err, result) {
                    console.log("[mysql error]", err);
                    conexion.end();
                    if (!!err) { console.log("ERROR no_test_question"); }

                    if (result.length === 0) {
                        callback(null);
                    }
                    else {

                        callback(null, result[0].numSol);
                    }
                });
        }
    });
}
//-*****************************************************************************************//
//-*****************************************************************************************//
//-***********************   PARA LAS ESTADISTICAS **************************************//        
//-*****************************************************************************************//
//-*****************************************************************************************//

function insertarContribucionContenido(studentId, contentId, sectionId, acepted, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'INSERT INTO student_content_contributions (studentId,contentId,sectionId,acepted) VALUES (?,?,?,?)';

            conexion.query(sql, [studentId, contentId, sectionId, acepted],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error INSERTANDO CONTRIBUCION CONTENIDO")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function insertarContribucionEjercicio(studentId, questionId, contentId, acepted, callback) {
    if (callback === undefined)
        callback = function () { };
    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = 'INSERT INTO student_question_contributions (studentId,questionId,contentId,acepted) VALUES (?,?,?,?)';

            conexion.query(sql, [studentId, questionId, contentId, acepted],
                function (err, result) {
                    conexion.end();
                    if (!!err) {
                        console.log(sql);
                        console.log(err);
                        console.log("error INSERTANDO CONTRIBUCION EJERCICIO")
                        callback(null);
                    } else {

                        callback(null, result);
                    }

                });
        }
    });
}
function buscarContribucionesAlumno(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT * FROM student_question_contributions sq WHERE sq.studentId = ?";
            var sql2 = "SELECT * FROM student_content_contributions sc WHERE sc.studentId = ?";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);

                    if (!!err) { console.log("ERROR get contribuciones quest"); }

                    else {
                        var contribuciones = {
                            contrEjercicios: result,
                            contrContenidos: ""
                        }
                        conexion.query(sql2, [usuario.email],
                            function (err, result) {
                                console.log("[mysql error]", err);
                                conexion.end();
                                if (!!err) { console.log("ERROR get contribuciones cont"); }

                                else {
                                    contribuciones.contrContenidos = result;

                                    callback(null, contribuciones);
                                }
                            });
                    }
                });
        }
    });
}
function buscarEstadisticasAlumno(usuario, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            //OJO con esta consulta, de aqui sacamos la nota media de TODOS los test de un contenido. Los test como tal no nos importan para las estadisticas.
            //para sacar las notas por test, usar la siguiente consulta: 
            //SELECT ats.testId,ats.studentId, AVG(ats.score) as notaMediaTest ,c.id as contentId, c.name as contentName FROM answer_test ats, content c, test t WHERE ats.studentId = ? and ats.testId = t.id and t.content_id = c.id group by t.id 
            var sql = "SELECT ats.testId,ats.studentId, AVG(ats.score) as notaMediaContenido ,c.id as contentId, c.name as contentName FROM answer_test ats, content c, test t WHERE ats.studentId = ? and ats.testId = t.id and t.content_id = c.id group by c.id ";

            //esto mide las estadisticas con los fallos y aciertos a determinadas preguntas, para medir por tipos de preguntas solo hay que modificar levemente la siguiente consulta
            var sql2 = "SELECT aq.studentId ,aq.questionId, q.statement , q.type, COUNT(CASE WHEN aq.correct=1 THEN 1 END) AS numAciertos, COUNT(CASE WHEN aq.correct=0 THEN 1 END) AS numFallos FROM answer_question aq, question q WHERE aq.studentId = ? and aq.questionId = q.id group by q.id ";
            conexion.query(sql, [usuario.email],
                function (err, result) {
                    console.log("[mysql error]", err);

                    if (!!err) { console.log("ERROR get contribuciones quest"); }

                    else {
                        var estadisticas = {
                            estadisticasTest: result,
                            estadisticasQuestions: ""
                        }
                        conexion.query(sql2, [usuario.email],
                            function (err, result) {
                                console.log("[mysql error]", err);
                                conexion.end();
                                if (!!err) { console.log("ERROR get contribuciones cont"); }

                                else {
                                    estadisticas.estadisticasQuestions = result;

                                    callback(null, estadisticas);
                                }
                            });
                    }
                });
        }
    });
}

function buscarEstadisticasClase(idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {

            var sql = "SELECT AVG(ats.score) as notaMediaContenido , COUNT(*) AS numTestAlumnos , c.id as contentId, c.name as contentName , s.name as sectionName FROM answer_test ats, test t, content_section cs ,content c, section s WHERE s.class_id = ?  and s.id = cs.id_section and cs.id_content = t.content_id and t.id = ats.testId and c.id = cs.id_content group by c.id ";

            //esto mide las estadisticas con los fallos y aciertos a determinadas preguntas, para medir por tipos de preguntas solo hay que modificar levemente la siguiente consulta
            var sql2 = "SELECT aq.questionId, q.statement , q.type, COUNT(CASE WHEN aq.correct=1 THEN 1 END) AS numAciertos, COUNT(CASE WHEN aq.correct=0 THEN 1 END) AS numFallos , c.name as contentName , s.name as sectionName FROM answer_question aq, question q, test t, content_section cs,content c, section s WHERE aq.questionId = q.id and q.test_id = t.id and t.content_id= cs.id_content and cs.id_section = s.id and s.class_id = ? and c.id =  t.content_id group by q.id  ";
            conexion.query(sql, [idClase],
                function (err, result) {
                    console.log("[mysql error]", err);

                    if (!!err) { console.log("ERROR get contribuciones clase quest"); }

                    else {
                        var estadisticasClase = {
                            estadisticasClaseTest: result,
                            estadisticasClaseQuestions: ""
                        }
                        conexion.query(sql2, [idClase],
                            function (err, result) {
                                console.log("[mysql error]", err);
                                conexion.end();
                                if (!!err) { console.log("ERROR get contribuciones clase cont"); }

                                else {
                                    estadisticasClase.estadisticasClaseQuestions = result;

                                    callback(null, estadisticasClase);
                                }
                            });
                    }
                });
        }
    });
}
function buscarContribucionesClase(idClase, callback) {
    if (callback === undefined)
        callback = function () { };

    var conexion = mysql.createConnection(datosConexion);

    conexion.connect(function (err) {
        if (err) {
            callback(err);
        }
        else {
            var sql = "SELECT sq.* , cs.id_section,c.name as contentName, s.name as sectionName FROM student_question_contributions sq, content_section cs, section s, content c WHERE sq.contentId = cs.id_content and cs.id_section = s.id and s.class_id = ? and c.id = cs.id_content ";
            var sql2 = "SELECT sc.*, s.name as sectionName FROM student_content_contributions sc , section s WHERE s.id = sc.sectionId and s.class_id = ?";
            conexion.query(sql, [idClase],
                function (err, result) {
                    console.log("[mysql error]", err);

                    if (!!err) { console.log("ERROR get contribuciones clase quest"); }

                    else {
                        var contribucionesClase = {
                            contrEjerciciosClase: result,
                            contrContenidosClase: ""
                        }
                        conexion.query(sql2, [idClase],
                            function (err, result) {
                                console.log("[mysql error]", err);
                                conexion.end();
                                if (!!err) { console.log("ERROR get contribuciones clase cont"); }

                                else {
                                    contribucionesClase.contrContenidosClase = result;

                                    callback(null, contribucionesClase);
                                }
                            });
                    }
                });
        }
    });
}
module.exports = {

    buscarPorMail: buscarPorMail,
    buscarClases: buscarClases,
    buscarAlumnos: buscarAlumnos,
    buscarAlumno: buscarAlumno,
    buscarClase: buscarClase,
    insertarClase: insertarClase,
    insertarSeccion: insertarSeccion,
    insertarContenido: insertarContenido,
    buscarSectionsClase: buscarSectionsClase,
    buscarSectionsAlumno: buscarSectionsAlumno,
    buscarContenidoSection: buscarContenidoSection,
    buscarSectionsAndContentClase: buscarSectionsAndContentClase,
    compruebaEsMiClase: compruebaEsMiClase,
    compruebaEsMiAlumno: compruebaEsMiAlumno,
    buscarClasesAlumno: buscarClasesAlumno,
    insertarSolicitudContenido: insertarSolicitudContenido,
    insertarSolicitudEjercicioTF: insertarSolicitudEjercicioTF,
    insertarSolicitudEjercicioDQ: insertarSolicitudEjercicioDQ,
    insertarSolicitudEjercicioFG: insertarSolicitudEjercicioFG,
    insertarSolicitudEjercicioMA: insertarSolicitudEjercicioMA,
    insertarSolicitudEjercicioOS: insertarSolicitudEjercicioOS,
    insertarSolicitudEjercicioPW: insertarSolicitudEjercicioPW,
    insertarSolicitudEjercicioRT: insertarSolicitudEjercicioRT,
    buscarMisSolicitudesPendientesEj: buscarMisSolicitudesPendientesEj,
    buscarMisSolicitudesPendientesCont: buscarMisSolicitudesPendientesCont,
    getSolicitudEjercicioParteEspecifica: getSolicitudEjercicioParteEspecifica,
    aceptarSolicitudEjercicio: aceptarSolicitudEjercicio,
    eliminarSolicitudEjercicio: eliminarSolicitudEjercicio,
    eliminarSolicitudContenido: eliminarSolicitudContenido,
    Get_no_test_quest_contents: Get_no_test_quest_contents,
    Get_no_test_quest: Get_no_test_quest,
    insertarTestGenerado: insertarTestGenerado,
    eliminarTestRequestQuestions: eliminarTestRequestQuestions,
    insentarImagenPrueba: insentarImagenPrueba,
    numeroSolicitudes: numeroSolicitudes,
    compruebaPertenezcoAClase: compruebaPertenezcoAClase,
    insertarContribucionEjercicio: insertarContribucionEjercicio,
    insertarContribucionContenido: insertarContribucionContenido,
    buscarContribucionesAlumno: buscarContribucionesAlumno,
    buscarEstadisticasAlumno: buscarEstadisticasAlumno,
    buscarEstadisticasClase: buscarEstadisticasClase,
    buscarContribucionesClase: buscarContribucionesClase



}
