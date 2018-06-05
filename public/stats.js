"use strict";
$(document).ready(function () {

	//Mostramos y ocultamos elementos
	//Mostramos y ocultamos elementos
	$('#tablaClases').DataTable({
		"paging": true,
		"lengthChange": true,
		"searching": true,
		"ordering": true,
		"info": true,
		"searching": true,
		"autoWidth": true,
		"responsive": true,
		"language": {
			"emptyTable": "<b>¡No tienes ninguna clase asignada!</b>"
		}
	});
	$('#tablaAlumnos').DataTable({
		"paging": true,
		"lengthChange": true,
		"ordering": true,
		"info": true,
		"searching": true,
		"autoWidth": true,
		"responsive": true,
		"language": {
			"emptyTable": "<b>¡No tienes ningun alumno en tus clases!</b>"
		}

	});
	$('#tablaContenidos').DataTable({
		"paging": true,
		"lengthChange": true,
		"ordering": true,
		"info": true,
		"searching": true,
		"autoWidth": true,
		"responsive": true,
		"language": {
			"emptyTable": "<b>¡Esta clase no tiene ningún contenido!</b>"
		}

	});
	$('#tablaSolicitudesEj').DataTable({
		"paging": true,
		"lengthChange": true,
		"ordering": true,
		"info": true,
		"searching": true,
		"autoWidth": true,
		"responsive": true,
		"language": {
			"emptyTable": "<b>¡No tiene ninguna solicitud de ejercicios pendiente!</b>"
		}

	});
	$('#tablaSolicitudesCont').DataTable({
		"paging": true,
		"lengthChange": true,
		"ordering": true,
		"info": true,
		"searching": true,
		"autoWidth": true,
		"responsive": true,
		"language": {
			"emptyTable": "<b>¡No tiene ninguna solicitud de contenido pendiente!</b>"
		}

	});

	$("#numPalabrasFG").change(function () {

		$("#inputsPalabrasClave").empty();
		console.log("aaaaaaaaaaaaaa");
		var HTMLpalabrasClave = "";
		for (var i = 0; i < $('#numPalabrasFG').val(); i++) {
			HTMLpalabrasClave = HTMLpalabrasClave + '    <div class="form-group">  ' +
				'                                 <label for="palabraClave' + (i + 1) + '">Palabra nº' + (i + 1) + ' </label>  ' +
				'                                 <input type="text" class="form-control" required = "true" maxlength="30" name="palabraClave' + (i + 1) + '" id="palabraClave' + (i + 1) + '" placeholder="Escribe la palabra">  ' +
				'                              </div>  ';

		}
		$("#inputsPalabrasClave").append(HTMLpalabrasClave);


	});


	$("#numFrasesOS").change(function () {
		$("#inputsFrasesOS").empty();
		var numFrasesOS = $('#numFrasesOS').val();
		var HTMLPosiblesRespuestas = "";
		var HTMLOptOrdenReal = "";
		for (var i = 0; i < numFrasesOS; i++) {
			HTMLOptOrdenReal = HTMLOptOrdenReal + '   <option>' + (i + 1) + '</option>  ';
		}
		for (var i = 0; i < numFrasesOS; i++) {
			HTMLPosiblesRespuestas = HTMLPosiblesRespuestas + '                               <div class="row">  ' +
				'                                   <div class = "col-xs-9">                                ' +
				'                                     <div class="form-group">   ' +
				'                                     ' +
				'                                       <label for="fraseOS">Frase nº' + (i + 1) + ' (Orden a mostrar al usuario)</label>  ' +
				'                                       <input type="text" class="form-control" required = "true" maxlength="250" name="fraseOS' + (i + 1) + '" id="fraseOS' + (i + 1) + '" placeholder="Escribe la frase (max 250 c)">  ' +
				'           ' +
				'                                     </div>   ' +
				'                                   </div>  ' +
				'                                   <div class = "col-xs-3">      ' +
				'                                     <div class="form-group">  ' +
				'                                       <label for="ordenRealFrasesOS' + (i + 1) + '">Orden real:</label>  ' +
				'                                       <select class="form-control" id= "ordenRealFrasesOS' + (i + 1) + '" name="ordenRealFrasesOS' + (i + 1) + '">  ' +
				HTMLOptOrdenReal +
				'                                        </select>  ' +
				'                                     </div>  ' +
				'                                   </div>  ' +
				'                              </div>  ';

		}
		$("#inputsFrasesOS").append(HTMLPosiblesRespuestas);

	});

	$("#numConceptosPW").change(function () {
		$("#inputsConceptosPW").empty();
		var HTMLpalabrasClave = "";
		for (var i = 0; i < $('#numConceptosPW').val(); i++) {
			HTMLpalabrasClave = HTMLpalabrasClave + '<div class ="row">' +
				'  <div class="col-xs-6">  <div class="form-group">  ' +
				'                                 <label for="concepto1PW' + (i + 1) + '">Concepto nº' + (i + 1) + ' </label>  ' +
				'                                 <input type="text" class="form-control" required = "true" maxlength="100" name="concepto1PW' + (i + 1) + '" id="concepto1PW' + (i + 1) + '" placeholder="Escribe el Concepto 1">  ' +
				'                              </div></div>  ' +
				' 							 <div class="col-xs-6">  <div class="form-group">  ' +
				'                                 <label for="concepto2PW' + (i + 1) + '">Pareja del concepto nº' + (i + 1) + ' </label>  ' +
				'                                 <input type="text" class="form-control" required = "true" maxlength="100" name="concepto2PW' + (i + 1) + '" id="concepto2PW' + (i + 1) + '" placeholder="Escribe la pareja del Concepto 1">  ' +
				'                              </div></div>  ' +
				'</div>';

		}
		$("#inputsConceptosPW").append(HTMLpalabrasClave);
	});

	$("#numConceptosRT").change(function () {
		$("#inputsConceptosRT").empty();
		var HTMLpalabrasClave = "";
		var firstRad = "checked = 'true'";
		for (var i = 0; i < $('#numConceptosRT').val(); i++) {
			HTMLpalabrasClave = HTMLpalabrasClave + '<div class ="row">' +
				'  <div class="col-xs-5">  <div class="form-group">  ' +
				'                                 <label for="tituloRT' + (i + 1) + '">Titulo nº' + (i + 1) + ' </label>  ' +
				'                                 <input type="text" class="form-control" required = "true" maxlength="100" name="tituloRT' + (i + 1) + '" id="tituloRT' + (i + 1) + '" placeholder="Escribe el titulo...">  ' +
				'                              </div></div>  ' +
				' 							 <div class="col-xs-5">  <div class="form-group">  ' +
				'                                 <label for="temaRT' + (i + 1) + '">Tema nº' + (i + 1) + ' </label>  ' +
				'                                 <input type="text" class="form-control" required = "true" maxlength="200" name="temaRT' + (i + 1) + '" id="temaRT' + (i + 1) + '" placeholder="Escribe el tema...">  ' +
				'                              </div></div>  ' +
				' 							 <div class="col-xs-2">  <div class="form-group"> <div class="radio"> ' +
				'								<label> <input name="radioRT"' + firstRad + '  id="radioCorrectoRT' + (i + 1) + '" value="' + i + '" type="radio"> Titulo y tema correctos. </label>' +
				'                              </div></div></div>  ' +
				'</div>';
			firstRad = "";
		}

		$("#inputsConceptosRT").append(HTMLpalabrasClave);
	});

	$("#numRespuestasMA").change(function () {
		$("#inputsPosiblesRespuestasMA").empty();
		var HTMLpalabrasClave = "";

		for (var i = 0; i < $('#numRespuestasMA').val(); i++) {
			HTMLpalabrasClave = HTMLpalabrasClave + '<div class ="row">' +
				' 							 <div class="col-xs-9">  <div class="form-group">  ' +
				'                                 <label for="posibleRespuestaMA' + (i + 1) + '">Respuesta nº' + (i + 1) + ' </label>  ' +
				'                                 <input type="text" class="form-control" required = "true" maxlength="200" name="posibleRespuestaMA' + (i + 1) + '" id="posibleRespuestaMA' + (i + 1) + '" placeholder="Escribe el tema...">  ' +
				'                              </div></div>  ' +
				' 							 <div class="col-xs-3">  <div class="form-group"> <div class="ckeckbox"> ' +
				'								<label> <input name="chkMA' + (i + 1) + '"  id="chkMA" value = "1" type="checkbox"> Respuesta Correcta. </label>' +
				'                              </div></div></div> </div> ' +
				'   <div class="form-group">  ' +
				'   		<label>Comentario sobre la respuesta:</label>  ' +
				'   		<textarea class="form-control" required="true" maxlength="1000" name="comentarioMA' + (i + 1) + '" rows="2" placeholder="Introduce el comentario del ejercicio, explicando por que es o no correcta la respuesta... (Max. 1000 caracteres )"></textarea>  ' +
				'  	</div>  ';


		}

		$("#inputsPosiblesRespuestasMA").append(HTMLpalabrasClave);

	});
	$("#contenidosConEjs").change(function () {
		$("#numEjsContent").empty();
		$("#numEjsAniadir1").empty();

		if ($(this).val() == "error"){
		
			var HTMLnumEjsAniadirOpt = "<option disabled >No hay suficientes ejercicios</option>";
			var HTMLpintaEjs = '<h3 class = "success">' + "Elija un contenido valido" + '</h3>';
			var HTMLnumEjsAniadir = '                                              <div class="form-group">  ' +
			'                                                   <label for="numEjercicios">Cantidad de ejercicios a añadir (entre 5 y 10)</label>  ' +
			'                                                     <select class="form-control" id="numEjercicios" name="numEjercicios" required = "true">  ' +
			HTMLnumEjsAniadirOpt +
			'                                                     </select>  ' +
			'                                                </div>  ';


			$("#numEjsContent").append(HTMLpintaEjs);
			$("#numEjsAniadir1").append(HTMLnumEjsAniadir);
			
		}else{
			
			var content = JSON.parse($(this).val());
			var HTMLpintaEjs = '<h3 class = "success">' + content.numEjercicios + '</h3>';
	
	
			var HTMLnumEjsAniadirOpt = "";
			if (Number(content.numEjercicios) >= 5) {
				for (var i = 5; i <= Number(content.numEjercicios); i++) {
					HTMLnumEjsAniadirOpt = HTMLnumEjsAniadirOpt + "<option>" + i + "</option>";
				}
			} else {
				//no 
				HTMLnumEjsAniadirOpt = "<option disabled >No hay suficientes ejercicios</option>";
			}
	
	
			var HTMLnumEjsAniadir = '                                              <div class="form-group">  ' +
				'                                                   <label for="numEjercicios">Cantidad de ejercicios a añadir (entre 5 y 10)</label>  ' +
				'                                                     <select class="form-control" id="numEjercicios" name="numEjercicios" required = "true">  ' +
				HTMLnumEjsAniadirOpt +
				'                                                     </select>  ' +
				'                                                </div>  ';
	
			$("#numEjsContent").append(HTMLpintaEjs);
			$("#numEjsAniadir1").append(HTMLnumEjsAniadir);
	
		}
		
	});





});
