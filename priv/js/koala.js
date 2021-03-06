;(function() {
        'use strict';

        function generateUUID(){
                var d = new Date().getTime();
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = (d + Math.random()*16)%16 | 0;
                        d = Math.floor(d/16);
                        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                });
                return uuid;
        };

        function initWs(koala) {
        	var ws = new WebSocket("ws://" + window.location.host + "/ws");
                koala._onConnect();
		ws.onclose   = function(evt) {
                        koala._onTerm();
			window.setTimeout(function(){
				koala.setWebSocket(initWs(koala));
			}, koala._rejoin);
		};
		ws.onmessage = 	function(e) {
			var message = JSON.parse(e.data);
                        new KMsg({
                                owner: koala,
                                body: message
                        }).handle();
		};
		ws.onerror   = 	function(e) {
			koala._onError();
		};
                return ws;
        }

        function extractArgs (This, Defaults, Args) {
        	// should switch this to use _ instead of rolling own
                Args = Args || {};
                for (var k in Defaults) {
                        if (Args[k]) {
                                This['_'+k] = Args[k];
                                delete Args[k];
                        }
                        else if (Defaults[k] === undefined) {
                                throw 'Undefined: '+k;
                        }
                        else {
                                This['_'+k] = Defaults[k];
                        }
                }
                This._data = Args;
        }
        

        function Koala(args) {
                extractArgs(this, {
	                onCall: function () { return this },
	                onCast: function () { return this },
	                onTerm: function () { return this },
	                onError:function () { return this },
	                onConnect: function () { return this },
	                rejoin: 1000
	        }, args);
                this._ws = initWs(this);
                
                this._messages = {};
                return this;
        }
        Koala.prototype = {
                constructor: Koala,
                setWebSocket: function (ws) {
                        this._ws = ws;
                        return this;
                },
                Call: function (Message) {
                },
                Cast: function (Message) {
                },
                onConnect: function (Callback) {
                      this._onConnect = Callback;  
                },
                onError: function (Callback) {
                      this._onError = Callback;  
                },
                onCall: function (Callback) {
                      this._onCall = Callback;  
                },
                onTerm: function (Callback) {
                      this._onTerm = Callback;  
                },
                onCast: function (Callback) {
                        this._onCast = Callback;
                },
                newMessage: function (Args) {
                        Args.owner = this;
                        return new KMsg(Args);
                },
                insertMessage: function (id, msg, after) {
                        this._messages[id] = { message: msg, after: after};
                        return this;
                }
        };
        window.Koala = Koala;


        var KMsgArgs = ;
        function KMsg(args) {
                extractArgs(this, {
	                owner: undefined,
	                body: undefined,
	                identity: {},
	                timeout: 10000,
	                onTimeout: function (Msg) { throw {what: 'timeout', message: Msg}},
	                context: 'control',
	                namespace: 'system',
	                method: 'info'
	        }, args);
                return this;
        }
        KMsg.prototype = {
                constructor: KMsg,
               Call: function () {
                	//need to make this return a promise, and get that all worked out
                	var Id = generateUUID();
                	var Msg = JSON.stringify({
                                id: Id,
                                identity: this._identity,
                                context: this._context,
                                namespace: this._context,
                                method: this._method,
                                body: this._body,
                        });
                        this._owner.insertMessage(Id, this, function(Message){});
                        this._owner._ws.send(Msg);
                },
                Cast: function () {
                        this._owner._ws.send(JSON.stringify({
                                identity: this._identity,
                                context: this._context,
                                namespace: this._context,
                                method: this._method,
                                body: this._body,
                        }));
                }
        };
        window.KMsg = KMsg;
})();
