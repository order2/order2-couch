/**                        
 * order2 Items
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
(function($) {
    $.organicItems = function(el, options) {
        var base = this;
	var mouse_event = options.mouse_event;
        base.$el = $(el);

        base.init = function() {
            base.options = $.extend( { }, $.organicItems.defaultOptions, options );
            var vpx, vpy;

            if( base.options.categ ) {
                base.$el.find( '.tabs a' ).removeClass( 'current' );
                base.$el.find( '.view > div' ).hide( );
                base.$el.find( '#categ-'+ base.options.categ ).fadeIn( base.options.speed );
                base.$el.find( 'a[href="#categ-'+base.options.categ+'"]' ).addClass( 'current' );
            }

            var resizeViewport = function(){
              var screen_height = window.innerHeight; //screen.height
              if( vpy !== screen_height ){
                vpy = screen_height;
                base.$el.css( 'height', screen_height-5 ); } };      
            setInterval(resizeViewport, 300);

            base.$el.delegate( 'a', 'click', function( e ) {
                e.preventDefault( );
                return false;
            });

            base.$el.delegate( '.tabs a', mouse_event, function( e ) {
                e.preventDefault( );
                var $self = $(this),
                    listID = $self.attr("href").substring(1);

                base.$el.find( '.tabs a' ).removeClass( 'current' );

                if( !listID ) {
                  base.$el.find( '.view > div' ).show( );
                  $self.addClass( 'current' );
                  return false }
                   
                base.$el.find( '.view > div' ).hide( );
                base.$el.find( '#'+ listID )
                  .fadeIn( base.options.speed );
                $self.addClass( 'current' );

                //scrollTo( 0 ,0 );
                return false;
            });
            base.$el.delegate( '.item a', mouse_event, function( e ) {
                e.preventDefault( );
                $self = $(this);

                  base.$el.find( 'div.detail' ).remove( );
                  base.$el.find( 'li.item a.current' ).removeClass( 'current' );

                  $( '<div class="detail">' )
                    .load( $(this).attr( 'href' ), function( ) {
                      $( this ).find( 'form' ).itemForm({                     
                            success: function( action, doc ) { 
                              if( options.success ) {
                                options.success( action, doc); } }
                        }, {} )})
                    .appendTo( $self.parent( ));
                  $self.addClass( 'current' );
            });
            base.$el.delegate( '.actions a', mouse_event, function( e ) {
                e.preventDefault( );
                $self = $(this);

                base.$el.find( '.detail' ).remove( );
                base.$el.find( '.item .current' ).removeClass( 'current' );

                $( '<div class="new detail">' )
                  .load( $(this).attr( 'href' ), function( ) {
                      $( this ).find( 'form' ).itemForm({                     
                            success: function( action, doc ) {
                              if( options.success ) {
                                options.success( action, doc); } }
                        }, {} )})
                  .prependTo( base.$el.find( '.list' ) );
                $self.addClass( 'current' );
            });
        };
        base.init();
    };

    $.organicItems.defaultOptions = {
        "speed": .7 
    };

    $.fn.organicItems = function(options) {
        return this.each(function() {
            (new $.organicItems(this, options));
        });
    };
})(jQuery);
