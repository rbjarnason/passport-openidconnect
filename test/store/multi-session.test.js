var MultiSessionStore = require('../../lib/state/multi-session');

describe('MultiSessionStore', function() {
  describe('multiple concurrent states', function() {
    it('should store and verify multiple states independently', function(done) {
      var store = new MultiSessionStore({ key: 'openidconnect:example' });
      var req = { session: {} };
      var ctx = {};

      store.store(req, ctx, null, {}, function(err, h1) {
        if (err) { return done(err); }
        store.store(req, ctx, null, {}, function(err, h2) {
          if (err) { return done(err); }

          expect(Object.keys(req.session['openidconnect:example'].states)).to.have.length(2);

          store.verify(req, h1, function(err, ctx1, state1) {
            if (err) { return done(err); }
            expect(req.session['openidconnect:example'].states).to.not.have.property(h1);
            expect(req.session['openidconnect:example'].states).to.have.property(h2);

            store.verify(req, h2, function(err, ctx2, state2) {
              if (err) { return done(err); }
              expect(req.session['openidconnect:example']).to.be.undefined;
              done();
            });
          });
        });
      });
    }); // should store and verify multiple states independently

    it('should use provided state value as handle', function(done) {
      var store = new MultiSessionStore({ key: 'openidconnect:example' });
      var req = { session: {} };
      var ctx = {};

      store.store(req, ctx, 'custom', {}, function(err, handle) {
        if (err) { return done(err); }
        expect(handle).to.equal('custom');
        expect(req.session['openidconnect:example'].states).to.have.property('custom');

        store.verify(req, 'custom', function(err, ctx2, state) {
          if (err) { return done(err); }
          expect(state).to.equal('custom');
          expect(req.session['openidconnect:example']).to.be.undefined;
          done();
        });
      });
    }); // should use provided state value as handle
  }); // multiple concurrent states
});
