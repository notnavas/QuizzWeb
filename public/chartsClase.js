"use strict";

$(function () {


  //contribuciones
  var contribuciones = JSON.parse($('#contribucionesClaseHidden').text());
  console.log(contribuciones);
  var ejAceptados = 0;
  var ejRechazados = 0;
  var contAceptados = 0;
  var contRechazados = 0;
  contribuciones.contrContenidosClase.forEach(function (valor, indice) {
    if (valor.acepted == 0) {
      contRechazados++;
    } else {
      contAceptados++;
    }


  });
  contribuciones.contrEjerciciosClase.forEach(function (valor, indice) {
    if (valor.acepted == 0) {
      ejRechazados++;
    } else {
      ejAceptados++;
    }

  });
  var porcentajeAceptado = (ejAceptados + contAceptados) / (contribuciones.contrEjerciciosClase.length + contribuciones.contrContenidosClase.length) * 100;
  $('#porcentajeContrAceptadosClaseChart').text("El " + porcentajeAceptado.toFixed(2) + "%" + " de las contribuciones han sido aceptadas");

  //estadisticas
  var estadisticas = JSON.parse($('#estadisticasClaseHidden').text());
  var estadisticasContenidos = estadisticas.estadisticasClaseTest;
  var notaMedia = 0;
  estadisticasContenidos.forEach(function (valor, indice) {
    notaMedia = notaMedia + valor.notaMediaContenido;
  });
  notaMedia = notaMedia / estadisticasContenidos.length;
  $('#notaMediaPerfil').text(notaMedia.toFixed(2));
  console.log(estadisticasContenidos);

  //***********************default --> stat chars *********************************

  statsCharts();
  contrChars();


  //**************************************estadisticas****************************************************************
  $('a[data-toggle="tab"][href="#estadisticasClase"]').on('shown.bs.tab', function (e) {
    statsCharts();
    contrChars();

  });

  function contrChars() {

    var pieChartCanvas = $("#contrPieChartClase").get(0).getContext("2d");

    var pieChart = new Chart(pieChartCanvas);
    var PieData = [
      {
        value: contAceptados,
        color: "#00a65a",
        highlight: "#00a65a",
        label: "Contribuciones de contenido Aceptadas"
      },
      {
        value: contRechazados,
        color: "#f56954",
        highlight: "#f56954",
        label: "Contribuciones de contenido rechazadas"
      },
      {
        value: ejAceptados,
        color: "#00c0ef",
        highlight: "#00c0ef",
        label: "Contribuciones de ejercicios Aceptadas"
      },
      {
        value: ejRechazados,
        color: "#f39c12",
        highlight: "#f39c12",
        label: "Contribuciones de ejercicios rechazadas"
      },

    ];
    var pieOptions = {
      //Boolean - Whether we should show a stroke on each segment
      segmentShowStroke: true,
      //String - The colour of each segment stroke
      segmentStrokeColor: "#fff",
      //Number - The width of each segment stroke
      segmentStrokeWidth: 2,
      //Number - The percentage of the chart that we cut out of the middle
      percentageInnerCutout: 50, // This is 0 for Pie charts
      //Number - Amount of animation steps
      animationSteps: 100,
      //String - Animation easing effect
      animationEasing: "easeOutBounce",
      //Boolean - Whether we animate the rotation of the Doughnut
      animateRotate: true,
      //Boolean - Whether we animate scaling the Doughnut from the centre
      animateScale: true,
      //Boolean - whether to make the chart responsive to window resizing
      responsive: true,
      // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
      maintainAspectRatio: true,
      //String - A legend template
      legendTemplate: "<ul class=\"legend\"><% for (var i=0; i<PieData.length; i++){%><li><span style=\"background-color:<%=PieData[i].lineColor%>\"></span><%if(PieData[i].label){%><%=PieData[i].label%><%}%></li><%}%></ul>",
    };
    //Create pie or douhnut chart
    // You can switch between pie and douhnut using the method below.
    pieChart.Doughnut(PieData, pieOptions);

   
  }
  function statsCharts() {
    var contChartData = {
      labels: [],
      datasets: [
        {
          label: "Contenidos",
          fillColor: "#00a65a",
          strokeColor: "rgba(210, 214, 222, 1)",
          pointColor: "rgba(210, 214, 222, 1)",
          pointStrokeColor: "#c1c7d1",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: []
        }
      ]
    };
    estadisticasContenidos.forEach(function (valor, indice) {
      contChartData.labels.push(valor.contentName)
      contChartData.datasets[0].data.push(Number(valor.notaMediaContenido).toFixed(2))

    });
    console.log(contChartData)
    var barChartCanvas = $("#statBarChartClase").get(0).getContext("2d");
    var barChart = new Chart(barChartCanvas);
    var barChartData = contChartData;

    var barChartOptions = {
      //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      scaleBeginAtZero: true,
      //Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines: true,
      //String - Colour of the grid lines
      scaleGridLineColor: "rgba(0,0,0,.05)",
      //Number - Width of the grid lines
      scaleGridLineWidth: 1,
      //Boolean - Whether to show horizontal lines (except X axis)
      scaleShowHorizontalLines: true,
      //Boolean - Whether to show vertical lines (except Y axis)
      scaleShowVerticalLines: true,
      //Boolean - If there is a stroke on each bar
      barShowStroke: true,
      //Number - Pixel width of the bar stroke
      barStrokeWidth: 2,
      //Number - Spacing between each of the X value sets
      barValueSpacing: 5,
      //Number - Spacing between data sets within X values
      barDatasetSpacing: 1,
      //String - A legend template
      //Boolean - whether to make the chart responsive
      responsive: true,
      maintainAspectRatio: true
    };

    barChartOptions.datasetFill = false;
    barChart.Bar(barChartData, barChartOptions);
  }

});
