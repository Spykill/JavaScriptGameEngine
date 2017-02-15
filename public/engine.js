var Engine = (function(E){
	E.Input = class {
		constructor()
		{
			// Define the arrays
			this._keys = {};
			this._keysDown = {};
			this._keysUp = {};

			// Define the variables
			this._mouseWheel = 0;
			this._mouseX = 0;
			this._mouseY = 0;
			this._mouseDeltaX = 0;
			this._mouseDeltaY = 0;
		}

		/**
		 * Sets up the input listeners on a specified element
		 * @param eventElement: DOMElement; The element to set event listeners on
		 */
		setup(eventElement)
		{
			var inp = this;

			eventElement.addEventListener("keydown", function(evt){ inp.onKeyDown(evt); });
			eventElement.addEventListener("keyup", function(evt){ inp.onKeyUp(evt); });
			eventElement.addEventListener("mousedown", function(evt){ inp.onMouseDown(evt); });
			eventElement.addEventListener("mouseup", function(evt){ inp.onMouseUp(evt); });

			eventElement.addEventListener("mousemove", function(evt){ inp.onMouseMove(evt); });
			eventElement.addEventListener("mousedrag", function(evt){ inp.onMouseMove(evt); });

			eventElement.addEventListener("wheel", function(evt){ inp.onMouseWheel(evt); });
		}

		/**
		 * Clears all values after an update so that we can get new input that is completely unrelated.
		 */
		flush()
		{
			for(var key in this._keysDown)
			{
				this._keysDown[key] = false;
				this._keysUp[key] = false;
			}

			this._mouseDeltaX = 0;
			this._mouseDeltaY = 0;
			this._mouseWheel = 0;
		}

		getMouseX()
		{
			return this._mouseX;
		}

		getMouseY()
		{
			return this._mouseY;
		}

		getMouseDeltaX()
		{
			return this._mouseDeltaX;
		}

		getMouseDeltaY()
		{
			return this._mouseDeltaY;
		}

		getMouseWheelDelta()
		{
			return this._mouseWheel;
		}
		/**
		 * Is key held down right now?
		 * @param key: string; The key to check
		 */
		isKeyPressed(key)
		{
			return this._keys[key] == true;
		}

		/**
		 * Has key been pressed in this update?
		 * @param key: string; The key to check
		 */
		isKeyDown(key)
		{
			return this._keysDown[key] == true;
		}

		/**
		 * Has key been released in this update?
		 * @param key: string; The key to check
		 */
		isKeyUp(key)
		{
			return this._keysUp[key] == true;
		}

		/**
		 * The listener function on the keydown event
		 * @param evt: Event; The event that we heard
		 */
		onKeyDown(evt)
		{
			// Make sure that the key is either undefined or false.
			if(this._keys[evt.key] != true)
			{
				this._keys[evt.key] = true;
				this._keysDown[evt.key] = true;
			}

			Utility.cancelEventBubble(evt);
		}

		/**
		 * The listener function on the keyup event
		 * @param evt: Event; The event that we heard
		 */
		onKeyUp(evt)
		{
			// Make sure that the key is either undefined or true.
			if (this._keys[evt.key] != false)
			{
				this._keys[evt.key] = false;
				this._keysUp[evt.key] = true;
			}

			Utility.cancelEventBubble(evt);
		}

		/**
		 * The listener function on the mousedown event
		 * @param evt: Event; The event that we heard
		 */
		onMouseDown(evt)
		{
			evt.key = "MouseButton" + evt.button;
			this.onKeyDown(evt);
		}

		/**
		 * The listener function on the mouseup event
		 * @param evt: Event; The event that we heard
		 */
		onMouseUp(evt)
		{
			evt.key = "MouseButton" + evt.button;
			this.onKeyUp(evt);
		}

		/**
		 * The listener function on the mousemove and mousedrag events
		 * @param evt: Event; The event that we heard
		 */
		onMouseMove(evt)
		{
			this._mouseDeltaX += evt.clientX - this._mouseX;
			this._mouseDeltaY += evt.clientY - this._mouseY;
			this._mouseX = evt.clientX;
			this._mouseY = evt.clientY;
		}

		/**
		 * The listener function on the wheel event
		 * @param evt: Event; The event that we heard
		 */
		onMouseWheel(evt)
		{
			this._mouseWheel += evt.deltaY;
		}
	};

	E.Asset = class {
		constructor()
		{
			this._status = 0;
			this._progress = 0;

			this._error = null;

			this._onCompleted = new Array();
			this._onError = new Array();
		}

		/**
		 * Adds callback to the list of functions to be called when this asset has loaded
		 * @param callback: function(Object); The callback to call when loaded successfully
		 */
		addCompletedListener(callback)
		{
			this._onCompleted.push(callback);
		}

		/**
		 * Adds callback to the list of functions to be called when this asset has failed loading
		 * @param callback: function(Object); The callback to call when there is an error
		 */
		addErrorListener(callback)
		{
			this._onError.push(callback);
		}

		/**
		 * Begins loading the asset. This should be done in a non-blocking way. This should call _loadComplete at the end. Implement this when making custom assets.
		 */
		load() {}

		/**
		 * Makes ending the load sequence a lot easier. Just call this when you're done loading.
		 */
		loadComplete_()
		{
			this._status = 1;
			this._progress = 1;

			for (var i = 0; i < this._onCompleted.length; i++)
			{
				this._onCompleted[i](this.getResource());
			}
		}

		/**
		 * Makes exiting the load sequence easier when error'd. Just call this when you've hit an error loading.
		 * @param err: Object; The exception in some form.
		 */
		loadFailed_(err)
		{
			this._status = -1;
			this._error = err;

			for (var i = 0; i < this._onError.length; i++)
			{
				this._onError[i](err);
			}
		}

		/**
		 * Gets the load status
		 * @return: int; The status
		 */
		getStatus()
		{
			return this._status;
		}

		/**
		 * Gets the level of progress in loading the asset.
		 * @return: float; The progress
		 */
		getProgress()
		{
			return this._progress;
		}

		/**
		 * Gets the error that this asset got while loading
		 * @return: Object; the error
		 */
		 getError()
		 {
			 return this._error;
		 }

		/**
		 * Gets the resources once loaded
		 * @return: Object; the loaded resource or null if not yet loaded.
		 */
		getResource() { return null; }
	};

	E.TextureAsset = class extends E.Asset {
		constructor(assetURL)
		{
			super();

			this._assetURL = assetURL;
			this._loadedTexture = null;
		}

		load()
		{
			var loader = new THREE.TextureLoader();
			var self = this;
			loader.load(this._assetURL, function(texture){
					self._loadedTexture = texture;
					self.loadComplete_();
				}, function(xhr){
					self._progress = xhr.loaded / xhr.total;
				}, function(xhr){
					self.loadFailed_(xhr);
			});
		}

		getResource()
		{
			return this._loadedTexture;
		}
	};

	E.AssetManager = class {
		constructor()
		{
			this._assets = {};
			this._groups = {};
		}

		addAsset(groupName, assetName, asset)
		{
			if(this._groups[groupName] == undefined)
			{
				this._groups[groupName] = {};
			}
			this._groups[groupName][assetName] = asset;

			this._assets[assetName] = asset;
		}

		/**
		 * Gets the asset by its name
		 * @param assetName: string; The asset name
		 */
		getAsset(assetName)
		{
			return this._assets[assetName];
		}

		/**
		 * Loads the asset by its name
		 * @param assetName: string; The asset name
		 */
		loadAsset(assetName)
		{
			this._assets[assetName].load();
		}

		/**
		 * Loads an entire group by its name, asynchronously
		 * @param groupName: string; The group name
		 */
		loadGroup(groupName)
		{
			for (var k in this._groups[groupName])
			{
				this._groups[groupName][k].load();
			}
		}

		/**
		 * Loads an entire group by its name, ordered. This method is blocking.
		 * @param groupName: string; The group name
		 */
		loadGroupOrdered(groupName, endedCallback)
		{
			var ordered = new Array();
			for (var k in this._groups[groupName])
			{
				ordered.push(this._groups[groupName][k]);
			}

			var v = { ind: 1 };
			var self = this;
			if(ordered.length >= 1)
			{
				var recur = function(){
					if(v.ind == ordered.length)
					{
						endedCallback();
					}
					else
					{
						ordered[v.ind].addCompletedListener(recur);
						ordered[v.ind].addErrorListener(endedCallback);
						ordered[v.ind++].load();
					}
				}

				ordered[0].addCompletedListener(recur);
				ordered[0].addErrorListener(endedCallback);
				ordered[0].load();
			}
		}

		/**
		 * Checks if all assets in a group are loaded
		 * @param groupName: string; The group name
		 */
		isGroupLoaded(groupName)
		{
			for (var k in this._groups[groupName])
			{
				if (this._groups[groupName][k].status != 1)
				{
					return false;
				}
			}
			return true;
		}

		/**
		 * Checks if any assets in a group have errored
		 * @param groupName: string; The group name
		 */
		isGroupErrored(groupName)
		{
			for (var k in this._groups[groupName])
			{
				if (this._groups[groupName][k].status == -1)
				{
					return true;
				}
			}
			return false;
		}
	};

	E.Component = class {
		constructor()
		{
			this._owner = null;
		}

		/**
		 * Sets the owner of this component
		 * @param gameObject: GameObject; The owner object.s
		 */
		setOwner(gameObject)
		{
			this._owner = gameObject;
		}

		/**
		 * Called when the component is added to an object
		 */
		onAdded() {}

		/**
		 * Called when the component is removed from an object
		 */
		onRemoved() {}

		/**
		 * Called when the owner object is added to the scene. Not called if the object was already in the scene.
		 */
		onAddedToScene() {}

		/**
		 * Called when the owner object is removed from the scene.
		 */
		onRemovedFromScene() {}

		/**
		 * Called when the owner physics body is hit by or is a trigger and collides.
		 * @param other: PhysicsBody; The body that was hit
		 */
		onTriggerHit(other) {}

		/**
		 * Updates this component
		 * @param deltaTime: float; The time since the last update.
		 */
		update(deltaTime) {}

		/**
		 * Renders this component
		 * @param interpolation: float; The normalized (0-1) decimal between the previous state and the current state.
		 */
		render(interpolation) {}
	};

	E.GameObject = class {
		/**
		 * @param parent: GameObject; The parent object
		 * @param localPosition: Vector3; The positon relative to the parent (world if parent = null)
		 * @param game: Game; The game that this object is associated with
		 */
		constructor(parent, localPosition, game)
		{
			this._goType = E.GameObject.GameObjectType.Object;

			if(parent != null)
			{
				parent.addChild(this);
			}

			this._game = game;
			this.localPosition = localPosition || new THREE.Vector3();

			this._components = new Array();
			this._children = new Array();
		}

		/**
		 * Updates this game object, all its components and its children
		 * @param deltaTime: float; The time to update over
		 */
		update(deltaTime)
		{
			for (var i = 0; i < this._components.length; i++)
			{
				this._components[i].update(deltaTime);
			}

			for (var i = 0; i < this._children.length; i++)
			{
				this._children[i].update(deltaTime);
			}
		}

		render(interpolation)
		{
			for (var i = 0; i < this._components.length; i++)
			{
				this._components[i].render(interpolation);
			}

			for (var i = 0; i < this._children.length; i++)
			{
				this._children[i].render(interpolation);
			}
		}

		/**
		 * Adds obj to be a child of this object and if told, will adjust the localPosition of obj to be in the same place.
		 * @param obj: GameObject; The object to make a child
		 * @param adjustPosition: bool; Should obj be repositioned to keep its global position.
		 */
		addChild(obj, adjustPosition)
		{
			obj.parent = this;
			if(adjustPosition)
			{
				obj.localPosition = obj.getGlobalPosition().sub(this.getGlobalPosition());
			}
			this._children.push(obj);
		}

		/**
		 * Adds component to this game object
		 * @param component: Component; The component to add
		 * @return: Engine.GameObject; This, for method chaining
		 */
		addComponent(component)
		{
			this._components.push(component);
			component.setOwner(this);

			component.onAdded();

			return this;
		}

		/**
		 * Removes component from this game object
		 * @param component: Component; The component to remove.
		 */
		removeComponent(component)
		{
			if (this._components.removeElement(component))
			{
				component.onRemoved();
			}
		}

		/**
		 * Called when this object is added to the scene.
		 */
		onAddedToScene()
		{
			for (var i = 0; i < this._components.length; i++)
			{
				this._components[i].onAddedToScene();
			}
			for (var i = 0; i < this._children.length; i++)
			{
				this._children[i].onAddedToScene();
			}
		}

		/**
		 * Called when this object is removed from the scene.
		 */
		 onRemovedFromScene()
		 {
			 for (var i = 0; i < this._components.length; i++)
			 {
				 this._components[i].onRemovedFromScene();
			 }
			 for (var i = 0; i < this._children.length; i++)
			 {
				 this._children[i].onRemovedFromScene();
			 }
		 }

		/**
		 * Gets this object's type.
		 * @return: int; The object type
		 */
		getObjectType()
		{
			return this._goType;
		}

		/**
		 * Gets the game that this object is associated with.
		 * @return: Game; The game
		 */
		getGame()
		{
			return this._game;
		}

		/**
		 * Computes the global position of this object.
		 * @return: Vector3; The global position of this object.
		 */
		getGlobalPosition()
		{
			if (this.parent == null)
			{
				return this.localPosition.clone();
			}
			return this.parent.getGlobalPosition().add(this.localPosition);
		}
	};

	/**
	 * The type of the GameObject: Object, Physics
	 */
	E.GameObject.GameObjectType = {
		Object: 0,
		Physics: 1
	};

	E.Collider = class {
		constructor()
		{

		}

		/**
		 * Tests whether the objects have collided and collects data in the case of a collision.
		 * @param us: PhysicsBody; The physics body associated with this collider.
		 * @param other: Collider; The other Collider
		 * @param them: PhysicsBody; The other physics body
		 * @return: { normal: THREE.Vector3, penetration: float, point: THREE.Vector3 };
		 */
		testCollision(us, other, them) { return null; }

		/**
		 * Tests whether this and other are triggerin each other.
		 * @param us: PhysicsBody; The physics body associated with this collider.
		 * @param other: Collider; The other Collider
		 * @param them: PhysicsBody; The other physics body
		 * @return: bool; Are we triggering?
		 */
		testTrigger(us, other, them){}
	};

	E.PhysicsBody = class extends E.GameObject {
		constructor(parent, localPosition, game, mass, restitution)
		{
			super(parent, localPosition, game);

			this._goType = E.GameObject.GameObjectType.Physics;

			this._mass = mass;
			this.restitution = restitution;

			this._type = E.PhysicsBody.PhysicsType.Dynamic;
			this.velocity = new THREE.Vector3();

			this.colliders = new Array();
		}

		/**
		 * Begins testing body against this
		 * @param body: Engine.PhysicsBody; The other physics body to test against
		 */
		tryCollision(body)
		{
			if (this._type == E.PhysicsBody.PhysicsType.Kinematic)
			{
				if (body.getPhysicsType() == E.PhysicsBody.PhysicsType.Dynamic)
				{
					this._handleCollision(body);
				}
				else if(body.getPhysicsType() == E.PhysicsBody.PhysicsType.Trigger)
				{
					if (this.checkTrigger(body))
					{
						this.onTriggerHit(body);
					}
				}
			}
			else if (this._type == E.PhysicsBody.PhysicsType.Dynamic)
			{
				if(body.getPhysicsType() == E.PhysicsBody.PhysicsType.Trigger)
				{
					if (this.checkTrigger(body))
					{
						this.onTriggerHit(body);
					}
				}
				else
				{
					this._handleCollision(body);
				}
			}
			else
			{
				if (this.checkTrigger(body))
				{
					this.onTriggerHit(body);
				}
			}
		}

		/**
		 * Called when this object hits a trigger or a trigger hits this object
		 * @param body: Engine.PhysicsBody; The body that we hit.
		 */
		onTriggerHit(body)
		{
			for (var i = 0; i < this._components.length; i++)
			{
				this._components[i].onTriggerHit(body);
			}
			for (var i = 0; i < body._components.length; i++)
			{
				body._components[i].onTriggerHit(this);
			}
		}

		/**
		 * Moves the location forward based on the current velocity abd deltaTime
		 * @param deltaTime: float; The time since the last update.
		 */
		doVelocityStep(deltaTime)
		{
			this.localPosition.add(this.velocity.clone().multiplyScalar(deltaTime));
		}

		/**
		 * Handles any collision between this and body, if any exist
		 * @param body: Engine.PhysicsBody; The other body
		 */
		_handleCollision(body)
		{
			if(this._mass == 0 && body._mass == 0)
			{
				return;
			}

			var myMass = this._type == E.PhysicsBody.PhysicsType.Kinematic ? 0 : this._mass;
			var theirMass = body._type == E.PhysicsBody.PhysicsType.Kinematic ? 0 : body._mass;

			var massTotal = this._mass + body._mass;

			for (var i = 0; i < this.colliders.length; i++)
			{
				var collider = this.colliders[i];
				for(var j = 0; j < body.colliders.length; j++)
				{
					var other = body.colliders[j];
					var collisionData = collider.testCollision(this, other, body);

					if (cd != null)
					{
						this.localPosition.add(cd.normal.clone().multiplyScalar(cd.penetration * myMass / massTotal));
						body.localPosition.add(cd.normal.clone().multiplyScalar(-cd.penetration * theirMass / massTotal));

						var relVel = body.velocity.clone().sub(this.velocity);
						var velAlongNormal = relVel.dot(cd.normal);

						if(velAlongNormal < 0)
						{
							return;
						}

						var e = Math.min(this.restitution, body.restitution);
						var j = (1 + e) * velAlongNormal;
						if (myMass != 0 && theirMass != 0)
						{
							j /= myMass * theirMass;
						}
						var impulse = cd.normal.clone().multiplyScalar(j);
						this.velocity.add(impulse.clone().multiplyScalar(myMass));
						body.velocity.add(impulse.clone().multiplyScalar(-theirMass));
					}
				}
			}
		}

		/**
		 * Checks whether any triggers hit between this and body
		 * @return: bool; Have we triggered something?
		 */
		checkTrigger(body)
		{
			for (var i = 0; i < this.colliders.length; i++)
			{
				var collider = this.colliders[i];
				for(var j = 0; j < body.colliders.length; j++)
				{
					var other = body.colliders[j];

					if(collider.testTrigger(this, other, body))
					{
						return true;
					}
				}
			}
			return false;
		}

		/**
		 * Accelerates this body by acceleration. Not affected by mass
		 * @param acceleration: THREE.Vector3; The direction and magnitude of the acceleration.
		 * @param deltaTime: float; Time since last update. Optional
		 */
		accelerate(acceleration, deltaTime)
		{
			this.velocity.add(acceleration.clone().multiplyScalar(deltaTime || 1));
		}

		/**
		 * Accelerates this body by force, meaning it is affected by mass.
		 * @param force: THREE.Vector3; The force.
		 * @param deltaTime: float; Time since last update. Optional.
		 */
		applyForce(force, deltaTime)
		{
			this.velocity.add(force.clone().multiplyScalar((deltaTime || 1) / this._mass));
		}

		/**
		 * Gets the type of body that this is
		 * @return: int; The type of this
		 */
		getPhysicsType()
		{
			return this._type;
		}

		setPhysicsType(newType)
		{
			var r = this.getGame().clearPhysicsBodyFromLists(this);
			this._type = newType;
			if (r)
			{
				this.getGame().addPhysicsBodyToLists(this);
			}
		}
	};

	/**
	 * The type of PhysicsBodies: Dynamic, Kinematic, Trigger
	 */
	E.PhysicsBody.PhysicsType = {
		Dynamic: 0,
		Kinematic: 1,
		Trigger: 2
	};

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

			this._gameTime = Utility.getTime();

			this._gameObjects = new Array();
			this._physicsbodies = new Array();
			this._kinematic = new Array();
			this._dynamic = new Array();
			this._trigger = new Array();

			this.currentScene = null;

			this._updateTime = 1000000.0 / (gameFPS || 30);
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
			var newTime = Utility.getTime() * 1000000.0;
			var deltaTime = (newTime - self._gameTime);

			var frame = 0;

			while (deltaTime > self._updateTime && frame++ < self._frameSkip)
			{
				deltaTime -= self._updateTime;
				self._gameTime += self._updateTime / 1000000.0;

				self.update(self._updateTime / 1000000.0);
			}

			self.render(deltaTime > self._updateTime ? 1 : deltaTime / self._updateTime);

			self._input.flush();
			requestAnimationFrame(function(){ self._runGameLoop(self); });
		}

		/**
		 * Performs a single game frame.
		 */
		update(deltaTime)
		{
			this.physicsUpdate();

			for (var i = 0; i < this._gameObjects.length; i++)
			{
				this._gameObjects[i].update(deltaTime);
			}
		}

		physicsUpdate()
		{

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
		 * Gets the 3js scene used to render stuff
		 * @return: THREE.Scene; The rendering scene.
		 */
		getRenderScene()
		{
			return this._frame.getScene();
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

	E.Frame = class {
		constructor()
		{
			this._scene = null;
			this._camera = null;
			this._renderer = null;
		}

		/**
		 * Initializes the frame
		 */
		init()
		{
			this._scene = new THREE.Scene();
			this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

			this._renderer = new THREE.WebGLRenderer();
			this._renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(this._renderer.domElement);
		}

		/**
		 * Renders the _scene using _camera
		 */
		render()
		{
			this._renderer.render(this._scene, this._camera);
		}

		/**
		 * Gets the scene
		 * @return: THREE.Scene; The scene
		 */
		getScene()
		{
			return this._scene;
		}

		/**
		 * Creates an Input that is bound to the renderer
		 * @return: Engine.Input; The new input
		 */
		createInput()
		{
			var input = new E.Input();
			input.setup(this._renderer.domElement);
			return input;
		}
	};

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
