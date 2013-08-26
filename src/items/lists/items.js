/**                        
 * order2 items
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
function(head, req) {

  var ddoc = this,
    art = [],
    numbers = require( 'lib/numbers' ),
    path = require( 'lib/path' ).init( req ),
    mustache = require( 'lib/mustache' );
    path_data = {
        pathlist: path.list( 'item', 'drinks' ),
        pathnew: path.show( 'item', '' ) },
      catnames = {
        '0mostwanted': 'Most Wanted',
        'bier': 'Bier',
        'longdrink': 'Longdrink',
        'cocktails': 'Cocktails',
        'shots': 'Shots',
        'saft': 'Säfte/Softs',
        'wein': 'Wein/Sekt' };

  provides( 'html', function( ) {

    var curr = 1,
        tab = req.query.tab || false,
        items = [ ], tabs = [ ], data = [ ],
        actions = [
            { href: path.show( 'item' )+'/', label: 'new', class: 'new button' }];

    while( r = getRow( )) {
	var key, label, active,
	    d = r.value,
            categ = r.key[0];
        d.show = path.show( 'item' )+'/'+r.id;

        if( key && categ != key ) {
	  active = ( tab && tab === key ) || curr ? curr -- > 0 : false;
          data.push({ tab: 'categ-'+key, items: items, active: active ? '' : 'hide' });
          tabs.push({ key: 'categ-'+key, label: label, active: active ? 'current' : '' });
          items = []; 
        }
        items.push( d );
        key = categ;
        label = typeof catnames[categ] !== 'undefined' ? catnames[categ] : categ;
    }
    data.push({ tab: 'categ-'+key, items: items, active: active ? '' : 'hide' });
    tabs.push({ key: 'categ-'+key, label: label, current: active ? '' : '' });

    send( mustache.to_html( ddoc.tpl.items, { 
	tabs: tabs, 
	actions: actions,
	data: data, 
	widgetid: 'items-'+req.info.db_name,
	user: req.userCtx,
        path_data: path_data } ));
  });

};
