"use strict";

$(function () {


  //contribuciones
  var contribuciones = JSON.parse($('#contribucionesHidden').text());
  console.log(contribuciones);
  var ejAceptados = 0;
  var ejRechazados = 0;
  var contAceptados = 0;
  var contRechazados = 0;
  contribuciones.contrContenidos.forEach(function (valor, indice) {
    if (valor.acepted == 0) {
      contRechazados++;
    } else {
      contAceptados++;
    }



  });
  contribuciones.contrEjercicios.forEach(function (valor, indice) {
    if (valor.acepted == 0) {
      ejRechazados++;
    } else {
      ejAceptados++;
    }

  });
  var porcentajeAceptado = (ejAceptados + contAceptados) / (contribuciones.contrEjercicios.length + contribuciones.contrContenidos.length) * 100;
  $('#porcentajeContrAceptadosChart').text("El " + porcentajeAceptado.toFixed(2) + "%" + " de tus contribuciones han sido aceptadas");

  //estadisticas
  var estadisticas = JSON.parse($('#estadisticasHidden').text());
  var estadisticasContenidos = estadisticas.estadisticasTest;
  var notaMedia = 0;
  estadisticasContenidos.forEach(function (valor, indice) {
    notaMedia = notaMedia + valor.notaMediaContenido;
  });
  notaMedia = notaMedia / estadisticasContenidos.length;
  $('#notaMediaPerfil').text(notaMedia.toFixed(2));
  console.log(estadisticasContenidos);

  //***********************default --> stat chars *********************************

  statsCharts();

  //******************************************contribuciones*****************************************************************
  $('a[data-toggle="tab"][href="#aportacionesStud"]').on('shown.bs.tab', function (e) {
    contrChars();
  });

  //**************************************estadisticas****************************************************************
  $('a[data-toggle="tab"][href="#estadisticasStud"]').on('shown.bs.tab', function (e) {
    statsCharts();

  });

  function contrChars() {

    /* ChartJS
   * -------
   * Here we will create a few charts using ChartJS
   */

    //--------------
    //- AREA CHART -
    //--------------
    /*
        // Get context with jQuery - using jQuery's .get() method.
        var areaChartCanvas = $("#areaChart").get(0).getContext("2d");
        // This will get the first returned node in the jQuery collection.
        var areaChart = new Chart(areaChartCanvas);
    
        var areaChartData = {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
              label: "Electronics",
              fillColor: "rgba(210, 214, 222, 1)",
              strokeColor: "rgba(210, 214, 222, 1)",
              pointColor: "rgba(210, 214, 222, 1)",
              pointStrokeColor: "#c1c7d1",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
              label: "Digital Goods",
              fillColor: "rgba(60,141,188,0.9)",
              strokeColor: "rgba(60,141,188,0.8)",
              pointColor: "#3b8bba",
              pointStrokeColor: "rgba(60,141,188,1)",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(60,141,188,1)",
              data: [28, 48, 40, 19, 86, 27, 90]
            }
          ]
        };
    
        var areaChartOptions = {
          //Boolean - If we should show the scale at all
          showScale: true,
          //Boolean - Whether grid lines are shown across the chart
          scaleShowGridLines: false,
          //String - Colour of the grid lines
          scaleGridLineColor: "rgba(0,0,0,.05)",
          //Number - Width of the grid lines
          scaleGridLineWidth: 1,
          //Boolean - Whether to show horizontal lines (except X axis)
          scaleShowHorizontalLines: true,
          //Boolean - Whether to show vertical lines (except Y axis)
          scaleShowVerticalLines: true,
          //Boolean - Whether the line is curved between points
          bezierCurve: true,
          //Number - Tension of the bezier curve between points
          bezierCurveTension: 0.3,
          //Boolean - Whether to show a dot for each point
          pointDot: false,
          //Number - Radius of each point dot in pixels
          pointDotRadius: 4,
          //Number - Pixel width of point dot stroke
          pointDotStrokeWidth: 1,
          //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
          pointHitDetectionRadius: 20,
          //Boolean - Whether to show a stroke for datasets
          datasetStroke: true,
          //Number - Pixel width of dataset stroke
          datasetStrokeWidth: 2,
          //Boolean - Whether to fill the dataset with a color
          datasetFill: true,
          //String - A legend template
          //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
          maintainAspectRatio: true,
          //Boolean - whether to make the chart responsive to window resizing
          responsive: true
        };
    
        //Create the line chart
        areaChart.Line(areaChartData, areaChartOptions);
    
        //-------------
        //- LINE CHART -
        //--------------
        var lineChartCanvas = $("#lineChart").get(0).getContext("2d");
    
    
    
    
        var lineChart = new Chart(lineChartCanvas);
        var lineChartOptions = areaChartOptions;
        lineChartOptions.datasetFill = false;
        lineChart.Line(areaChartData, lineChartOptions);
    */
    //-------------
    //- PIE CHART -
    //-------------
    // Get context with jQuery - using jQuery's .get() method.
    var pieChartCanvas = $("#contrPieChartSTD").get(0).getContext("2d");

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

    /*
        //-------------
        //- BAR CHART -
        //-------------
        var barChartCanvas = $("#barChart").get(0).getContext("2d");
        var barChart = new Chart(barChartCanvas);
        var barChartData = areaChartData;
        barChartData.datasets[1].fillColor = "#00a65a";
        barChartData.datasets[1].strokeColor = "#00a65a";
        barChartData.datasets[1].pointColor = "#00a65a";
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
        barChart.Bar(barChartData, barChartOptions);*/
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
    var barChartCanvas = $("#statBarChartSTD").get(0).getContext("2d");
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
