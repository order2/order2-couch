function(d) {           
  if( d.price && d.categ ) {
    key = d.categ.replace(/[^A-Za-z0-9]+/, '-').toLowerCase();
    sort = parseFloat( d.sort ) || d.name.replace(/[^A-Za-z0-9]+/, '-').toLowerCase();
    emit( [key, sort, d._id], d );                                                                                                           
  }                       
}   
