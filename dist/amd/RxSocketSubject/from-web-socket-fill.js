define(
  "RxSocketSubject/from-web-socket-fill",
  ["exports"],
  function(__exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    function fromWebSocket(url, protocol, openObserver, closingObserver) {
        if (!window.WebSocket) { throw new TypeError('WebSocket not implemented in your runtime.'); }

        var WebSocket = window.WebSocket;

        var socket;

        var socketClose = function(code, reason) {
          if(socket) {
            if(closingObserver) {
              closingObserver.onNext();
              closingObserver.onCompleted();
            }
            if(!code) {
              socket.close();
            } else {
              socket.close(code, reason);
            }
          }
        };

        var observable = new Rx.AnonymousObservable(function (obs) {
          socket = protocol ? new WebSocket(url, protocol) : new WebSocket(url);

          var openHandler = function(e) {
            openObserver.onNext(e);
            openObserver.onCompleted();
            socket.removeEventListener('open', openHandler, false);
          };
          var messageHandler = function(e) { obs.onNext(e); };
          var errHandler = function(err) { obs.onError(err); };
          var closeHandler = function() { obs.onCompleted(); };

          openObserver && socket.addEventListener('open', openHandler, false);
          socket.addEventListener('message', messageHandler, false);
          socket.addEventListener('error', errHandler, false);
          socket.addEventListener('close', closeHandler, false);

          return function () {
            socketClose();

            socket.removeEventListener('message', messageHandler, false);
            socket.removeEventListener('error', errHandler, false);
            socket.removeEventListener('close', closeHandler, false);
          };
        });

        var observer = Rx.Observer.create(function (data) {
          socket.readyState === WebSocket.OPEN && socket.send(data);
        },
        function(e) {
          var reason = 'unknown reason';
          var code = 1008; //generic error code
          if(typeof e === 'string') {
            reason = e;
          }
          else if(typeof e === 'object') {
            reason = e.reason || e.message;
            code = e.code || code;
          }
          socketClose(code, reason);
        },
        socketClose);

        return Rx.Subject.create(observer, observable);
      }
    __es6_export__("fromWebSocket", fromWebSocket);
  }
);

//# sourceMappingURL=from-web-socket-fill.js.map