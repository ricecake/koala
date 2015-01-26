-module(koala_app).

-behaviour(application).

%% Application callbacks
-export([start/2, stop/1]).

%% ===================================================================
%% Application callbacks
%% ===================================================================

start(_StartType, _StartArgs) ->
    Supervisor = {ok, _Pid} = koala_sup:start_link(),
    Dispatch = cowboy_router:compile([
	    {'_', [
			{"/ws",        koala_msg_handler, []},
			{"/js/[...]",  cowboy_static, {priv_dir,  koala, "js/"}},
			{"/css/[...]", cowboy_static, {priv_dir,  koala, "css/"}},
                        {"/img/[...]", cowboy_static, {priv_dir,  koala, "img/"}},
  			{"/",          cowboy_static, {priv_file, koala, "html/index.html"}}
		]}
	]),
	{ok, _} = cowboy:start_http(http, 25, [{port, 7221}, {compress, true}],
        				[{env, [{dispatch, Dispatch}]}]),
	Supervisor.

stop(_State) ->
    ok.
