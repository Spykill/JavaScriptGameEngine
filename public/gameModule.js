
var RunicRealm = (function(M){
	M.BasicMoveComponent = class extends Engine.Component
	{
		constructor(speed)
		{
			super();
			this.speed = speed;
		}

		update(deltaTime)
		{
			var input = this.getOwner().getGame().getInput();

			if(input.isKeyPressed("w"))
			{
				this.getOwner().localPosition.add(new THREE.Vector3(0, this.speed * deltaTime));
			}
			if(input.isKeyPressed("s"))
			{
				this.getOwner().localPosition.add(new THREE.Vector3(0, -this.speed * deltaTime));
			}
			if(input.isKeyPressed("a"))
			{
				this.getOwner().localPosition.add(new THREE.Vector3(-this.speed * deltaTime, 0));
			}
			if(input.isKeyPressed("d"))
			{
				this.getOwner().localPosition.add(new THREE.Vector3(this.speed * deltaTime, 0));
			}
		}
	};

	return M;
}(RunicRealm || {}));

function startGameModule(game)
{
	game.getAssetManager().addAsset('', 'derpbutt', new Engine.TextureAsset('_assets/derpbutt.png'));

	game.getAssetManager().loadGroupOrdered('', function(){

		//var geom = new THREE.PlaneGeometry(1,1);
		//var mat = new THREE.MeshBasicMaterial({color:0xffffff});
		//var cube = new THREE.Mesh(geom, mat);

		//game.getRenderScene().add(cube);

		var obj = new Engine.GameObject(null, new THREE.Vector3(2,0,5), game);
		obj.addComponent(new RunicRealm.BasicMoveComponent(1));
		//obj.addComponent(new )
		obj.addComponent(new Engine.CameraComponent());
		game.addToGame(obj);

		var child = new Engine.GameObject(obj, new THREE.Vector3(0,0,-5), game);
		child.addComponent(new Engine.SpriteComponent(null, new THREE.Vector3(1, 2, 1), new THREE.MeshBasicMaterial({color: 0xffffff})));

		obj = new Engine.GameObject(null, new THREE.Vector3(), game);
		obj.addComponent(new Engine.SpriteComponent(game.getAssetManager().getAsset('derpbutt').getResource(), new THREE.Vector3(1,1, 1)));

		game.addToGame(obj);
	});
}
