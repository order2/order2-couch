function( d ) {
  if( d.name ) {
    key = d.categ.replace(/[^A-Za-z0-9]+/, '-').toLowerCase();
    sort = parseFloat( d.sort ) || 9999;
    emit( [key, sort, d._id], d );                                                                                                           
  }
}
