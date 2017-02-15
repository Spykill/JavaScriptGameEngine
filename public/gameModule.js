
var RunicRealm = (function(M){
	M.TestComponent = class extends Engine.Component
	{
		update(deltaTime)
		{

		}

		
	};

	return M;
}(RunicRealm || {}));

function startGameModule(game)
{
	game.getAssetManager().addAsset('', 'derpbutt', new Engine.TextureAsset('derpbutt.png'));

	game.getAssetManager().loadGroupOrdered('', function(){ console.log(game.getAssetManager().getAsset('derpbutt').getResource()); });

	var obj = new Engine.GameObject(null, new THREE.Vector3(), game);
	obj.addComponent(new RunicRealm.TestComponent());

	game.addToGame(obj);

	console.log("here");
}
