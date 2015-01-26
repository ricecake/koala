-module(koala_msg_handler).

-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).

init(Req, _Opts) ->
        io:format("StartedA\n"),
	{cowboy_websocket, Req, #{}}.

websocket_handle({_Type, JSON} = Data, Req, State) ->
        io:format("Got: ~p~n", [Data]),
	ok = handle_client_task(JSON, State),
	{ok, Req, State}.

websocket_info(Message, Req, State) ->
	{reply, Message, Req, State}.

handle_client_task(_JSON, _State) -> ok.
