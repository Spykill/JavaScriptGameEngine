(function(E){
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

	E.Rectangle2D = class {
		/**
		 * @param x: float; The tl x position
		 * @param y: float; The tl y position
		 * @param w: float; The width of the rectangle
		 * @param h: float; The height of the rectangle
		 */
		constructor(x, y, w, h)
		{
			this.tl = new THREE.Vector3(x, y);
			this.br = new THREE.Vector3(x + w, y + h);

			this.dim = new THREE.Vector3(w, h);
		}

		/**
		 * Creates a new rectangle that is translated by v
		 * @param v: Vector3; The translation vector
		 */
		translate(v)
		{
			var n = this.tl.clone().add(v);
			return new E.Rectangle2D(n.x, n.y, this.dim.x, this.dim.y);
		}

		intersects(rect)
		{
			return rect.x > this.br.x || rect.y > this.br.b || rect.br.x < this.tl.x || rect.br.y < this.tl.y;
		}

		/**
		 * Gets the centre of this rectangle
		 * @return: Vector3; The centre of this rectangle
		 */
		getCentre()
		{
			return this.tl.clone().add(this.dim.clone().multiplyScalar(0.5));
		}
	};

	E.ColliderBox2D = class extends E.Collider {
		/**
		 * @param rect: Engine.Rectangle2D; The rectangle relative to the object
		 */
		constructor(rect)
		{
			super();
			this._rect = rect;
		}

		testCollision(us, other, them)
		{
			var ourRect = this._rect.translate(us.getGlobalPosition());
			var theirRect = other._rect.translate(them.getGlobalPosition());

			var ourCentre = ourRect.getCentre();
			var theirCentre = theirRect.getCentre();

			var toThemV = theirCentre.sub(ourCentre);

			var extentX = (ourRect.dim.x + theirRect.dim.x) * 0.5;
			var extentY = (ourRect.dim.y + theirRect.dim.y) * 0.5;

			var xPen = extentX - Math.abs(toThemV.x);
			var yPen = extentY - Math.abs(toThemV.y);

			if(xPen < 0 || yPen < 0)
			{
				return null;
			}

			if (xPen < yPen)
			{
				if (toThemV.x < 0)
				{
					return { normal: new THREE.Vector3(1,0), point: new THREE.Vector3(), penetration: xPen };
				}
				else
				{
					return { normal: new THREE.Vector3(-1,0), point: new THREE.Vector3(), penetration: xPen };
				}
			}
			else
			{
				if (toThemV.y < 0)
				{
					return { normal: new THREE.Vector3(0,1), point: new THREE.Vector3(), penetration: yPen };
				}
				else
				{
					return { normal: new THREE.Vector3(0,-1), point: new THREE.Vector3(), penetration: yPen };
				}
			}
		}

		testTrigger(us, other, them)
		{
			var ourRect = this._rect.translate(us.getGlobalPosition());
			var theirRect = this._rect.translate(them.getGlobalPosition());

			return ourRect.intersects(theirRect);
		}
	};

	E.ColliderComponent = class extends E.Component {
		constructor(collider)
		{
			super();
			this._collider = collider;
		}

		onAdded()
		{
			if (this.getOwner().getObjectType() == E.GameObject.GameObjectType.Physics)
			{
				this.getOwner().colliders.push(this._collider);
			}
		}

		onRemoved()
		{
			if (this.getOwner().getObjectType() == E.GameObject.GameObjectType.Physics)
			{
				this.getOwner().colliders.removeElement(this._collider);
			}
		}
	};
}(Engine || {}))
