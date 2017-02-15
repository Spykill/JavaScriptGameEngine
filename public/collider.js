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
	
	E.Rectangle = class {

	};

	E.ColliderBox = class {

	};
}(Engine || {}))
