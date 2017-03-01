var Engine = (function(E){
	E.CameraComponent = class extends E.SceneComponent {
		/**
		 * @param name: string; The name of the component. Should be unique. Random name if none provided
		 * @param offset: THREE.Vector3; The offset from the object.
		 */
		constructor(name, offset)
		{
			super(name, offset);
			this._renderPos = null;
		}

		onAdded()
		{
			var self = this;
			this._renderPos = new Engine.LerpVectorProperty(function(){ return self.getPosition(); });
		}

		update(deltaTime)
		{
			this._renderPos.update();
		}

		render(interpolation)
		{
			var pos = this._renderPos.get(interpolation);
			this.getOwner().getGame().getRenderCamera().position.set(pos.x, pos.y, pos.z);
		}
	};
	return E;
}(Engine || {}))
