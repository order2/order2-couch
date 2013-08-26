/**                        
 * order2 Journal
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
function(head, req) {

  var ddoc = this,
    //path = require( 'lib/path' ),
    //numbers = require( 'lib/numbers' ),
    //path = require( 'lib/path' ).init( req ),
    mustache = require( 'lib/mustache' );
    catnames = { };

  function mk_cnt( num ) {
    //num = new numbers( num );
    //num.setPlaces( 0 );
    //return num.toFormatted( ); }
    return num }
	
  function mk_sum( num ) {
    //return new numbers( num ).toFormatted( ); }
    return num }

  provides( 'html', function( ) {

    var sum = 0, cnt = 0, total = 0, total_cnt = 0;
    var okey = 0, ocnt = 0;
    var re = {}, total_k2 = {}, re2 = {};
    var keys = [], len;

    while( r = getRow( )) {
	var key = r.key[1],
	    price = r.key[3],
	    cnt = r.value / Number( price ),
	    val = r.value,
	    k2 = r.key[2];
	  
	if( !re[key] ) {
	    re[key] = { 
		label: key,
		price: price,
		sum: val,
		cnt: cnt,
		k2: {} }
	} else {
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

        //catname = typeof catnames[categ] !== 'undefined' ? catnames[categ] : categ;
        //label = 'test2';
    }

log( { re: re } );
log( { total_k2: total_k2 } );

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

log( { re2: re2 } );

    re2.widgetid = 'journal-'+req.info.db_name;
    re2.user = req.userCtx;

    send( mustache.to_html( ddoc.tpl.index, re2 ));
  });

};
