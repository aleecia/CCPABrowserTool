'use strict';
$(document).ready(function () {
    
    $('#submitemail').on("click" ,function() {
        var emailadd = $("#input_email").val()
        var ccpaheader =""
        if($("#request_info").is(":checked")){
            ccpaheader = ccpaheader.concat("1")
        }
        else{
            ccpaheader = ccpaheader.concat("u")
        }
        if($("#request_delete").is(":checked")){
            ccpaheader = ccpaheader.concat("1")
        }
        else{
            ccpaheader = ccpaheader.concat("u")
        }
        if($("#nosell").is(":checked")){
            ccpaheader = ccpaheader.concat("1")
        }
        else{
            ccpaheader = ccpaheader.concat("u")
        }
        SendtoDatabrokers(ccpaheader,emailadd)
        
    });

    function SendtoDatabrokers(ccpaheader,email){
        $.ajax({
            type:"Get",
            url:"data-brokers.csv",
            dataType:"text",
            success:function(data){
                var lines = data.split("\n")
                lines.splice(0,1)
                lines.forEach(item=>{
                    $.ajax({
                        method:"GET",
                        url:item,
                        data:{email: email},
                        headers:{"ccpa1":ccpaheader},
                        error:function(xhr, status, error){
                            return
                        },
                    })
                })
            }
        })
        alert("Your request have been sent to data brokers in the data broker list")
    }
});
