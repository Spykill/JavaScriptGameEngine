(function(E){
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
}(Engine || {}))
