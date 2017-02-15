(function(E){
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
}(Engine || {}))
