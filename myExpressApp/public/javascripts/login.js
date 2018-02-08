$(function(){ 
    $("#register").click(function(){ 
        location.href = 'register';
    });
    $("#login").click(function(){ 
        var username = $("#username").val();
        var password = $("#password").val();
        var data = {"username":username,"password":password};
        $.ajax({ 
            url:'/login',
            type:'post',
            data: data,
            success: function(data, status){ 
                if(status == 'success'){ 
                    location.href = '/';
                    console.log('success');
                }
            },
            error: function(data, status){ 
                if(status == 'error'){ 
                    //location.href = '/login';
                    console.log('Login Error!');
                }
            }
        });
    });
});