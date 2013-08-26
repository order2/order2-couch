function( d ) {
 var t = d.time.split( 'Z' )[0].split( 'T' ), 
     date = t[0].replace( /-/g, '' ),
     time = t[1];
 if( d.art ) {
  for( var x in d.art ) {
    var a = d.art[x];
    var p = a.price_o || a.price;
    var class = 0;

    //if( a.verlust ) { var ebene = ['verlust', a.verlust].join(': '); }
    //else if( a.storno ) { 
    //    p = "0.00";
    //    var ebene = ['storno', a.storno].join(': '); 
    //}
    //else { var ebene = a.ebene || "0"; }

    emit( [a.name, date, class, p, a.cnt, a.tax], Number(a.price)*Number(a.cnt) );
  }
 }
}
function( d ) {
 if( d.artikel ) {
  for( var x in d.artikel ) {
    var a = d.artikel[x];
    var p = a.original_preis || a.preis;
    var t = d.datum;
    var z = d.uhrzeit;

    emit( [a.text, t, ebene, p, a.menge], (Number(a.menge)*Number(p)));
  }
 }
}
