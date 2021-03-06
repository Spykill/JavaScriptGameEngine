
var Engine = (function(E){
	E.AssetManager = class {
		constructor()
		{
			this._assets = {};
			this._groups = {};
		}

		addAsset(groupName, assetName, asset)
		{
			if(this._groups[groupName] == undefined)
			{
				this._groups[groupName] = {};
			}
			this._groups[groupName][assetName] = asset;

			this._assets[assetName] = asset;
		}

		hasAsset(assetName)
		{
			return this._assets[assetName];
		}

		/**
		 * Gets the asset by its name
		 * @param assetName: string; The asset name
		 */
		getAsset(assetName)
		{
			return this._assets[assetName];
		}

		getOrLoadAsset(assetName, callback, error)
		{
			if(!this._assets[assetName])
			{
				return;
			}
			switch(this._assets[assetName].getStatus())
			{
				case 0:
					if(callback) {this._assets[assetName].addCompletedListener(callback);}
					if(error) {this._assets[assetName].addErrorListener(error);}
					this._assets[assetName].load();
					break;
				case 1:
					if(callback) {callback(this._assets[assetName].getResource());}
					break;
				case 2:
					if(error) {error(this._assets[assetName].getError());}
					break;
				case 3:
					if(callback) {this._assets[assetName].addCompletedListener(callback);}
					if(error) {this._assets[assetName].addErrorListener(error);}
					break;
			}
		}

		/**
		 * Loads the asset by its name
		 * @param assetName: string; The asset name
		 */
		loadAsset(assetName)
		{
			if(this._assets[assetName].getStatus() == 0)
			{
				this._assets[assetName].load();
			}
		}

		/**
		 * Loads an entire group by its name, asynchronously
		 * @param groupName: string; The group name
		 */
		loadGroup(groupName)
		{
			for (var k in this._groups[groupName])
			{
				this.loadAsset(k);
			}
		}

		/**
		 * Loads an entire group by its name, ordered. This method is blocking.
		 * @param groupName: string; The group name
		 */
		loadGroupOrdered(groupName, endedCallback)
		{
			var ordered = new Array();
			for (var k in this._groups[groupName])
			{
				if(this._groups[groupName][k].getStatus() == 0)
				{
					ordered.push(this._groups[groupName][k]);
				}
			}

			var v = { ind: 1 };
			var self = this;
			if(ordered.length >= 1)
			{
				var recur = function(){
					if(v.ind == ordered.length)
					{
						endedCallback();
					}
					else
					{
						ordered[v.ind].addCompletedListener(recur);
						ordered[v.ind].addErrorListener(endedCallback);
						ordered[v.ind++].load();
					}
				}

				ordered[0].addCompletedListener(recur);
				ordered[0].addErrorListener(endedCallback);
				ordered[0].load();
			}
		}

		/**
		 * Checks if all assets in a group are loaded
		 * @param groupName: string; The group name
		 */
		isGroupLoaded(groupName)
		{
			for (var k in this._groups[groupName])
			{
				if(this._groups[groupName].hasOwnProperty(k))
				{
					if (this._groups[groupName][k].status != 1)
					{
						return false;
					}
				}
			}
			return true;
		}

		/**
		 * Checks if any assets in a group have errored
		 * @param groupName: string; The group name
		 */
		isGroupErrored(groupName)
		{
			for (var k in this._groups[groupName])
			{
				if(this._groups[groupName].hasOwnProperty(k))
				{
					if (this._groups[groupName][k].status == -1)
					{
						return true;
					}
				}
			}
			return false;
		}
	};

	return E;
}(Engine || {}))
