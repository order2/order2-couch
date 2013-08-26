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

  var da = y+m+d,
      ptype = doc.ptype || 0;

 if( doc.art ) {
  for( var x in doc.art ) {
    var a = doc.art[x],
        price = a.price_o || a.price;
        deposit = a.deposit || 0;
        class = 0;
    if( a.verlust ) { class = ['verlust', a.verlust].join(': '); }
    else if( a.storno ) { class = ['storno', a.storno].join(': '); }
    emit( [da, t, doc._id, class, a.name, price, a.cnt, deposit, 19], (( Number( deposit ) + Number( a.price )) * Number( a.cnt )) );
  }
  emit( [da, t, doc._id, '_total', ptype, 'bar-1', 'pad', 'user: '+doc.user.name], 0 );
 } else {                
  emit( [da, t, doc._id, '_empty', ptype, 'bar-1', 'pad', 'user: '+doc.user.name], 0 );
 }
}
