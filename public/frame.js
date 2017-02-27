var Engine = (function(E){
	E.Frame = class {
		constructor()
		{
			this._scene = null;
			this._camera = null;
			this._renderer = null;

			this._cameraCreator = function(width, height) {
				return new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
			};
		}

		setCameraCreator(cameraCreator)
		{
			this._cameraCreator = cameraCreator;
			if (this._camera)
			{
				this._camera = this._cameraCreator(window.innerWidth, window.innerHeight);
			}
		}

		/**
		 * Initializes the frame
		 */
		init()
		{
			this._scene = new THREE.Scene();
			this._camera = this._cameraCreator(window.innerWidth, window.innerHeight);

			this._renderer = new THREE.WebGLRenderer();
			this._renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(this._renderer.domElement);

			var self = this;
			window.addEventListener("resize", function() { self.onResizeWindow(); } );
		}

		/**
		 * Renders the _scene using _camera
		 */
		render()
		{
			this._renderer.render(this._scene, this._camera);
		}

		/**
		 * Event listener for resizing the window
		 */
		onResizeWindow()
		{
			this._renderer.setSize(window.innerWidth, window.innerHeight);
			this._camera = this._cameraCreator(window.innerWidth, window.innerHeight);
		}

		/**
		 * Gets the scene
		 * @return: THREE.Scene; The scene
		 */
		getScene()
		{
			return this._scene;
		}

		/**
		 * Gets the camera
		 * @return: THREE.Camera; The camera
		 */
		getCamera()
		{
			return this._camera;
		}

		/**
		 * Creates an Input that is bound to the renderer
		 * @return: Engine.Input; The new input
		 */
		createInput()
		{
			var input = new E.Input();
			input.setup(document.body);
			return input;
		}
	};

	return E;
}(Engine || {}))
