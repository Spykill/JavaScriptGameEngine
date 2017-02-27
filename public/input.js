var Engine = (function(E){
	E.Input = class {
		constructor()
		{
			// Define the arrays
			this._keys = {};
			this._keysDown = {};
			this._keysUp = {};

			// Define the variables
			this._mouseWheel = 0;
			this._mouseX = 0;
			this._mouseY = 0;
			this._mouseDeltaX = 0;
			this._mouseDeltaY = 0;
		}

		/**
		 * Sets up the input listeners on a specified element
		 * @param eventElement: DOMElement; The element to set event listeners on
		 */
		setup(eventElement)
		{
			var inp = this;

			eventElement.addEventListener("keydown", function(evt){ inp.onKeyDown(evt); });
			eventElement.addEventListener("keyup", function(evt){ inp.onKeyUp(evt); });
			eventElement.addEventListener("mousedown", function(evt){ inp.onMouseDown(evt); });
			eventElement.addEventListener("mouseup", function(evt){ inp.onMouseUp(evt); });

			eventElement.addEventListener("mousemove", function(evt){ inp.onMouseMove(evt); });
			eventElement.addEventListener("mousedrag", function(evt){ inp.onMouseMove(evt); });

			eventElement.addEventListener("wheel", function(evt){ inp.onMouseWheel(evt); });
		}

		/**
		 * Clears all values after an update so that we can get new input that is completely unrelated.
		 */
		flush()
		{
			for(var key in this._keysDown)
			{
				this._keysDown[key] = false;
				this._keysUp[key] = false;
			}

			this._mouseDeltaX = 0;
			this._mouseDeltaY = 0;
			this._mouseWheel = 0;
		}

		getMouseX()
		{
			return this._mouseX;
		}

		getMouseY()
		{
			return this._mouseY;
		}

		getMouseDeltaX()
		{
			return this._mouseDeltaX;
		}

		getMouseDeltaY()
		{
			return this._mouseDeltaY;
		}

		getMouseWheelDelta()
		{
			return this._mouseWheel;
		}
		/**
		 * Is key held down right now?
		 * @param key: string; The key to check
		 */
		isKeyPressed(key)
		{
			return this._keys[key] == true;
		}

		/**
		 * Has key been pressed in this update?
		 * @param key: string; The key to check
		 */
		isKeyDown(key)
		{
			return this._keysDown[key] == true;
		}

		/**
		 * Has key been released in this update?
		 * @param key: string; The key to check
		 */
		isKeyUp(key)
		{
			return this._keysUp[key] == true;
		}

		/**
		 * The listener function on the keydown event
		 * @param evt: Event; The event that we heard
		 */
		onKeyDown(evt)
		{
			// Make sure that the key is either undefined or false.
			if(this._keys[evt.key] != true)
			{
				this._keys[evt.key] = true;
				this._keysDown[evt.key] = true;
			}

			Utility.cancelEventBubble(evt);
		}

		/**
		 * The listener function on the keyup event
		 * @param evt: Event; The event that we heard
		 */
		onKeyUp(evt)
		{
			// Make sure that the key is either undefined or true.
			if (this._keys[evt.key] != false)
			{
				this._keys[evt.key] = false;
				this._keysUp[evt.key] = true;
			}

			Utility.cancelEventBubble(evt);
		}

		/**
		 * The listener function on the mousedown event
		 * @param evt: Event; The event that we heard
		 */
		onMouseDown(evt)
		{
			evt.key = "MouseButton" + evt.button;
			this.onKeyDown(evt);
		}

		/**
		 * The listener function on the mouseup event
		 * @param evt: Event; The event that we heard
		 */
		onMouseUp(evt)
		{
			evt.key = "MouseButton" + evt.button;
			this.onKeyUp(evt);
		}

		/**
		 * The listener function on the mousemove and mousedrag events
		 * @param evt: Event; The event that we heard
		 */
		onMouseMove(evt)
		{
			this._mouseDeltaX += evt.clientX - this._mouseX;
			this._mouseDeltaY += evt.clientY - this._mouseY;
			this._mouseX = evt.clientX;
			this._mouseY = evt.clientY;
		}

		/**
		 * The listener function on the wheel event
		 * @param evt: Event; The event that we heard
		 */
		onMouseWheel(evt)
		{
			this._mouseWheel += evt.deltaY;
		}
	};

	return E;
}(Engine || {}));
