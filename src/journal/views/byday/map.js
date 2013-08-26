function( d ) {
 var t = d.time.split( 'Z' )[0].split( 'T' ), 
     date = t[0].replace( /-/g, '' ),
     time = t[1];
 if( d.art ) {
  for( var x in d.art ) {
    var a = d.art[x];
    var p = a.price_o || a.price;
    var class = 0;
    //if( a.verlust ) { var class = 'verlust: '+a.verlust; }
    //else if( a.storno ) { var class = 'storno: '+a.storno; }
    //else { var class = a.class || ""; }

    //emit([ '', a.categ, class, a.name, a.price, a.deposit ], ( ( Number( a.deposit ) + Number( a.price )) * Number( a.cnt )));
    emit( [date, d._id, class, a.name, p, a.cnt, a.tax], Number(a.price)*Number(a.cnt) );
  }
  emit( [date, d._id, '_total', time, 'bar-'+d.bar, 'pad-'+d.pad, 'user-'+d.user], 0 );
 } else {
  emit( [date, d._id, '_empty', time, 'bar-'+d.bar, 'pad-'+d.pad, 'user-'+d.user], 0 );
 }
}
