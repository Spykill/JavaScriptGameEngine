
var RunicRealm = (function(M){
	M.BasicMoveComponent = class extends Engine.Component
	{
		constructor(speed, friction, maxFriction)
		{
			super();
			this.speed = speed;
			this.frictionPercentage = friction;
			this.maxFriction = maxFriction;
		}

		update(deltaTime)
		{
			var input = this.getOwner().getGame().getInput();

			if(this.getOwner().getObjectType() != Engine.GameObject.GameObjectType.Physics)
			{
				return;
			}

			this.getOwner().velocity.sub(this.getOwner().velocity.clone().normalize().multiplyScalar(Math.min(this.getOwner().velocity.length() * this.frictionPercentage, this.maxFriction)));

			if(input.isKeyPressed("w"))
			{
				this.getOwner().velocity.add(new THREE.Vector3(0, this.speed * deltaTime));
			}
			if(input.isKeyPressed("s"))
			{
				this.getOwner().velocity.add(new THREE.Vector3(0, -this.speed * deltaTime));
			}
			if(input.isKeyPressed("a"))
			{
				this.getOwner().velocity.add(new THREE.Vector3(-this.speed * deltaTime, 0));
			}
			if(input.isKeyPressed("d"))
			{
				this.getOwner().velocity.add(new THREE.Vector3(this.speed * deltaTime, 0));
			}
		}
	};

	M.RotateComponent = class extends Engine.Component
	{
		constructor()
		{
			super();
		}

		update(deltaTime)
		{
			$.each(this.getOwner().getAllComponents(Engine.SpriteComponent), function(ind, el){el.angleToScreen += deltaTime / (8*Math.PI);});
		}
	}

	M.TILE_SIZE = 64;

	return M;
}(RunicRealm || {}));

function startGameModule(game)
{
	game.getAssetManager().addAsset('', 'derpbutt', new Engine.TextureAsset('_assets/derpbutt.png'));
	game.getAssetManager().addAsset('', 'map', new Engine.TextAsset('_assets/map.json'));

	game.getAssetManager().loadGroupOrdered('', function(){

		game.getFrame().setCameraCreator(function(width, height) {
			return new THREE.OrthographicCamera(-width / (RunicRealm.TILE_SIZE * 2), width / (RunicRealm.TILE_SIZE * 2), height / (RunicRealm.TILE_SIZE * 2), -height/(RunicRealm.TILE_SIZE * 2), 0.1, 1000);
		});

		//var geom = new THREE.PlaneGeometry(1,1);
		//var mat = new THREE.MeshBasicMaterial({color:0xffffff});
		//var cube = new THREE.Mesh(geom, mat);

		//game.getRenderScene().add(cube);

		var obj = new Engine.PhysicsBody(null, null, new THREE.Vector3(0,0,0), game, 1, 0);
		obj.addComponent(new RunicRealm.BasicMoveComponent(.1, 0.02, 2));
		obj.addComponent(new Engine.ColliderComponent(null, new Engine.ColliderBox2D(new Engine.Rectangle2D(-.5, -1, 1, 2))));
		obj.addComponent(new Engine.CameraComponent(null, new THREE.Vector3(0,0,300)));
				game.addToGame(obj);

		var child = new Engine.GameObject(null, obj, new THREE.Vector3(0,0,0), game);
		child.addComponent(new Engine.SpriteComponent(null, new THREE.Vector3(0,0,1), null, new THREE.Vector3(1, 2, 1), new THREE.MeshBasicMaterial({color: 0xffffff})));

		obj = new Engine.PhysicsBody(null, null, new THREE.Vector3(0,0,0), game, 1, 0, Engine.PhysicsBody.PhysicsType.Kinematic);
		obj.addComponent(new Engine.SpriteComponent(null, null, game.getAssetManager().getAsset('derpbutt').getResource(), new THREE.Vector3(1,1, 1)));
		obj.addComponent(new Engine.ColliderComponent(null, new Engine.ColliderBox2D(new Engine.Rectangle2D(-.5, -.5, 1, 1))));
				game.addToGame(obj);

		obj = new Engine.PhysicsBody(null, null, new THREE.Vector3(1,0,0), game, 1, 0, Engine.PhysicsBody.PhysicsType.Kinematic);
		obj.addComponent(new Engine.SpriteComponent(null, null, game.getAssetManager().getAsset('derpbutt').getResource(), new THREE.Vector3(1,1, 1)));
		obj.addComponent(new Engine.ColliderComponent(null, new Engine.ColliderBox2D(new Engine.Rectangle2D(-.5, -.5, 1, 1))));
				game.addToGame(obj);
		obj = new Engine.PhysicsBody(null, null, new THREE.Vector3(2,0,0), game, 1, 0, Engine.PhysicsBody.PhysicsType.Kinematic);
		obj.addComponent(new Engine.SpriteComponent(null, null, game.getAssetManager().getAsset('derpbutt').getResource(), new THREE.Vector3(1,1, 1)));
		obj.addComponent(new Engine.ColliderComponent(null, new Engine.ColliderBox2D(new Engine.Rectangle2D(-.5, -.5, 1, 1))));
				game.addToGame(obj);
		var map = Engine.TiledMap.readTiledJSON(game.getAssetManager().getAsset("map").getResource());
		obj = map.createObject(null, null, new THREE.Vector3(map.width, map.height, 1), new THREE.Vector3(0,0,-1), game);
		$.each(obj.getAllComponents(Engine.SpriteComponent), function(i, v){ v.angleToScreen = -Math.PI / 4; });
				game.addToGame(obj);
		obj = new Engine.PhysicsBody(null, null, new THREE.Vector3(3,0,0), game, 1, 0, Engine.PhysicsBody.PhysicsType.Kinematic);
		game.getAssetManager().getOrLoadAsset('Overworld', function(res){
			obj.addComponent(new Engine.SpriteComponent(null, null, null, new THREE.Vector3(1,1, 1), new THREE.MeshBasicMaterial({color:0xffffff, map: res, transparent: true})));
			obj.addComponent(new Engine.ColliderComponent(null, new Engine.ColliderBox2D(new Engine.Rectangle2D(-.5, -.5, 1, 1))));
				game.addToGame(obj);
		});
	});
}
