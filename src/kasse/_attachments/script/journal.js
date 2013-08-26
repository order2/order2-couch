/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
( function( $ ) {

  // format helper
    function mk_rand( minVal,maxVal,floatVal ) {
	var randVal = minVal+(Math.random()*(maxVal-minVal));
	var ret = String( typeof floatVal == 'undefined'?Math.round( randVal ):randVal.toFixed( floatVal ));
	while( ret.length < 2 ) { ret= '0'+ret; }
	return ret;
    }
    function mk_isodate( d ) {
      function pad(n){return n<10 ? '0'+n : n}  
      return d.getUTCFullYear()+'-'  
        + pad(d.getUTCMonth()+1)+'-'  
        + pad(d.getUTCDate())+'T'  
        + pad(d.getUTCHours())+':'  
        + pad(d.getUTCMinutes())+':'  
        + pad(d.getUTCSeconds())+'Z'  
    }
    function mk_filterdate( d ) {
        if( typeof d !== 'object' ) { return false; }
        var y = String( d.getFullYear( )),
            m = String( d.getMonth( )+1 ),
            d = String( d.getDate( ));
	while( m.length < 2 ) { m = '0'+m; }
	while( d.length < 2 ) { d = '0'+d; }
	return y+m+d;
    }
    function mk_date( val ) {
	val = String( val );
	var y = val.substring( 0, 4 );
	var m = val.substring( 4, 6 );
	var d = val.substring( 6, 8 );

	while( m.length < 2 ) { m = '0'+m; }
	while( d.length < 2 ) { d = '0'+d; }

	return y+'/'+m+'/'+d;
    }
    function mk_date1( val ) {
	val = String( val );
	var y = Number( val.substring( 0,4 ));
	var m = Number( val.substring( 4,6 ));
	var d = Number( val.substring( 6,8 ));

	var monthname=new Array("Jan.","Feb.","Mar.","Apr.","Mai", "Jun.","Jul.",
	    "Aug.","Sep.","Okt.","Nov.","Dez." );

	if( m < 1 ) { m = 1; }
	if( m > 12 ) { m = 12; }
	if( d < 1 ) { d = 1; }
	if( d > 31 ) { d = 31; }

	var d = new Date( y, m-1, d );
	var date = d.getDate( )+' '+monthname[d.getMonth( )]+' '+d.getFullYear( y );
	return date;
    }

    function mk_cnt( num ) {
	num = new NumberFormat( num );
	num.setPlaces( 0 );
	return num.toFormatted( );
    }
    function mk_sum( num ) {
	return new NumberFormat( num ).toFormatted( );
    }
    function mk_netto( num ) {
        return new NumberFormat( num / 119 * 100 ).toFormatted( );
    }
    function mk_mwst( num ) {
        return new NumberFormat( num / 119 * 19 ).toFormatted( );
    }
    function mk_mwstl( num ) {
	return new NumberFormat( num * 100 ).toFormatted( );
    }

  // calculate
    function calculateDetail( data ) {
	var sum = 0, cnt = 0, total = 0, total_cnt = 0;
	var okey = 0, ocnt = 0;
	var re = {}, total_k2 = {}, re2 = {};
	var i = data.rows.length;
	var keys = [], len;

	while( i-- ) {
	    var r = data.rows[i],
		key = r.key[1],
		price = r.key[3],
		cnt = r.value / Number( price ),
		val = r.value,
		k2 = r.key[2] != 0 ? 'storno' : 'ebene0';

	    if( !re[key] ) {
		re[key] = { 
		    label: r.key[4],
		    price: price,
		    sum: val,
		    cnt: cnt,
		    k2: {} } } else {
		re[key]['sum']+= val;
		re[key]['cnt']+= val / Number( r.key[3] );
	    }

	    if( !re[key]['k2'][k2] ) {
		re[key]['k2'][k2] = {};
		re[key]['k2'][k2]['sum'] = val;
		re[key]['k2'][k2]['cnt'] = cnt;
	    } else {
		re[key]['k2'][k2]['sum']+= val;
		re[key]['k2'][k2]['cnt']+= cnt;
	    }

	    if( !total_k2[k2] ) {
		total_k2[k2] = { label: k2, sum: val, cnt: cnt }
	    } else {
		total_k2[k2]['sum']+= val;
		total_k2[k2]['cnt']+= cnt;
	    }
	}
	re2.re = [];
	re2.total_re = 0;
	keys = [], len = 0;
	for( x in re ) {
	    keys.push( x );
	}
	keys.sort( );
	len = keys.length;
	for( i=0; i < len ;i++ ) {
	    x = re[keys[i]];
	    re2.total_re+= x['sum'];

	    x.sum = mk_sum( x['sum'] );
	    for( y in x.k2 ) {
		x.k2[y]['sum'] = mk_sum( x.k2[y]['sum'] );
		x.k2[y]['cnt'] = x.k2[y]['cnt'];
	    }
	    re2.re.push( x );
	}
	re2.total_re = mk_sum( re2.total_re );
	
	re2.k2 = {};
	re2.total_k2 = 0;
	re2.total_k2_cnt = 0;
	keys = [], len = 0;
	for( x in total_k2 ) {
	    keys.push( x );
	}
	keys.sort( );
	len = keys.length;
	for( i=0; i < len ;i++ ) {
	    x = keys[i];
	    var num = total_k2[x]['sum'];
	    re2.total_k2+= num;
	    re2.total_k2_cnt+= total_k2[x]['cnt'];
	    var v = {
		label: total_k2[x]['label'],
		cnt: mk_cnt( total_k2[x]['cnt'] ),
		sum: mk_sum( num ) };
	    re2.k2[x] = v;
	}
	re2.total_k2_cnt = mk_cnt( re2.total_k2_cnt );
	re2.total_k2 = mk_sum( re2.total_k2 );
	
	return re2;

    }

    function calculateTotals( data ) {
	var sum = 0, cnt = 0, total = 0, total_cnt = 0,
	    okey = 0, ocnt = 0,
	    total_ptype = {},
	    total_ebene = {},
	    total_mwst = {},
	    i = data.rows.length,
	    keys = [], len;

	while( i-- ) {
	    var r = data.rows[i],
		key = r.key[3];
console.log(['key', key ]);
	    if( key == '_total' ) {
                var ptype = r.key[4];
		if( !total_ptype[ptype] ) {
		    total_ptype[ptype] = { 
			cnt: cnt,
			sum: sum }} 
                else {
		    total_ptype[ptype]['sum']+= sum;
		    total_ptype[ptype]['cnt']+= cnt; }

		total+= sum; total_cnt+= cnt; ocnt+= 1;
		sum = 0; cnt = 0;
console.log([ 'key _total ', r.key ]);
	    
	    } else if( key != '' ) {
		var e = key.substr( key.indexOf( ': ' ) + 2 );
		if( !total_ebene[e] ) {
		    total_ebene[e] = { 
			lbl: Number( r.key[4] ),
			sum: Number( r.key[5] ),
			cnt: Number( r.key[6] ) }
		} else {
		    total_ebene[e]['sum']+= Number( r.key[5] );
		    total_ebene[e]['cnt']+= Number( r.key[6] );
		}
console.log([ 'key != ', r.key, total_ebene[e] ]);
	    
	    }  else {

		sum+=  Number( r.value ); 
		cnt+=  Number( r.key[6] );

		mwst = mk_mwst( r.key[8] );
		lbl = mk_mwstl( r.key[8] );
		if( !total_mwst[lbl] ) {
		    total_mwst[lbl] = { 
			sum: Number( r.value ) }
		} else {
		    total_mwst[lbl]['sum']+= Number( r.value );
		}
console.log([ 'key else ', r.key ]);
	    }
	}

	var re = {
	    total_brutto: mk_sum( total ),
	    total_netto: mk_netto( total ),
	    total_anzahl: mk_cnt( total_cnt ),
	    total_orders: mk_cnt( ocnt ),
	};
	re.mwst = [];
	re.total_mwst = 0;
	keys = [], len = 0;
	for( x in total_mwst ) {
	    keys.push( x );
	}
	keys.sort( );
	len = keys.length;
	for( i=0; i < len ;i++ ) {
	    x = keys[i];
	    var num = total_mwst[x]['sum'],
		v = {
		    label: mk_mwstl( x ),
		    brutto: mk_sum( num ),
		    netto: mk_netto( num ),
		    sum: mk_mwst( num ) };
	    re.mwst.push( v );
	    re.total_mwst+= ( num / 119 * 19 );
	}
	re.total_mwst = mk_sum( re.total_mwst );
	
	re.ebene = [];
	keys = [], len = 0;
	for( x in total_ebene ) {
	    keys.push( x );
	}
	keys.sort( );
	len = keys.length;
	for( i=0; i < len ;i++ ) {
	    x = keys[i];
	    var v = {
		label: total_ebene[x]['lbl'],
		brutto: mk_sum( total_ebene[x]['sum'] ),
		anzahl: mk_cnt( total_ebene[x]['cnt'] ),
	    };
	    re.ebene.push( v );
	}
	
	re.ptype = [];
	keys = [], len = 0;
	for( x in total_ptype ) {
	    keys.push( x );
	}
	keys.sort( );
	len = keys.length;
	for( i=0; i < len ;i++ ) {
	    x = keys[i];
	    if( Number( total_ptype[x]['sum'] ) == 0 ) { continue; }
	    var v = {
		label: x,
		brutto: mk_sum( total_ptype[x]['sum'] ),
		anzahl: mk_cnt( total_ptype[x]['cnt'] ),
	    };
	    re.ptype.push( v );
	}

	return re;

    }

  $.fn.ncjournal = function( settings ) {
    var elem = $(this),
        designname = 'journal',
	db = $.couch.db( settings.kasse );
    settings = settings || {};

    function load( ) {
        var d = new Date( ),
            startdate = mk_filterdate( d );
        drawDates( 'byday', { 
            startdate: '20070000',
            byday: 'true', byday12: 'true' });
    }

    function drawDates( view, filter ) {
	var d = new Date( ),
	    enddate = mk_filterdate( new Date( 
	      d.getFullYear( ),
	      d.getMonth( ),
	      d.getDate( )+1 )),
	    startdate = mk_filterdate( new Date( 
	      d.getFullYear( )-1,
	      d.getMonth( ),
	      d.getDate( )-1 )),
	    grouplevel = 0,
	    dview = 'bydrink',
	    tpl_nav = $( '#orders-nav-tpl' ).html( ),
	    tpl = $( '#orders-date-tpl' ).html( );

	elem.html( "hohle daten ..." );

	if( filter.byday ) {
	    grouplevel = 1;
	}
	if( filter.byday12 ) {
	    view = 'byday12';
	    dview = 'bydrink12';
	}
	var opt = {
	    descending  : true,
	    update_seq  : true,
	    group_level : grouplevel,
	    startkey	: [enddate],
	    endkey	: [startdate],
	    success	: function( data ) {
                var datekey, dateindex = [];
		elem.html( '' );
                elem.append( $.mustache( tpl_nav, {
                    view: view,
                    dview: dview } ));
		data.rows.map( function( r ) {
		    if( filter.byday ) {
			var date = mk_date( r.key[0] ),
			    datekey = [ r.key[0] ]; } 
                    else {
			var date = mk_date( startdate )+' - '+mk_date( enddate ),
			    datekey = [ startdate, enddate ]; }
                    dateindex.push( datekey )
		    elem.append(
			$.mustache( tpl, {
			    date: date,
			    datekey: datekey,
			    view: view,
			    dview: dview,
			    value: mk_sum( r.value ) } ));
		});
                if( dateindex.length ) {
                  var action = 'journal',
                      id = '#'+ action +'-'+ view +'-'+ dateindex[0][0];
                  if( dateindex[0][1] ) {
                    id = id +'-'+ dateindex[0][1]; }
                  else {
                    dateindex[0][1] = Number( dateindex[0][0] ) +1; }
                  var param = 'group=true&descending=true&startkey=["'+ String( dateindex[0][1] ) +'"]&endkey=["'+ String( dateindex[0][0] ) +'"]'; 
                  $( id ).load( '/'+settings.kasse+'/_design/journal/_list/journal/byday12?'+param ); 
                }

            },
	    error	: function( e ) {
              //swallow
	    }}

        db.view( designname + "/"+view, opt );

    };
    function showOrderDetail( view, filter, action, content ) {

	var startdate	= String( filter.startdate ),
	    enddate	= String( filter.enddate ),
	    tpl		= $( '#orders-detail' ).html( ),
	    $content	= $( content );
	if( !enddate ) {
          return false;
	}
	if( !enddate ) {
          return false;
	}

	var opt = {
	    descending : false,
	    update_seq : true,
	    group: true,
	    startkey : [startdate],
	    endkey : [enddate],
	    success : function(data) {
		$content.html( "berechne ..." ).show( );
		var re = calculateDetail( data );
		re.filter = {
		    enddate: mk_date1( enddate - 1 ),
		    startdate: mk_date1( startdate )
		};
		$content.html( $.mustache( tpl, re ));
	    }
	}
	db.view(designname + "/"+view, opt );

    };
    function drawOrderTotals( view, filter, content ) {

	var startdate	= String( filter.startdate ),
	    enddate	= String( filter.enddate ),
	    tpl		= $( '#orders-dayview' ).html( ),
	    $content	= $( content );

	if( !enddate ) {
          return false;
	}
	if( !enddate ) {
          return false;
	}

	var opt = {
            descending : true,
            update_seq : true,
	    group: true,
	    startkey : [enddate],
	    endkey : [startdate],
            success : function(data) {

		$content.html( "berechne ..." ).show( );
		var re = calculateTotals( data );
	    	re.filter = {
		    enddate: mk_date1( enddate - 1 ),
		    startdate: mk_date1( startdate )
	    	};

                $content.html( $.mustache( tpl, re ));

            }
        }

        db.view(designname + "/"+view, opt );

    };

    var mouse_event = $.settings.deviceinfo.mouse_event;
    elem.delegate( ".dateinfo a", mouse_event, function( e ) {
        e.preventDefault();

        var $this = $( this ),
            id = $this.attr( 'href' ),
            startdate = Number( id.split( '-' )[2] ),
            enddate = Number( id.split( '-' )[3] ),
            view = id.split( '-' )[1],
            action = id.split( '-' )[0];
        if( !enddate ) { 
            enddate = startdate + 1; }
        var filter = { 
	    startdate : startdate, 
	    enddate : enddate };

        if( action == "csv" ) {
            var param = $.param({
                    group_level: 12,
                    startkey : [String( filter.startdate )],
                    endkey : [String( filter.enddate )] }),
                url = '_list/'+action+'/'+view+'?'+param;
            window.location = url;

        } else if( action == "csv2" ) {
	    var param = $.param({
                    group_level: 2,
                    startkey : [String( filter.startdate )],
                    endkey : [String( filter.enddate )] }),
	        url = '_list/'+action+'/'+view+'?'+param;
	    window.location = url;

        } else if( action == "csvq2" ) {
	    var param = $.param({
                    group_level: 2,
                    startkey : [String( filter.startdate )],
                    endkey : [String( filter.enddate )] })
	    var url = '_list/'+action+'/'+view+'?'+param;
	    window.location = url;

        } else if( action == "journal" ) {
            var $out = $( '#'+id );
	    if( $out.html( )) {
	        if( $out.css( 'display' ) != 'none' ) {
                    $out.parent( ).find( '.out' ).hide( );
                    $this.removeClass( 'active' );
                    return false; }}
            else {
                var param = 'group=true&startkey=["'+String(filter.startdate )+'"]&endkey=["'+String( filter.enddate )+'"]'; 
                $out.load( '/'+settings.kasse+'/_design/journal/_list/journal/byday12?'+param );
            }

            $out.parent( ).parent( ).find( '.active' ).removeClass( 'active' );
            $out.parent( ).find( '.out' ).hide( );
            $out.show( );
            $this.addClass( 'active' );

        } else {
            var $out = $( '#'+id );
	    if( $out.html( )) {
	        if( $out.css( 'display' ) != 'none' ) {
                    $out.hide( );
                    $this.removeClass( 'active' );
                    return false; }}
            $out.parent( ).parent( ).find( '.active' ).removeClass( 'active' );
            //$out.parent( ).find( '.out' ).hide( );
            $out.html( "hohle daten ..." ).show( );

            if( action == "total" ) {
                drawOrderTotals( view, filter, $out ); } 
            else {
                showOrderDetail( view, filter, action, '#'+id ); }
            $this.addClass( 'active' );
        }
        return false;
    });

    load( );
  };
})( jQuery )
