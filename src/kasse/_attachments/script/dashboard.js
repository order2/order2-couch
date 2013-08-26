/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
(function() {
  var $ = jQuery,
      path = unescape(document.location.pathname).split('/'),
      db_design = path[3],
      db_name =  path[1],
      last_categ;

  login( );

  function login( ) {
    $.couch.session({
      success: function( data ) {
        if( !data.userCtx.name && data.userCtx.roles.indexOf('_admin') != -1 ) {
          $.settings.user = data; 
          $.settings.connect( db_name, init ); 
        } else {
          $( '#account' ).couchLogin({
            loggedIn : function( user ) { 
                $.settings.user = user; 
                $.settings.connect( db_name, init ); },
            loggedOut : function( user ) {
                $.settings.user = null; 
            } }); 
        }
      }});  
  }

  function raiseError( e ) {
    alert( e );
    return e;
  }
  function raiseQ( e ) {
    return true;
    return confirm( e );
  }
  function init( settings ) {
    var $nav = $( '#dashboard .nav' ),
        mouse_event = $.settings.deviceinfo.mouse_event;

    $( '.page' ).hide( );
    $nav.html( '' );

    if( !settings.user ) { 
      window.location.href = 'index.html';
      exit; }

    $( '#articles' ).html( '' );
    $artl = $( '<a class="button articles" title="articles" href="#articles">articles</a>' )
      .bind( mouse_event, function( e ) {
          e.preventDefault( );
          shw( 'articles' ); });
    $nav.append( $artl );

    $( '#journal' ).html( '' ).ncjournal( settings );
    $journall = $( '<a class="button journal" title="journal" href="#journal">journal</a>' )
      .bind( mouse_event, function( e ) {
          e.preventDefault( );
          shw( 'journal' ); });
    $nav.append( $journall );

    $deviceinfol = $( '<a class="button deviceinfo" title="deviceinfo" href="#deviceinfo">deviceinfo</a>' )
      .bind( mouse_event, function( e ) {
          e.preventDefault( );
          $( '#deviceinfo' ).html( '' );
          $( '#deviceinfo' ).append( $.mustache( $( '#deviceinfo-tpl' ).html( ), $.settings.deviceinfo ) );
          shw( 'deviceinfo' ); });
    $nav.append( $deviceinfol );

    $resyncdonel = $( '<a class="" title="sync ok" href="#dashboard">ok</a>' )
      .bind( mouse_event, function( e ) {
          e.preventDefault( );
          $( '#status' ).hide( ); });
    $resyncl = $( '<a class="button resync" title="resync" href="#resync">resync</a>' )
      .bind( mouse_event, function( e ) {
          e.preventDefault( );
          $( '#status' )
            .append( $resyncdonel )
            .show( ); });

    $nav.append( $resyncl );

    if( typeof window.location.hash === 'string' && window.location.hash ) {
      shw( window.location.hash.substring( 1 ) ); }
    else {
      shw( 'dashboard' ); }
      
    $( '.page' ).show( );
  }

  function clear( ) {
    $( '.content' ).hide( );
  }
  function shw( page ) {
    var el = $( '#'+page );
        mouse_event = $.settings.deviceinfo.mouse_event;
    if( el.length ) {
      if( page == 'dashboard' ) {
        $( '#dashboard' ).show( );
        $( '#usettings' ).show( );
        return false;
      } else if( page == 'articles' ) {
        var q = '';
        $.get( '/'+db_name+'/_design/artikel/_list/items/artikel', function ( data ) {
          $('#articles').html( data )
            .organicItems( { mouse_event: mouse_event,
                categ: last_categ,
                success: function( action, doc ) { 
                  last_categ = doc.categ;
                  shw( 'articles' ); }} );
              })
      }
      clear( );
      el.show( );
    }
  }

}).call( this )

