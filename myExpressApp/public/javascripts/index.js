
$(document).ready(function() {
  $("#input_content").focus();
 
  var socket = io.connect();
  var from = $.cookie('user');//message from
  var to = 'all';//message to

  socket.emit('online', {user: from});
  socket.on('online', function (data) {
    if (data.user != from) {
      var sys = '<div>' + data.user + ' online! ' + ' ' + time() + '</div>';
    } else {
      $("#contents").innerHTML = '';
      for (var i = 0; i < data.messages.length; i++){
        message = data.messages[i];
        $("#contents").append(msg(message.username,message.createTime,message.content));
        document.getElementById('username').innerHTML = data.user;
      }
      var sys = '<div style="color:#999">System(' + time() + '):You enter in the chat room!</div>';
    }
    
    $("#contents").append(sys + "<br/>");
    $('#contents').scrollTop( $('#contents')[0].scrollHeight );   
    refreshUsers(data.users_online);
  });

  socket.on('say', function (data) {
    // when the message received from who is chatting with currently. 
    if (to == data.display){
      $("#contents").append(msg(data.data.from, data.data.time, data.data.msg));
    // the system notifies
    }else{
      var sys = '<div style="color:#999">System(' + time() + '):' + 'A new message from ' + data.display + '.</div>';
      $("#contents").append(sys + "<br/>");
    }
    $('#contents').scrollTop( $('#contents')[0].scrollHeight );
  });

  socket.on('offline', function (data) {
    var sys = '<div style="color:#999">System(' + time() + '):' + data.user + ' goes offline!</div>';
    $("#contents").append(sys + "<br/>");
    refreshUsers(data.users_online);
    if (data.user == to) {
      to = "all";
    }
    $('#contents').scrollTop( $('#contents')[0].scrollHeight );
  });

  // socket.on('disconnect', function() {
  //   var sys = '<div style="color:#999">System:Connect failed！</div>';
  //   $("#contents").append(sys + "<br/>");
  //   $("#list").empty();
  //   $('#contents').scrollTop( $('#contents')[0].scrollHeight );
  // });

  $("#say").click(function() {
    var $msg = $("#input_content").val();
    if ($msg == "") return;
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    // var time = time();
    $("#contents").append(msg(from,time,$msg));
    socket.emit('say', {from: from, to: to, msg: $msg, time:time});
    $('#contents').scrollTop( $('#contents')[0].scrollHeight );
    $("#input_content").attr( "value" , "" );
    $("#input_content").focus();
  });

  $("#logout").click(function(){
    socket.emit('disconnect')
    location.href = 'login';
  });

// refresh user list
  function refreshUsers(users) {
    $("#list").empty().append('<li alt="all" >Online Users</li>');
    for (var i in users) {
      $("#list").append('<li alt="' + users[i] + '" >' + users[i] + '</li>');
    }
    
  }

  // time
  function time() {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }
  // message
  function msg(name, time, content){
    var msg = '<div>'
          +   name
          +  '  '
          +  '<span>'
          +   time
          +  '</span>'
          +  '<br>'
          +  content
          +  '</div>';
    return msg;
  }

  
});