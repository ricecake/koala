-module(koala_msg_handler).

-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).

init(Req, _Opts) ->
        {ok, State} = initSession(Req, #{}),
	{cowboy_websocket, Req, State}.

websocket_handle({text, JSON} = Data, Req, State) ->
	Message = jiffy:decode(JSON, [return_maps]),
	case handle_client_task(Message, State) of
		{reply, Data, NewState} when is_list(Data) -> {reply, [{text, Item} || Item <- Data], Req, NewState};
		{reply, Data, NewState} -> {reply, {text, Data}, Req, NewState};
		{ok, NewState} -> {ok, Req, NewState}
	end.

websocket_info(Message, Req, State) ->
	{reply, Message, Req, State}.

handle_client_task(_JSON, State) -> {ok, State}.

initsession(Req, State) -> {ok, State}.
