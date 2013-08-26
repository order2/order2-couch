function( d ) {
 if( d.art ) {
  for( var x in d.art ) {
    var a = d.art[x];
    if( a.verlust ) { var ebene = 'verlust: '+a.verlust; }
    else if( a.storno ) { var ebene = 'storno: '+a.storno; }
    else { var ebene = a.ebene || ""; }
    emit([ d.time, d._id, ebene, a.name, Number( a.price ), a.deposit, a.cnt ], ( ( Number( a.deposit ) + Number( a.price )) * Number( a.cnt )));
  }
  emit([ d.time, d._id, 'total', d.bar, d.user, d.pad ], 0 );
 } else {
  emit([ d.time, d._id, 'empty', d.bar, d.user, d.pad ], 0 );
 }
}
