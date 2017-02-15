(function(E){
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
}(Engine || {}))
