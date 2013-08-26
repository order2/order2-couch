/**                        
 * order2 items
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
function( doc, req ) {
  var mustache = require(  "lib/mustache" ),
      path= require( 'lib/path' ).init( req ),
      ddoc = this,
      links = { 
        list: path.list( 'item', 'drinks' ),
        new: path.show( 'item', '' ),
      };
  doc = doc || {};
  
  return( mustache.to_html( ddoc.tpl.item, {
    //doc: doc, 
    data: JSON.stringify( doc ),
    id: doc._id || null,
    rev: doc._rev || null,
    name: doc.name,
    deposit: doc.deposit,
    price: doc.price && Number( doc.price ).toFixed( 2 ),
    sort: doc.sort,
    categ: doc.categ || null,
    categ_opt: [
	{ cat: 'bier', catname: 'Bier', selected: ( doc.categ == 'bier') ? 1 : 0 },
	{ cat: 'longdrink', catname: 'Longdrink', selected: ( doc.categ == 'longdrink') ? 1 : 0 },
	{ cat: 'cocktails', catname: 'Cocktails', selected: ( doc.categ == 'cocktails') ? 1 : 0 },
	{ cat: 'shots', catname: 'Shots', selected: ( doc.categ == 'shots') ? 1 : 0 },
	{ cat: 'saft', catname: 'Säfte/Softs', selected: ( doc.categ == 'saft') ? 1 : 0 },
	{ cat: 'wein', catname: 'Wein/Sekt', selected: ( doc.categ == 'wein') ? 1 : 0 },
	{ cat: 'nav1', catname: 'nav_r', selected: ( doc.categ == 'nav1') ? 1 : 0 } ],
    formid: 'items-'+req.info.db_name.split( '_' ).join( '' )+'-'+doc._id,
    dbname: req.info.db_name,
    user: req.userCtx,
    itempath: '/'+req.info.db_name+'/'+doc._id,
    links: links,
  }));
}
