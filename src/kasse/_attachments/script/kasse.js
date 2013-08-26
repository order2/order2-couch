/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
(function() {
  var $ = jQuery,

      path = unescape(document.location.pathname).split('/'),
        db_design = path[3],
        db_name =  path[1]
      tpl = { itemtpl: $( '#item-tpl' ).html( ),
            ordercontroltpl: $( '#ordercontrol-tpl' ).html( ),
            navitemtpl: $( '#navitem-tpl' ).html( ) },

      settings = { },
      articles = { },
      counts   = { },
      control_current = false,
      utimeout = null,
      tccnt_max = 12,
      ut_listdelay = 80,
      ut_delay = 300; // save is 400

  catnames = {
    'bier': 'Bier',
    'cocktails': 'Cocktails',
    'longdrink': 'Longdrink',
    'saft': 'Säfte/Softs',
    'shots': 'Shots',
    'wein': 'Wein/Sekt' };

  icons_cat = {
    'all': 'star_full',
    'bier': 'bottle5',
    'cocktails': 'glass_cocktail',
    'longdrink': 'glass_long',
    'saft': 'glass_round_small',
    'shots': 'glass_shot',
    'wein': 'glass_wine' }
  icons_width='52px';

  db.init( db_name );

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
                $.settings.connect( db_name, init ); 
      
                $( '.page' ).show( ); },
            loggedOut : function( user ) {
                $( '.page' ).hide( ); 
                $( '#dashboard .nav' ).html( '' );
      
                $( '#journal' ).html( '' );
                $( '#articles' ).html( '' );
                window.location.href = 'index.html';
      
                $.settings.user = null; 
            } }); 
  
        }
      }});  
  }

  function loaded() {
    setTimeout(function () {
      login( ); });
  }

  window.addEventListener('load', loaded, false);


  function raiseError( e ) {
    alert( e );
    return e;
  }
  function raiseQ( e ) {
    return true;
    return confirm( e );
  }
  function resize( ) {
    
    return false;
  }

  function resetCnt( id ) {
    delete counts[id];
    $( '#'+id+' .cnt' ).html( '' );
  }
  function clearCtrl( ) {
     control_current = false;
     $( '#ordercontrol' )
       .html( '' )
       .hide( );
  }
  function clearCnts( ) {
    var c = counts;
    for( var id in c ) {
        resetCnt( id );
        delete c[id];
    }
  }
  function updateStatus( action, e ) {
    if( action == 'book' ) {
        if( e ) {
            raiseError( e );
        } else {
            clearCnts( ); 
        }
    }
  }

  function increase( id, cid ) {
    window.clearTimeout( utimeout );
    var order = counts[id] || { };
    order['cnt'] = typeof( order['cnt'] ) == 'number' ? ++order['cnt'] : 1;
    if( typeof cid != 'undefined' && cid ) {
      if( !order['cl'] ) { 
        order['cl'] = { };
        order['cl'][cid] = 1; }
      else {
        var pcl = order['cl'][cid];
        order['cl'][cid] = typeof( pcl ) == 'number' ? ++pcl : 1; }}
    counts[id] = order;
    return order['cnt'];
  }
  function decrease( id, cid ) {
    window.clearTimeout( utimeout );
    var order = counts[id],
        cl = counts[id]['cl'],
        ret = false,
        cnt = typeof( order ) == 'object' ? --order.cnt : 0;
    if( cid && cl && cl[cid] ) {
      if( --cl[cid] < 1 ) {
        if( e = $.order2.item( id, 0, { }, cid )) {
          return raiseError( e ); }}
      ret = cl[cid];
    } else {
      for( var c in cl ) {
        cnt = cnt - cl[c]; }
      if( cnt < 1 ) {
        if( e = $.order2.item( id, 0 )) {
          return raiseError( e ); }}
      ret = cnt;
    }
    if( order['cnt'] < 1 ) {
      resetCnt( id );
    } else {
      counts[id] = order;
    }
    return ret;
  }
  function remove( id, cid ) {
    window.clearTimeout( utimeout );
    var order = counts[id],
        cl = counts[id]['cl'];
    if( cid && counts[id]['cl'] && counts[id]['cl'][cid] ) {
      var cnt = counts[id]['cnt'] - counts[id]['cl'][cid];
      if( e = $.order2.item( id, 0, { }, cid )) {
          return raiseError( e ); } 
      if( cnt ) {
        delete cl[cid]; }
    } else {
      var cnt = 0;
      for( var c in cl ) {
        cnt = cnt + cl[c]; }
      if( e = $.order2.item( id, 0 )) {
        return raiseError( e ); }
    } 
    if( cnt < 1 ) {
      resetCnt( id );
    } else {
      counts[id] = order;
      counts[id]['cnt'] = cnt;
    }
    return 0;
  }
  function update( ) {
    for( var id in counts ) {
        var val = articles[id]['value'],
            cnt = counts[id]['cnt'],
            cl = counts[id]['cl'];
        if( cl ) {
          for( var c in cl ) {
            if( val[c] == "undefined" )  { continue; }
            if( e = $.order2.item( id, cl[c], val, c )) {
                raiseError( e );
                resetCnt( id );
            }
            cnt = cnt - cl[c];
          }
        }
        if( cnt > 0 ) {
          if( e = $.order2.item( id, cnt, val )) {
              resetCnt( id );
              raiseError( e ); }
        }
    }

    $.order2.update({ current: control_current });
  }

  function init( doc ) {
    $( '#kasse' ).show( );
    var mouse_event = $.settings.deviceinfo.mouse_event;

    draw( );
    $.order2.init( updateStatus, doc );
    var $o1 = $( '#orderdiv' ),
        $k1 = $( '#kasse' ),
        $oa = $( '#orderaction' ),
        $sa = $( '#sysactions' ),
        $os = $( '#num' );

    // dont change window when order present
    $sa.unbind( mouse_event );
    $sa.delegate( 'a', mouse_event, function( e ) {
      var $el = $(this),
          title = $el.attr( 'title' );
          //href = $el.attr( 'href' );
      for( id in counts ) {
          if( counts[id].cnt > 0 ) {
            if( confirm( 'open '+title )) {
              window.location.href = title+'.html';
              return true;
            }
            e.preventDefault( );
            e.stopPropagation( );
            return false;
          }
      }
      window.location.href = title+'.html';
    });

    $o1.unbind( mouse_event );
    $o1.delegate( '.action a',  mouse_event , function( e ) {
        e.preventDefault( );
        var $el = $( this ),
            href = $el.attr( 'href' );
        if( href ) {
          href = href.substr( 1 )
          if( href == 'detail' ) {
              $('#ordertotal').toggleClass( 'detail' );
          } else if( href == 'book' ) {
              if( e = $.order2.book( )) {
                  raiseError( e ); }
	      reset( );
              utimeout = window.setTimeout( update, ut_listdelay, true);
          } else if( href == 'cancel' ) {
              if( !raiseQ( 'cancel order?' )) { return; }
              if( e = $.order2.cancel( )) {
                  raiseError( e );
              } else {
                  clearCnts( ); 
              }
              reset( );
              utimeout = window.setTimeout( update, ut_listdelay, true);
          }
        }
    });
    $o1.delegate( '.items li',  mouse_event , function( e ) {
      var $self = $(this),
          id = $self.find( 'a.order-edit' ).attr( 'id' ).substr( 5 );
      if( $self.hasClass( 'current' )) {
        $self.removeClass( 'current' );
        clearCtrl( );
      } else {
        $self.parent( ).find( '.current' ).removeClass( 'current' );
        $self.addClass( 'current' );
        control_current = id;
        $( '#ordercontrol' )
          .html( $.mustache( tpl['ordercontroltpl'], { id: id } ))
          .show( );
      }
    });

    $o1.delegate( '#ordercontrol a',  mouse_event , function( e ) {
        e.preventDefault( );
        var $el = $(this),
            href = $el.attr( 'href' ).substr( 1 );
        if( control_current ) {

          if( control_current.indexOf( '|' ) !== -1 ) {
            var cc = control_current.split( '|' );
            id = cc[0]; cl = cc[1]; }
          else {
            id = control_current; cl = 0; }

          var $parent = $el.parent( ),
              cnt;

          if( href == 'increase' ) {
            cnt = increase( id, cl ); }
          else if( href == 'decrease' ) {
            cnt = decrease( id, cl ); }
          else if( href == 'remove' ) {
            cnt = remove( id, cl ); }

          if( cnt != 0 ) {
            $el.parent( ).children( '.cnt' ).html( cnt ); }
          else {
            clearCtrl( ); }

          if( counts[id] && counts[id]['cnt'] != 0 ) {
            $( '#'+id ).children( '.cnt' ).html( counts[id]['cnt'] ); }
          else {
            $( '#'+id ).children( '.cnt' ).html( '' ); }

        } else {
          clearCtrl( ); }

        utimeout = window.setTimeout( update, ut_listdelay, true);
        e.stopPropagation( );
    });

    $o1.delegate( '#order-discount', mouse_event, function( e ) {
      return false;
      var val = false
          cl = $k1.attr('class') || '';

      if( cl == '' ) { val = "token"; }
      else if( cl == 'token' ) { val = ""; }
      else { val = ""; }

      $k1.attr( 'class', '' ).addClass( val );
      $(this).attr( 'class', '' ).addClass( val );
    })
  }

  function reset( ) {
    var $k1 = $( '#kasse' ),
        $c1 = $( '#c1' );

    clearCtrl( );
    $c1.find( 'div.col' ).scrollTop( 0 );
    $k1.attr( 'class', '' );
    $k1.find('#order-discount').attr( 'class', '' );

  }

  function draw( ) {
    var mouse_event = $.settings.deviceinfo.mouse_event;

    var $nav = $( '#nav' ),
        $nav1 = $( '#nav1' ),
        $k1 = $( '#kasse' );
        $c1 = $( '#c1' );
    $nav.html( '' ); $nav1.html( '' ); $c1.html( '' );
    db.view( db_design +'/articles', { descending: true }, function( data ) {
        var items = [],
            tab = false,
            tabcnt = 0,
            tccnt = 0,
            act  = true, // first tab selected 
            $tc = false, // tab container 
            $tc2 = false;

        for( var i=data.total_rows; i--; ) {
            var d   = data.rows[i].value,
                id  = d._id,
                cnt = '',
                categ = d.categ;
            if( categ != tab ) {
                if( categ == 'nav1' ) {
                    $tc = $nav1;
                } else {
                    var tkey    = 'categ-'+tabcnt++,
                        catname = typeof catnames[categ] !== 'undefined' ? catnames[categ] : categ;
                        tcl      = '',
                        cl      = '';
                    if( act ) { tcl = ' '; } 
                    else { cl  = ' class="hide"'; }
                    //$nav.append( '<li><a href="#'+ tkey +'" class="tab'+ tcl +'"><span>'+ catname +'</span></a></li>' );
                    $nav.append( '<li><a href="#'+ tkey +'" style="width:'+icons_width+';height:'+icons_width+'" class="tab'+ tcl +'"><img src="vendor/order2/img/order2_iconset_white/order2_icon_'+icons_cat[categ]+'.svg" height="'+icons_width+'" width="'+icons_width+'" /></a></li>' );
                    $tc = $( '<div class="col" id="'+ tkey +'"'+ cl +'></div>' );
                    $tc2 = $( '<div class="full" id="'+ tkey +'"'+ cl +'-full></div>' );
                    $tc.appendTo( $c1 );
                    $tc2.appendTo( $c1 );
                    tccnt = 0;
                    //act     = false;  
                }
            }

	    if( !d['token'] ) { d['token'] = Math.ceil( d['price'] * 10 / 45 ); }

            if( typeof counts[id] == 'object' ) {
                cnt = counts[id]['cnt'];
                d['_cnt'] = cnt;
            }
            if( categ == 'nav1' ) {
              $tc.append(  $.mustache( tpl['navitemtpl'], { data: d, id: data['_id'] }))
            } else {
              if( tccnt++ < tccnt_max ) {
                $tc.append(  $.mustache( tpl['itemtpl'], { data: d, id: data['_id'] }))
              } else {
                $tc2.append(  $.mustache( tpl['itemtpl'], { data: d, id: data['_id'] }))
              }
            }
            items[id] = { 
                value: d,
                cnt: cnt,
            };
            tab = categ;
        }

        $nav.append( '<li><a style="width:'+icons_width+';height:'+icons_width+'" href="#all" class="tab current"><img src="vendor/order2/img/order2_iconset_white/order2_icon_'+icons_cat['all']+'.svg" height="'+icons_width+'" width="'+icons_width+'" /></a></li>' );

        articles = items;
        $( '#kasse' ).organicTabs( { mouse_event: mouse_event } );
    })
//    var c = counts;
//    for( var id in c ) {
//        $c1.find('#cnt'+id ).html( c[id]['cnt'] ); }
    $c1.unbind( mouse_event );
    $c1.delegate( 'a',  mouse_event , function( e ) {
        e.preventDefault( );
        var el = this,
            cl = $k1.attr('class'),
            cnt = increase( el.id, cl ),
            $c = $( el ).children( '.cnt' );
        $c.html( cnt );
        utimeout = window.setTimeout( update, ut_delay, true);
        clearCtrl( );
        return false;
    });
    $nav1.unbind( mouse_event );
    $nav1.delegate( 'a',  mouse_event , function( e ) {
        e.preventDefault( );
        var el = this,
            cnt = increase( el.id ),
            $c = $(el).children( '.cnt' );
        $c.html( cnt );
        el.firstChild.innerHTML = cnt;
        clearCtrl( );
        utimeout = window.setTimeout( update, ut_delay, true);
    });
  };

  $.app = {
    
    draw: function( ) {
	draw( );
    } }

}).call( this )

