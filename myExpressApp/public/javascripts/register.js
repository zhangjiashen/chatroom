$(function(){ 
    $("#login1").click(function(){ 
        location.href = 'login';
    });
    $("#register1").click(function(){ 
        var username = $("#username").val();
        var password = $("#password").val();
        var password1 = $("#passwordConfirm").val();
        var data = {"username":username,"password":password,"password1":password1};
        $.ajax({ 
            url: '/register',
            type: 'post',
            data: data,
            success: function(data,status){ 
                if(status == 'success'){ 
                    location.href = 'login';
                }
            },
            error: function(data,status){ 
                if (status == 'error') {
                    console.log('Register error!');
                }
            }
        }); 
    });
});