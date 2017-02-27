(function(E){
	E.Game = class {
		/**
		 * @param input: Engine.Input; The input that this game instance will use.
		 * @param frame: Engine.Frame; The frame that we will be drawing to.
		 * @param gameFPS: float; The number of game cycles that we should get per second
		 * @param frameSkip: int; The max number of game updates to do before rendering a frame.
		 */
		constructor(input, frame, gameFPS, frameSkip)
		{
			this._input = input;
			this._frame = frame;
			this._assetManager = new E.AssetManager();

			this._deltaTime = 0;
			this._lastUpdateTime = Utility.getTime();

			this._gameTime = 0;

			this._gameObjects = new Array();
			this._physicsbodies = new Array();
			this._kinematic = new Array();
			this._dynamic = new Array();
			this._trigger = new Array();

			this.currentScene = null;

			this._updateTime = E.Game.TIME_FLT_PNT_ADJ / (gameFPS || 30);
			this._frameSkip = frameSkip || 10;

			this._gameRunning = false;
		}

		/**
		 * Starts the provided scene. Clears the current scene
		 * @param scene: Engine.Scene; The scene to start
		 */
		startScene(scene)
		{
			for (var i = 0; i < this._gameObjects.length; i++)
			{
				this._gameObjects[i].onRemovedFromScene();
			}

			this._gameObjects = new Array();
			this._physicsbodies = new Array();
			this._kinematic = new Array();
			this._dynamic = new Array();
			this._trigger = new Array();

			scene.InitialiseScene(this);

			this.currentScene = scene;
		}

		/**
		 * Starts and manages the game loop.
		 */
		startGameLoop()
		{
			this._gameRunning = true;
			var self = this;

			this._runGameLoop(this);
		}

		_runGameLoop(self)
		{
			var newTime = Utility.getTime() * E.Game.TIME_FLT_PNT_ADJ;
			this._deltaTime += (newTime - self._lastUpdateTime);

			var frame = 0;

			while (this._deltaTime > self._updateTime && frame++ < self._frameSkip)
			{
				this._deltaTime -= self._updateTime;
				self._gameTime += self._updateTime / E.Game.TIME_FLT_PNT_ADJ;

				self.update(self._updateTime / E.Game.TIME_FLT_PNT_ADJ);
			}

			self.render(this._deltaTime > self._updateTime ? 1 : this._deltaTime / self._updateTime);

			self._input.flush();
			requestAnimationFrame(function(){ self._runGameLoop(self); });
		}

		/**
		 * Performs a single game frame.
		 */
		update(deltaTime)
		{
			this.physicsUpdate(deltaTime);

			for (var i = 0; i < this._gameObjects.length; i++)
			{
				this._gameObjects[i].update(deltaTime);
			}

			if(this.network)
			{
				this.network.update(this.gameTime);
			}
		}

		physicsUpdate(deltaTime)
		{
			for (var i = 0; i < this._dynamic.length; i++)
			{
				this._dynamic[i].doVelocityStep(deltaTime);
			}

			for (var i = 0; i < this._dynamic.length; i++)
			{
				for (var j = i + 1; j < this._dynamic.length; j++)
				{
					this._dynamic[i].tryCollision(this._dynamic[j]);
				}

				for (var j = 0; j < this._kinematic.length; j++)
				{
					this._dynamic[i].tryCollision(this._kinematic[j]);
				}
			}

			for (var i = 0; i < this._trigger.length; i++)
			{
				for (var j = i + 1; j < this._trigger.length; j++)
				{
					this._trigger[i].tryCollision(this._trigger[j]);
				}
				for (var j = 0; j < this._dynamic.length; j++)
				{
					this._trigger[i].tryCollision(this._dynamic[j]);
				}
				for (var j = 0; j < this._kinematic.length; j++)
				{
					this._trigger[i].tryCollision(this._kinematic[j]);
				}
			}
		}

		render(interpolation)
		{
			if (this._frame)
			{
				for (var i = 0; i < this._gameObjects.length; i++)
				{
					this._gameObjects[i].render(interpolation);
				}
				this._frame.render();
			}
		}

		/**
		 * Adds gameObject to the scene
		 * @param gameObject: GameObject; The object to add
		 */
		addToGame(gameObject)
		{
			this._gameObjects.push(gameObject);
			if (gameObject.getObjectType() == E.GameObject.GameObjectType.Physics)
			{
				this._physicsbodies.push(gameObject);
				this.addPhysicsBodyToLists(gameObject);
			}
			gameObject.onAddedToScene();
		}

		/**
		 * Removes gameObject from the scene
		 * @param gameObject: GameObject; The object to remove.
		 */
		removeFromGame(gameObject)
		{
			if (this._gameObjects.removeElement(gameObject))
			{
				if(gameObject.getObjectType() == E.GameObject.GameObjectType.Physics)
				{
					clearPhysicsBodyFromLists(gameObject);
				}
				gameObject.onRemovedFromScene();
			}
		}

		/**
		 * Clears the physics body from the category lists
		 * @param body: Engine.PhysicsBody; The physics body to clear
		 * @return: bool; Did we find and remove it? THIS IS NOT AN ERROR.
		 */
		clearPhysicsBodyFromLists(body)
		{
			var list;
			switch(body.getPhysicsType())
			{
				case E.PhysicsBody.PhysicsType.Dynamic:
					list = this._dynamic;
					break;
				case E.PhysicsBody.PhysicsType.Kinematic:
					list = this._kinematic;
					break;
				case E.PhysicsBody.PhysicsType.Trigger:
					list = this._trigger;
					break;
				default:
					list = null;
					break;
			}

			return list.removeElement(body);
		}

		/**
		 * Adds body to the correct category list
		 * @param body: Engine.PhysicsBody; The body to add
		 */
		addPhysicsBodyToLists(body)
		{
			switch (body.getPhysicsType())
			{
				case E.PhysicsBody.PhysicsType.Dynamic:
					this._dynamic.push(body);
					break;
				case E.PhysicsBody.PhysicsType.Kinematic:
					this._kinematic.push(body);
					break;
				case E.PhysicsBody.PhysicsType.Trigger:
					this._trigger.push(body);
					break;
			}
		}

		/**
		 * Sets the networking controller of this game.
		 * @param network: Engine.Networking; The network
		 */
		setNetworking(network)
		{
			this.network = network;
		}

		/**
		 * Sets the gameTime. This should basically only be used with networking. You better know what you're doing if you use this.
		 * @param gameTime: float; The game time to set to
		 */
		setGameTime(gameTime)
		{
			this._gameTime = gameTime;
		}

		/**
		 * Gets the 3js scene used to render stuff
		 * @return: THREE.Scene; The rendering scene.
		 */
		getRenderScene()
		{
			return this._frame.getScene();
		}

		/**
		 * Gets the 3js camera used to render stuff
		 * @return: THREE.Camera; The rendering camera
		 */
		getRenderCamera()
		{
			return this._frame.getCamera();
		}

		/**
		 * Gets the frame used to render stuff
		 * @return: Engine.Frame; The frame
		 */
		getFrame()
		{
			return this._frame;
		}

		/**
		 * Gets the input that controls this game
		 * @return: Engine.Input; The input
		 */
		getInput()
		{
			return this._input;
		}

		/**
		 * Gets the asset manager that is associated with this game.
		 * @return: Engine.AssetManager; The asset manager
		 */
		getAssetManager()
		{
			return this._assetManager;
		}
	};

	E.Game.TIME_FLT_PNT_ADJ = 1000000.0;

}(Engine || {}))
