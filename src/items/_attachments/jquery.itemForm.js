/**                        
 * order2 Items
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
(function($) {
    $.fn.itemForm = function(opts,data) {
        var opts = opts || {};
        var data = data || {};

        var $form = $(this);
        var itempath = $form.attr( 'action' );

        var doc = $form.serializeObject();
        if( data._id ) {
            doc._id	= data._id;
            doc._rev	= data._rev;
        } else if( doc._id ) {
            data._id	= doc._id;
            data._rev	= doc._rev;
        } else {
            data._id	= 'd_'+$.couch.newUUID( );
        }

        if (!opts.db) {
            opts.db = $.couch.db(itempath.split('/')[1]);
        }

        $form.update = function( action, doc ) {
            data.last_rev = data._rev;
            data._rev = doc._rev;
            if( opts.success ) {
                opts.success( action, doc);
            }
        }

        $form.submit(function(e) {
            e.preventDefault();
            var doc = $form.serializeObject();

            doc._id	= data._id;
            if( data._rev ) {
              doc._rev	= data._rev; }

            opts.db.saveDoc( doc, {
              success : function() {
                $form.find( '.msg' ).text( 'Saved _rev: '+doc._rev ).fadeIn( 500 ).fadeOut( 6000 );
                if( doc._deleted == true ) { $form.find( 'legend' ).html( 'DELETED '+doc._id ); } 
                else if( doc._id ) { $form.find( 'legend' ).html( 'Editing '+doc._id ); } 
                else { $form.find( 'legend' ).html( 'New Document' ); }

                $form.update( 'submited', doc );
                return true;

              }
            });
            return doc;
            return false;
        });
        $form.delegate( 'input[name=itemdelete]', mouse_event, function( e ) {
            e.preventDefault( );
            $.ajax({
                type: 'DELETE',
                url: itempath+'?rev='+data._rev,
                success: function( doc ) {
                    data.last_rev = data._rev;
                    data._rev = doc._rev;

                    $form.find( '.msg' ).text( 'Deleted' ).fadeIn( 500 );
                    $form.find( 'input' ).attr( 'disabled', true );
                    $form.find( 'legend' ).html( 'DELETED '+doc._id );
                    //drinksadmin( doc.categ );
		    //form[0].reset();
                    $form.update( 'deleted', doc );
                }
            });
            return false;
        });
        $form.delegate( 'input[name=itemcancel]', mouse_event, function( e ) {
            e.preventDefault( );
            $form.html( '' );
            $form.update( 'canceled', doc );
            return false;
        });
    };
    // friendly helper http://tinyurl.com/6aow6yn
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);
