(function(E){
	E.CameraComponent = class extends E.Component {
		constructor()
		{
			super();
			this._renderPos = null;
		}

		onAdded()
		{
			var self = this;
			this._renderPos = new Engine.LerpVectorProperty(function(){ return self.getOwner().getGlobalPosition(); });
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
}(Engine || {}))
