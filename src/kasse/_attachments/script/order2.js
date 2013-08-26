/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
$(function( ) {
  $.order2 = $.order2 || {};
  $.extend( $.order2, {
    art: { },
    tpl: {
      ordertotal: $( '#ordertotal-tpl' ).html( )
    },
    init: function( fun, settings ) {
        this.statusfun = fun;
	this.settings = settings;
	this.deposit_value = .5;
	this.redraw({ art: [], cnt: 0, sum: "0.00", sum_art: "0.00", cnt_deposit: 0, sum_deposit: "0.00" });
    },
    statuscb: function( action, args ) {
        if( typeof( this.statusfun ) == 'function' ) {
          this.statusfun( action, args ); }
    },
    order_last: [],
    cancel: function( ) {
        this.art = { };
        this.update( );
        return false;
    },
    item: function( idx, cnt, art, c ) {
	var e = '', val = { };
	if( c ) { idx = [ idx, c ].join( '|' ); }
	if( cnt === 0 ) {
	  delete this.art[idx];
	  return false; }
	if( typeof( art ) != 'object' ) { return 'not found'; }
	for( var k in art ) {
	    val[k] = art[k]; }
	val['index'] = idx;
	val['cnt'] = Number( cnt ) || ( e = 'no cnt' );
	if( c == 'token' ) {
	  if( !val['token'] ) { e = 'no price (token)'; } 
          val['p_type'] = c;
          val['p_orig'] = val['price'];
          val['price_'+c] = val[c];
          val['price'] = 0; }
	else {
	  val['price'] = Number( val['price'] ) || ( e = 'no price' ); }
	if( e != '' ) { return e; }
	this.art[idx] = val;
	return false;
    },
    book: function( ) {
	var items = [],
	    art = this.art,
	    kasse = this.settings.kasse || 'k_'+this.settings._id;
	for( var i in art ) {
            if ( !art.hasOwnProperty( i )) { continue; }
            var a = art[i],
	        item = {
                    id: a.id,
                    categ: a.categ,
                    name: a.name,
                    price: a.price,
                    deposit: a.deposit,
                    tax: a.tax,
                    cnt: a.cnt
                };
            if( item.deposit ) {
              item.deposit = this.deposit_value; }
            items.push( item ); }
        if( items.length > 0 ) {
            order = {
                time: $.settings.isodate( new Date( )),
                user: this.settings.user,
                bar: this.settings.bar,
                pad: this.settings.pad,
                art: items }
            $.couch.db( kasse ).saveDoc( order, {
                success: function( data ) { 
                  $.order2.clear( );} });
            return false; }
    },
    clear: function( ) {
        this.art = { };
        this.update( );
        this.statuscb( 'book', null );
    },
    update: function( env ) {
	if( typeof env != 'object' ) { env = { }}
	var sum = 0, sum_art = 0, 
	    sum_deposit = 0, cnt_deposit = 0,
	    sum_token = 0, token = 0,
            cnt = 0,
            items = [],
	    art = this.art;
	for( var idx in art ) {
	    var item = { },
		sum_item = 0,
		sum_item_token = 0;
	    for( k in art[idx] ) {
	      item[k] = art[idx][k]; }
	    if( env['current'] == idx ) {
	      item['current'] = 'current'; }
	    if( item['p_type'] == 'token' ) {
	      sum_item = 0;
	      sum_item_token = ( item['cnt'] * item['token'] ); }
	    else {
	      sum_item = ( item['cnt'] * item['price'] ); }
	    switch( item['name'] ) {
	      case 'Pfand':
	      case 'Pfand Plus':
		sum_deposit += this.deposit_value * item['cnt'];
		cnt_deposit += item['cnt'];
		break;
	      case 'Pfand Retour':
		sum_deposit -= this.deposit_value * item['cnt'];
		cnt_deposit -= item['cnt'];
		break;
	      default:
		cnt	    += item['cnt']; 
		sum_art	    += sum_item;
		if( typeof item['deposit'] != 'undefined' ) {
		    sum_deposit += this.deposit_value * item['cnt'];
		    cnt_deposit += item['cnt'];
		    sum_item	+= this.deposit_value * item['cnt'];
		}
	    }
	    sum		 += sum_item;
	    item['sum']	  = sum_item.toFixed( 2 );
	    item['price'] = Number( item['price'] ).toFixed( 2 );
	    sum_token	     += sum_item_token;
	    item['sum_token'] = sum_item_token;
            items.unshift( item ); }
	this.redraw({
	    cnt: cnt,
	    sum: ( sum ).toFixed( 2 ),
	    sum_art: ( sum_art ).toFixed( 2 ),
	    sum_deposit: ( sum_deposit ).toFixed( 2 ),
	    cnt_deposit: cnt_deposit,
	    sum_token: sum_token,
	    art: items
	});
    },
    redraw: function ( order ){
        $('#orderdiv').show( );
        $('#ordertotal')
            .html(  $.mustache( this.tpl.ordertotal, order ))
            .show( );
    }
  })
});

