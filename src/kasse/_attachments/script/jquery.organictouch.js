/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
(function($) {
    $.organicTabs = function(el, options) {
        var base = this;
	var mouse_event = options.mouse_event;
        base.$el = $(el);
        base.$wrap = base.$el.find(".view"),
        base.$nav = base.$el.find(".tabs");

        base.init = function() {
            base.options = $.extend( { }, $.organicTabs.defaultOptions, options );
            var vpx, vpy;

            var resizeViewport = function(){
              var screen_height = window.innerHeight; //screen.height
              if( vpy !== screen_height ){
                vpy = screen_height;
                base.$wrap.find("div.col")
                  .css( 'overflow-y', 'scroll' )
                  .css( 'height', screen_height-5 ); }
            };      
            setInterval(resizeViewport, 300);

            base.$nav.delegate("li > a", mouse_event, function( e ) {
                e.preventDefault( );
                  var $newList = $(this),
                      listID = $newList.attr("href").substring(1);

                  if( listID == 'all' ) {
                    base.$el.find(".tabs li a").removeClass("current");
                    $newList.addClass("current");
                    base.$wrap.addClass( 'cols' );
                    base.$wrap.find("div.full").hide( );
                    base.$wrap.find("div.col").show( ).scrollTop( 0 );
                      }
                  else {
                    base.$wrap.removeClass( 'cols' );
                    base.$wrap.find("div").hide( );
                    //base.$wrap.find("div").fadeOut(base.options.speed, function() {
                        base.$el.find("#"+listID)
                          .fadeIn(base.options.speed);
                        base.$el.find("#"+listID+'full')
                          .fadeIn(base.options.speed);
                        base.$el.find(".tabs li a").removeClass("current");
                        $newList.addClass("current").scrollTop( 0 );
                    //}); 
                    }
                scrollTo( 0 ,0 );
                return false;
            });
        };
        base.init();
    };

    $.organicTabs.defaultOptions = {
        "speed": .7 
    };

    $.fn.organicTabs = function(options) {
        return this.each(function() {
            (new $.organicTabs(this, options));
        });
    };
})(jQuery);
