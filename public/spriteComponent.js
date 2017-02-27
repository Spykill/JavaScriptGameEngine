var Engine = (function(E){
	E.SpriteComponent = class extends E.Component
	{
		constructor(texture, scale, material)
		{
			super();

			this._lastFrame = null;
			this._currentFrame = null;

			this.scale = scale;

			this._material = material || new THREE.MeshBasicMaterial({color: 0xffffff, map: texture })
			this._mesh = null;
		}

		update(deltaTime)
		{
			this._lastFrame = this._currentFrame;
			this._currentFrame = this.getOwner().getGlobalPosition();
		}

		onAddedToScene()
		{
			if(this.getOwner().isInScene())
			{
				this._mesh = new THREE.Mesh(E.SpriteComponent.SpriteGeometry, this._material);
				this.getOwner().getGame().getRenderScene().add(this._mesh);
			}
		}

		onRemovedFromScene()
		{
			this.getOwner().getGame().getRenderScene().remove(this._mesh);
			this._mesh = null;
		}

		render(interpolation)
		{
			var interpPos = (this._lastFrame || this._currentFrame).clone().lerp(this._currentFrame, interpolation);
			this._mesh.position.set(interpPos.x, interpPos.y, interpPos.z);
			this._mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
		}

		setMaterial(material)
		{
			this._mesh.material = material;
			this._material = material;
		}
	};

	E.SpriteComponent.SpriteGeometry = new THREE.PlaneGeometry(1,1);

	return E;
}(Engine || {}))
