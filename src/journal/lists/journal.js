/**                        
 * order2 Journal
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
function(head, req) {
  var ddoc = this,
    art = [],
    //path = require( 'lib/path' ),
    numbersp = require( 'lib/numbersp' ),
    mustache = require( 'lib/mustache' );

  provides( 'html', function( ) {
    var value, timestart, time, t, ltotal,
        sum = 0, total = 0, jcnt = 0, acnt = 0,
        reverse = false;

    if( 'descending' in req.query ) {
      reverse = true;
    }

    while( r = getRow( )) {
        var k = r.key;
        if( k[3] == '_total' ) {

            if( reverse ) {
              if( typeof ltotal == "object" ) {
                total+= sum;
	        jcnt+= 1;
                ltotal.total.value = numbersp.price( sum );
                ltotal.total.value = numbersp.price( sum );
                art.push( ltotal ); 
                sum = 0; }}

            t = k[1].split( 'Z' )[0].split( 'T' );
            var ts = t[0]+' '+t[1].substring( 0, 8 );
            if( !timestart ) { timestart = t[0]; }

            ltotal = { total: {
                ts: ts,
                key1: k[2], 
                class: k[3].substring( 1 ),

                bar: k[6],
                pad: k[7],
                user: k[8],
            }}

            if( !reverse ) {
              if( typeof ltotal == "object" ) {
                total+= sum;
	        jcnt+= 1;
                ltotal.total.value = numbersp.price( sum );
                ltotal.total.value = numbersp.price( sum );
                art.push( ltotal ); 
                sum = 0; }}

        } else {
            value = numbersp.price( r.value );
            sum+= r.value;
	    acnt+= k[6];

            art.push({ item: {
                ts: k[0],
                key1: k[2], 
                class: k[3],

                name: k[4], // total: bar user pad
                price: k[5],
                cnt: k[6],
                deposit: k[7],
                mwst: k[8],
                value: value
            }})
        }

    }

    if( reverse ) {
      if( typeof ltotal == "object" ) {
        total+= sum;
        jcnt+= 1;
        ltotal.total.value = numbersp.price( sum );
        art.push( ltotal ); 
        sum = 0; }}

    if( typeof t != "undefined" )  {
      time = t[0] != timestart 
        ? timestart+' - '+t[0]
        : timestart; }
    tvalue = numbersp.price( total );

    send( mustache.to_html( ddoc.tpl.journal, { 
        art: art,
	widgetid: 'journal-'+req.info.db_name,
	here: '/'+req.path.slice( 0, 3 ).join( '/' ),
	user: req.userCtx,
        totals: { 
            value: tvalue,
            time: time,
            jcnt: 'Buchungen: '+jcnt,
            acnt: 'Artikel: '+acnt,
        },
    } ));
  });

};
