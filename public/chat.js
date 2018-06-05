$(function () {
  var socket = io();
  var idClase = $('#idClase').val();
  var user = $('#userMail').val();
  var yourName = $("#yourName");

  socket.on('connect', function () {
    socket.emit('join', idClase);
  });


  $('form').submit(function () {
    name = $.trim(yourName.val());
    socket.emit('chat message', { msg: $('#message').val(), user: user, idClase: $('#idClase').val() });
    scrollToBottom();
    return false;
  });

  socket.on('chat message', function (data) {



    var who = "";
    if (data.user === name) {
      who = 'me';
      console.log("MIO: " + user + " == " + name)
    }
    else {
      who = 'you';
      console.log("TUYO: " + user + " =/= " + name)
    }

    var li = $(
      '<li class=' + who + '>' +
      '<div class="imageChat">' +
      '<img src="../img/unnamed.jpg" />' +
      '<b></b>' +
      '<i class="timesent" data-time=' + moment() + '></i> ' +
      '</div>' +
      '<p></p>' +
      '</li>');

    li.find('p').text(data.msg);
    li.find('b').text(data.user);
    //  $('#messages').append(li);
    $('.chats').append(li);


    scrollToBottom();
    
  });

  //para que el chat vaya abajo cada vez que se escribe
  
  function scrollToBottom(){
    document.getElementById('chatscreen').scrollTop = document.getElementById('chatscreen').scrollHeight ;
  }

  //para poder usar el enter en el textarea
        $('#message').keydown(function (e) {
          if (e.keyCode == 13) {
              e.preventDefault();
              document.getElementById("m").click();
              $('#message').val('').focus();
          }
      });

});