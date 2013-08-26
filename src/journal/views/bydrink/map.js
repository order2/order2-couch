function( d ) {
 var t = d.time.split( 'Z' )[0].split( 'T' ), 
     date = t[0].replace( /-/g, '' ),
     time = t[1];
 if( d.art ) {
  for( var x in d.art ) {
    var a = d.art[x];
    var p = a.price_o || a.price;
    var class = 0;
    emit( [date, a.name, class, p, a.cnt, a.tax], Number(a.price)*Number(a.cnt) );
  }
 }
}
