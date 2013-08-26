function( doc ) {
  var t = new Date( doc.time );
    if( t.getHours( ) < 12 ) {
    	t.setDate(t.getDate()-1);
    }
  var y = t.getFullYear( ).toString( ),
      m = ( t.getMonth( )+1 ).toString( ),
      d = t.getDate( ).toString( );
  while( m.length < 2 ) { m = '0'+m; }
  while( d.length < 2 ) { d = '0'+d; }
  var da = y+m+d;

 if( doc.art ) {
  for( var x in doc.art ) {
    var a = doc.art[x];
    var p = a.price_o || a.price;
    if( a.verlust ) { var class = ['verlust', a.verlust].join(': '); }
    else if( a.storno ) { var class = ['storno', a.storno].join(': '); }
    else { var class = a.preisebene || "0"; }
    emit( [da, a.name, class, p, a.cnt, .19], Number(a.price)*Number(a.cnt) );
  }
 }
}
