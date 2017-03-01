var Engine = (function(E){
	E.LerpProperty = class {
		/**
		 * @param getFunction: Object function(); Gets the current value of the property
		 * @param lerpFunction: Object function(Object, Object, float); Takes the last value, the current value, and the alpha between them to produce the lerped value.
		 */
		constructor(getFunction, lerpFunction)
		{
			this._getter = getFunction;
			this._lerper = lerpFunction;

			this._lastValue = null;
			this._currentValue = this._getter();
		}

		update()
		{
			this._lastValue = this._currentValue;
			this._currentValue = this._getter();
		}

		get(alpha)
		{
			return this._lerper(this._lastValue, this._currentValue, alpha);
		}
	}

	E.LerpVectorProperty = class extends E.LerpProperty {
		/**
		 * @param getFunction: Object function(); Gets the current value of the property
		 */
		constructor(getFunction)
		{
			super(getFunction, function(last, now, alpha){
				last = (last || now);
				return last.clone().lerp(now, alpha);
			});
		}
	};

	E.LerpFloatProperty = class extends E.LerpProperty
	{
		/**
		 * @param getFunction: Object function(); Gets the current value of the property
		 */
		constructor(getFunction)
		{
			super(getFunction, function(last, now, alpha){
				last = last || now;
				return last + (now - last) * alpha;
			});
		}
	};

	E.LerpColourProperty = class extends E.LerpProperty
	{
		/**
		 * @param getFunction: Object function(); Gets the current value of the property
		 */
		constructor(getFunction)
		{
			super(getFunction, function(last, now, alpha){
				last = last || now;
				return last.clone().lerp(now, alpha);
			});
		}
	}

	E.Component = class {
		/**
		 * @param name: string; The name of the component. This should be unique. Given a random string if none provided.
		 */
		constructor(name)
		{
			this._owner = null;
			this._name = name;
			if(!name)
			{
				this._name = "";
				for(var i = 0; i < 8; i++)
				{
					this._name += String.fromCharCode(Math.floor(Math.random() * 65535));
				}
			}
		}

		/**
		 * Sets the owner of this component
		 * @param gameObject: GameObject; The owner object
		 */
		setOwner(gameObject)
		{
			this._owner = gameObject;
		}

		/**
		 * Gets the owner of this component
		 * @return: GameObject; The owner object
		 */
		getOwner()
		{
			return this._owner;
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
		 * Called when the component is added to the scene.
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

	E.SceneComponent = class extends E.Component {
		/**
		 * @param name: string; The name of the component. Should be unique. Random name if none provided
		 * @param offset: THREE.Vector3; The offset from the object. Default is (0,0,0)
		 */
		constructor(name, offset)
		{
			super(name);
			this.offset = offset || new THREE.Vector3();
		}

		getPosition()
		{
			return this.getOwner().getGlobalPosition().add(this.offset);
		}
	};

	return E;
}(Engine || {}))
