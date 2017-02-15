(function(E){
	E.Frame = class {
		constructor()
		{
			this._scene = null;
			this._camera = null;
			this._renderer = null;
		}

		/**
		 * Initializes the frame
		 */
		init()
		{
			this._scene = new THREE.Scene();
			this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

			this._renderer = new THREE.WebGLRenderer();
			this._renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(this._renderer.domElement);
		}

		/**
		 * Renders the _scene using _camera
		 */
		render()
		{
			this._renderer.render(this._scene, this._camera);
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
			input.setup(this._renderer.domElement);
			return input;
		}
	};
}(Engine || {}))
