'use strict';

$(document).ready(function () {

    /**
     * Bind callbacks
     */
    $('#start').on('click', function () {
        $('#start').hide();
        $('#intro').hide();
        $('#item1').show();
    });

    $('.goback').on('click', function () {
        $('.item').hide();
        $('#start').show();
        $('#intro').show();
    });

    $('#for-self').on('click', function () {
        $('#item1').hide();
        $('#item2').show();
    });

    $('#for-child').on('click', function () {
        $('#item1').hide();
        $('#item5').show();
        $('#parent-finish').attr('disabled', true);
    });

    /* For-self */

    $('#submit-birthday').on('click', function () {
        // TODO: Validate birthday
        var birthday = moment($('#birthday').val());
        var today = moment();
        var age = today.diff(birthday, 'years');
        setUserDOB($('#birthday').val());
        
        $('#item2').hide();

        if (age >= 13 && age < 16) {
            $('#item4').show();
            $('#item7').show();
            $('#allow-sell').attr('disabled', false);
        } else if (age < 13) {
            $('#item4').show();
            $('#item8').show();
            $('#item7').show();
            $('#allow-sell').attr('disabled', true);
        } else {
            $('#item7').show();
        }

        $('#end-guide').show();
    });

    $('#parent-consent').on('change', function () {
        if ($(this).is(':checked')) {
            $('#allow-sell').attr('disabled', false);
        } else {
            $('#allow-sell').attr('disabled', true);
        }
    })

    /* For-child */

    $(function () {
        var $password = $(".form-control[type='password']");
        var $passwordAlert = $(".password-alert");
        var $requirements = $(".requirements");
        var leng, specialChar;
        var $leng = $(".leng");
        var $specialChar = $(".special-char");
        var specialChars = "!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~";

        $requirements.addClass("wrong");
        $password.on("focus", function () {
            $passwordAlert.css('display', 'inline-block');
        });

        $password.on("input blur", function (e) {
            var el = $(this);
            var val = el.val();
            $passwordAlert.show();

            if (val.length < 4 || val.length > 10) {
                leng = false;
            } else {
                leng = true;
            }

            specialChar = false;
            for (var i = 0; i < val.length; i++) {
                for (var j = 0; j < specialChars.length; j++) {
                    if (val[i] == specialChars[j]) {
                        specialChar = true;
                    }
                }
            }
            if (leng == true && specialChar == true) {
                $(this).addClass("valid").removeClass("invalid");
                $requirements.removeClass("wrong").addClass("good");
                $passwordAlert.removeClass("alert-warning").addClass("alert-success");
                $('#parent-finish').attr('disabled', false);
            } else {
                $(this).addClass("invalid").removeClass("valid");
                $passwordAlert.removeClass("alert-success").addClass("alert-warning");

                if (leng == false) {
                    $leng.addClass("wrong").removeClass("good");
                } else {
                    $leng.addClass("good").removeClass("wrong");
                }

                if (specialChar == false) {
                    $specialChar.addClass("wrong").removeClass("good");
                } else {
                    $specialChar.addClass("good").removeClass("wrong");
                }
            }
        });
    });

    $('#finish').on('click', function () {
        setDefaultPreference($('input[name=allow-sell-radio-group]:checked').val());
        getDefaultPreference()
            .then(data => {
                var defaultPreference = data.default;
                // console.log('default: ' + defaultPreference);
            });
    });

    $('#parent-finish').on('click', function () {
        setDefaultPreference($('input[name=parent-allow-sell-radio-group]:checked').val());
        setParentPassword($('#input-password').val());
        setIsParentMode(true);
        /* TEST CONSOLE
        console.log('password input', $('#input-password').val());
        getParentPassword().then(data => { console.log ('pw', data)});
        getIsParentMode().then(data => { console.log ('mode', data)});
        */
    });
});