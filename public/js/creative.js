/*!
 * Slightly adapted script, based on:
 *
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });
    $('#logoutButton').hide();
    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    //DISABLED FOR DROPDOWN MENU IN COLLAPSED NAVBAR VIEW
    // Closes the Responsive Menu on Menu Item Click
   // $('.navbar-collapse ul li a').click(function() {
   //     $('.navbar-toggle:visible').click();
   // }); 


    var windowWidth = window.innerWidth;
    if (windowWidth < 769) {
        $('#dropdownMenu').remove();
        $('#caret1').remove();
        $('.dropdown-toggle').click(function () {
            $('.dropdown-menu').toggle();
        })
    }

    if (windowWidth > 768) {
        $('.logoutButton').remove();
        $('.settingsButton').remove();
        $('.dropdown-toggle').mouseover(function () {
            $('.dropdown-menu').show();
        })

        $('.dropdown-toggle').mouseout(function () {
            var t = setTimeout(function () {
                $('.dropdown-menu').hide();
            }, 100);

            $('.dropdown-menu').on('mouseenter', function () {
                $('.dropdown-menu').show();
                clearTimeout(t);
            }).on('mouseleave', function () {
                $('.dropdown-menu').hide();
            })
        })
    }





    // Fit Text Plugin for Main Header
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize WOW.js Scrolling Animations
    new WOW().init();

})(jQuery); // End of use strict
