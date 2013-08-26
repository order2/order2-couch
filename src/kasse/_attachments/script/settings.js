/**                        
 * order2 Kasse
 * @author     sf@notomorrow.de
 * @license    AGPL(http://www.gnu.org/licenses/gpl.html)                                      
 */
(function( ) {
  var $ = jQuery, Settings;

  Settings = ( function( ) {
    Settings = function( o ) {
        this.id = o.id || null;
        this.con = false;
        this.cb = false;
        this.st = false;
        this.user = false;
        this.login = false;
        this.chk = false;
        this.chkkasse = false;
        this.chkserver = false;
        this.syncing = false;
    }
     
    Settings.prototype.isodate = function( d ){  
      function pad(n){return n<10 ? '0'+n : n}  
      return d.getUTCFullYear()+'-'  
        + pad(d.getUTCMonth()+1)+'-'  
        + pad(d.getUTCDate())+'T'  
        + pad(d.getUTCHours())+':'  
        + pad(d.getUTCMinutes())+':'  
        + pad(d.getUTCSeconds())+'Z'  
    }
    Settings.prototype.urldispatch = function( ) {
      path = unescape(document.location.pathname).split('/'),
      filename = path.pop( );
      //if( '_admin' in this.user.userCtx.roles && filename != 'admin.html' ) {
      if( this.user.userCtx.roles[0] == '_admin' && filename != 'admin.html' ) {
        //window.location.href = 'admin.html';
      }
    }
    Settings.prototype.connect = function( db, success_cb ) {
	this.urldispatch( );
        var self = this;
        if( success_cb ) {
            this.cb = success_cb; }
        if( !this.st ) {
            $( '#status' ).html( ); 
            $( '#status' ).append( '<div id="kasse-status">' ); 
            this.st = $('#kasse-status'); }
        this.deviceinfo = navigator;
        if( /Order2-android/.test(navigator.userAgent)) {
          this.deviceinfo.mouse_event = "touchend";
          this.deviceinfo.touch = "tablet"; }
        else {
          this.deviceinfo.mouse_event = "click";
          this.deviceinfo.touch = "no"; }
        this.con = $.couch.db( db ); 
        this.con.openDoc( this.id, {
          success: function( data ) {
            self.upd( data ); }, 
          error: function( o, e, s ) {
            var doc = { type: 'settings',
                kasse: '',
                pad: 'default',
                printer: '',
                _id: self.id }
            self.con.saveDoc( doc, {
              success: function( data ) {
                data['_id'] = data['id'];
                self.upd( data ); },
              error: function( o, e, s ) {
                if( s == 'no_db_file' ) {
                  self.sync( db ); } }}); }}); }
    Settings.prototype.sync = function( db ) {
        if( this.chkserver ) { return false; }
        if( this.syncing ) {
          return false; }
        this.syncing = true;
        var self = this;
        if( !this.source ) {
          self.st.append( $('<p class="return">sync failed. No source<p>' ));
          return false; }
        if( this.st.html( ) == '' ) {
            this.st.html( 'connecting ...' ); }
        this.st.html( 'syncing ...' );
        $.couch.replicate( this.source, db, { 
          success: function( data ) {
	    self.chkserver = self.source;
            self.syncing = false;
	    self.st.append( $('<p class="return">sync ok<p>' ));
            $.settings.connect( db ); },
          error: function( e ) {
            self.syncing = false;
            self.st.append( $('<p class="return">sync failed. '+ e +'<p>' )); }
        }, { create_target: true }); }
    Settings.prototype.resync = function( db, success_cb ) {
        if( success_cb ) {
           this.cb = success_cb; }
        this.chkserver = false;
	$.settings.sync( db ); }
    Settings.prototype.connectkasse = function( kasse ) {
        var self = this,
	    k = $.couch.db( kasse );
        k.info({ success: function( kdata ) {
          k.changes( kdata['commited_update_seq'] )
	   .onChange( function( data ) {
	      $.settings.updkasse( data ); }); }});
        k.openDoc( '_design/journal', {
          success: function( doc ) {
            self.synckasse( kasse, doc ); 
          },
          error: function( e ) {
           self.synckasse( kasse ); 
        }} ); }
    Settings.prototype.synckasse = function( kasse, doc ) {
      var self = this;
      this.con.openDoc( '_design/journal', {
        success: function( d ) {
          if( !doc ) {
            d.lastrev=d._rev;
            delete d._rev; }
          else {
            if( d._rev == doc.lastrev ) { 
              return self.upd( );
            }
            d.lastrev=d._rev;
            d._rev=doc._rev; }
          $.couch.db( kasse ).saveDoc( d, {
            success: function( doc ) {
              return self.upd( ); },
            error: function( e ) { }}); 
        },
        error: function( e ) {
          this.kasse = false;
          self.st.append( $('<p class="return">connection kasse failed<p>' )); } }); }
    Settings.prototype.upd = function( doc ) {
        if( !doc ) {
          if( this.settingsdoc ) { 
            doc = this.settingsdoc; }
          else {
            return false; }}
        else {
          this.settingsdoc = doc; }
        if( this.st.html( ) == '' ) {
            this.st.html( 'connection ok' );
            this.con.changes( ).onChange( function( data ) {
                $.settings.updsettings( data ); }); }
        var self = this,
            kasse = doc.kasse || 'k_'+doc._id;
        if( !this.kasse ) {
            $.couch.allDbs({ success: function( data ) {
                if( data.indexOf( kasse ) > -1 ) {
                    self.kasse = kasse;
                    self.connectkasse( kasse );
                } else {
                    if( self.user ) {
                        $.couch.db( kasse ).create( { success: function( data ) {
                            self.kasse = kasse;
                            self.connectkasse( kasse );
                        }} );
                    } else {
                        self.st.html( 'setup failed -- permission denied' );
                    }
                }  }});
            return; }
        else {
            self.st.append( $('<p class="return">connection kasse ok<p>' )); }
        if( kasse != doc['kasse'] ) {
            doc.kasse = kasse; } 
        if( self.user ) {
	    doc.user = self.user.userCtx; }
        if( this.cb != false ) {
            this.cb( doc );
            this.cb = false; }}
    Settings.prototype.upduser = function( data ) {
        if( typeof data != 'undefined' ) {
            this.user = data; }
        else {
            this.user = false; }}
    Settings.prototype.updsettings = function( data ) {
        this.st.append( $('<p class="return">**order2 update**<p>' )); }
    Settings.prototype.updkasse = function( data ) {
	var ch = data.results[0],
	    st = this.st;
        if( ch['id'].substring( 0, 8 ) == '_design/' ) {
	    st.append( $('<p class="return">**journal update**<p>' )); }
        else {
          $.couch.db( this.kasse ).openDoc( ch['id'], { success: function( doc ) {
	      st.append( $('<p class="return">journal entry<p>' )); },
            error: function( e ) { 
              
            }}); }}
    return Settings
  })( )
  $.settings = new Settings({ id: '23' });
}).call( this )
