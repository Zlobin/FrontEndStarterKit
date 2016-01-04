(function(window, $, describe, it, sinon, Fixture_1) {
  'use strict';

  describe('Demo test #0.0.0', function() {
    beforeEach(function() {
    });

    afterEach(function() {
    });

    it('Should verify, that chai, mocha, karma works fine.', function() {
      (1).should.not.equal(2);
      (2).should.equal(2);
    });

    /*
    it('Should time out after 500 ms. Test sinon timers.', function() {
      var timedOut = false;
      var clock = sinon.useFakeTimers();

      setTimeout(function () {
        timedOut = true;
      }, 500);

      timedOut.should.be.false;
      clock.tick(510);
      timedOut.should.be.true;

      clock.restore();
    });
    */

    it('Should verify correct respond from sinon fake server.', function() {
      var server = sinon.fakeServer.create();
      var testUrl = '/test/url.html';

      server.respondWith(
        'GET',
        testUrl, [
          200, {
            'Content-Type': 'application/json'
          },
          JSON.stringify(Fixture_1)
        ]
      );

      $.ajax({
        type: 'GET',
        url: testUrl
      }).done(function (data) {
        window.console.log('Response from server - success. Length: ' + data.length);
        server.restore();
      });

      server.respond();
    });
  });
}(this, jQuery, describe, it, sinon, Fixture_1));
