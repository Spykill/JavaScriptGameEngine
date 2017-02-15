var Engine = (function(E){
	E.init = function()
	{
		var frame = new Engine.Frame();
		frame.init();

		var game = new Engine.Game(frame.createInput(), frame);

		startGameModule(game);

		game.startGameLoop();
	};

	return E;
}(Engine || {}));
