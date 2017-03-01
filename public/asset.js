var Engine = (function(E){
	E.Asset = class {
		constructor()
		{
			this._status = 0;
			this._progress = 0;

			this._error = null;

			this._onCompleted = new Array();
			this._onError = new Array();
		}

		/**
		 * Adds callback to the list of functions to be called when this asset has loaded
		 * @param callback: function(Object); The callback to call when loaded successfully
		 */
		addCompletedListener(callback)
		{
			this._onCompleted.push(callback);
		}

		/**
		 * Adds callback to the list of functions to be called when this asset has failed loading
		 * @param callback: function(Object); The callback to call when there is an error
		 */
		addErrorListener(callback)
		{
			this._onError.push(callback);
		}

		/**
		 * Begins loading the asset. This should be done in a non-blocking way. This should call _loadComplete at the end. Implement this when making custom assets.
		 */
		load() {this._status = 3;}

		/**
		 * Makes ending the load sequence a lot easier. Just call this when you're done loading.
		 */
		loadComplete_()
		{
			this._status = 1;
			this._progress = 1;

			for (var i = 0; i < this._onCompleted.length; i++)
			{
				this._onCompleted[i](this.getResource());
			}
		}

		/**
		 * Makes exiting the load sequence easier when error'd. Just call this when you've hit an error loading.
		 * @param err: Object; The exception in some form.
		 */
		loadFailed_(err)
		{
			this._status = -1;
			this._error = err;

			for (var i = 0; i < this._onError.length; i++)
			{
				this._onError[i](err);
			}
		}

		/**
		 * Gets the load status
		 * @return: int; The status
		 */
		getStatus()
		{
			return this._status;
		}

		/**
		 * Gets the level of progress in loading the asset.
		 * @return: float; The progress
		 */
		getProgress()
		{
			return this._progress;
		}

		/**
		 * Gets the error that this asset got while loading
		 * @return: Object; the error
		 */
		 getError()
		 {
			 return this._error;
		 }

		/**
		 * Gets the resources once loaded
		 * @return: Object; the loaded resource or null if not yet loaded.
		 */
		getResource() { return null; }
	};

	E.TextureAsset = class extends E.Asset {
		constructor(assetURL)
		{
			super();

			this._assetURL = assetURL;
			this._loadedTexture = null;
		}

		load()
		{
			super.load();
			var loader = new THREE.TextureLoader();
			var self = this;
			loader.load(this._assetURL, function(texture){
					self._loadedTexture = texture;
					self.loadComplete_();
				}, function(xhr){
					self._progress = xhr.loaded / xhr.total;
				}, function(xhr){
					self.loadFailed_(xhr);
			});
		}

		getResource()
		{
			return this._loadedTexture;
		}
	};

	E.TextAsset = class extends E.Asset {
		constructor(assetURL, dataType)
		{
			super();
			this._assetURL = assetURL;
			this._dataType = dataType || 'text';
			this._loadedText = null;
		}

		load()
		{
			super.load();
			var self = this;
			$.ajax({url: this._assetURL, dataType: this._dataType }).done(function(data){
				self._loadedText = data;
				self.loadComplete_();
			}).fail(function(err){
				self.loadFailed_(err);
			});
		}

		getResource()
		{
			return this._loadedText;
		}
	};

	return E;
}(Engine || {}))
