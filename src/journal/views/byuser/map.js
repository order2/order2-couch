function( doc ) {
 if( doc.art ) {
  for( var x in doc.art ) {
    var a = doc.art[x],
        price = a.price_o || a.price;
        deposit = a.deposit || 0;
        class = 0;
    if( a.verlust ) { class = ['verlust', a.verlust].join(': '); }
    else if( a.storno ) { class = ['storno', a.storno].join(': '); }
    emit( [doc.user.name, class, a.name, deposit, 19], (( Number( deposit ) + Number( a.price )) * Number( a.cnt )) );
  }
 }
}
