/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
var db = {
  db: '',
  design: 'order',
  con: false,
  init: function( db, view, pad, success_cb ) {
    this.db = db;
    this.con = $.couch.db( db );
  },

  settings: function( pad, success_cb ) {
    this.con.openDoc( pad, { success: success_cb });
  },
  view: function( adr, options, success_cb  ) {                                                                                                 
    var opt = {
      success: success_cb
    } 
    for( i in options ) {
      opt[i] = options[i];
    } 
    return this.con.view( adr, opt )
  }
}  
