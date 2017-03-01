var Engine = (function(E){
	E.SpriteComponent = class extends E.SceneComponent
	{
		/**
		 * @param name: string; The name of the component. Should be unique. Random name if none provided
		 * @param offset: THREE.Vector3; The offset from the object.
		 * @param texture: THREE.Texture; The texture to assign to this sprite component. Can be null if defining a special material
		 * @param scale: THREE.Vector3; The scale of the sprite. Default is (1,1,1)
		 * @param material: THREE.Material; Optionaly custom material.
		 * @param angleToScreen: float; The angle in radians to angle this sprite to the screen. Default is 0
		 * @param rotation: float; The angle in radians to rotate around the z-axis: Default is 0
		 */
		constructor(name, offset, texture, scale, material, angleToScreen, rotation)
		{
			super();

			this.angleToScreen = angleToScreen || 0;
			this.rotation = rotation || 0;

			this.scale = scale || new THREE.Vector3(1,1,1);

			this._material = material || new THREE.MeshBasicMaterial({color: 0xffffff, map: texture })
			this._mesh = null;

			this._renderPos = null;
		}

		update(deltaTime)
		{
			this._renderPos.update();
		}

		onAdded()
		{
			var self = this;
			this._renderPos = new Engine.LerpVectorProperty(function(){ return self.getPosition(); });
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
			var interpPos = this._renderPos.get(interpolation);
			this._mesh.position.set(interpPos.x, interpPos.y, interpPos.z);
			this._mesh.scale.set(this.scale.x, this.scale.y / Math.cos(this.angleToScreen), this.scale.z);
			this._mesh.rotation.set(this.angleToScreen, 0, this.rotation);
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
