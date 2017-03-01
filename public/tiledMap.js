var Engine = (function(E){

	E.TiledMap = class {
		constructor(width, height, tilesetColumns, tileHeight, tileWidth, tilesetPath, data, file)
		{
			this.width = width;
			this.height = height;
			this.tilesetColumns = tilesetColumns;
			this.tileHeight = tileHeight;
			this.tileWidth = tileWidth;
			this.tilesetPath = tilesetPath;
			this.file = file;

			var charCode;
			this.tileLayers = new Array(data.length);
			for (var i = 0; i < data.length; i++)
			{
				var decoded = atob(data[i]);
				var charData = decoded.split('').map(function(x){ return x.charCodeAt(0); });
				var littleEndianBytes = pako.inflate(new Uint8Array(charData));
				this.tileLayers[i] = new Uint32Array(new ArrayBuffer(littleEndianBytes.length));
				for(var j = 0; j < littleEndianBytes.length / 4; j++)
				{
					this.tileLayers[i][j] = littleEndianBytes[j * 4 + 3] << 24 | littleEndianBytes[j * 4 + 2] << 16 | littleEndianBytes[j * 4 + 1] << 8 | littleEndianBytes[j * 4];
				}
			}
		}

		loadTileset(game)
		{
			if(!game.getAssetManager().hasAsset(this.file.tilesets[0].name))
			{
				game.getAssetManager().addAsset('engine', this.file.tilesets[0].name, new E.TextureAsset("_assets/"+this.tilesetPath));
			}

			game.getAssetManager().getAsset(this.file.tilesets[0].name).addCompletedListener(function(res){
				res.magFilter = THREE.NearestFilter;
				res.minFilter = THREE.NearestFilter;
			});
			game.getAssetManager().loadAsset(this.file.tilesets[0].name);
		}

		createObject(objId, parent, scale, localPosition, game)
		{
			this.loadTileset(game);
			var go = new E.GameObject(objId, parent, localPosition || new THREE.Vector3(), game);
			for(var i = 0; i < this.tileLayers.length; i++)
			{
				go.addComponent(new E.SpriteComponent("TileLayer" + i, null, null, scale, this._createLayerMaterial(i, go, game)));
			}
			return go;
		}

		_createLayerMaterial(i, go, game)
		{
			var arrayBuff = new ArrayBuffer(this.width * this.height * 3);
			var array8 = new Uint8Array(arrayBuff);
			for(var j = 0, il = this.tileLayers[i].length; j < il; j++)
			{
				var value = this.tileLayers[i][j];

				array8[j * 3] = (value & 0x000000ff);
				array8[j * 3 + 1] = (value & 0x0000ff00) >> 8;
				array8[j * 3 + 2] = (value & 0x00ff0000) >> 16;
			}

			var dataTex = new THREE.DataTexture(array8,
				this.width, this.height,
				THREE.RGBFormat,
				THREE.UnsignedByteType,
				THREE.UVMapping,
				THREE.ClampToEdgeWrapping,
				THREE.ClampToEdgeWrapping,
				THREE.NearestFilter,
				THREE.NearestFilter);
			dataTex.needsUpdate = true;

			var tWidth = this.tileWidth;
			var tHeight = this.tileHeight;
			var mat = new THREE.ShaderMaterial({
				uniforms: {
					mapSize: {type: 'v2', value: new THREE.Vector2(this.width * tWidth, this.height * tHeight)},
					inverseLayerSize: {type: 'v2', value: new THREE.Vector2(1.0 / this.width, 1.0 / this.height)},
					inverseTilesetSize: {type: 'v2', value: new THREE.Vector2(1.0 / this.file.tilesets[0].imagewidth, 1.0 / this.file.tilesets[0].imageheight)},

					tileSize: {type: 'v2', value: new THREE.Vector2(tWidth, tHeight)},
					numTiles: {type: 'v2', value: new THREE.Vector2(Math.floor(this.file.tilesets[0].imagewidth / (tWidth + 2)), Math.floor(this.file.tilesets[0].imageheight / (tHeight + 2)))},

					tileset: {type: 't', value: null },
					tileIds: {type: 't', value: dataTex }
				},
				transparent: true
			});

			game.getAssetManager().getOrLoadAsset(this.file.tilesets[0].name, function(tex){
				mat.uniforms.tileset.value = tex;
				mat.needsUpdate = true;
			});

			if(!game.getAssetManager().hasAsset("tileMapVertShader"))
			{
				game.getAssetManager().addAsset('engine', "tileMapVertShader", new E.TextAsset("_shaders/tileMapShader.v"));
			}
			if(!game.getAssetManager().hasAsset("tileMapFragShader"))
			{
				game.getAssetManager().addAsset('engine', "tileMapFragShader", new E.TextAsset("_shaders/tileMapShader.f"));
			}
			game.getAssetManager().getOrLoadAsset("tileMapVertShader", function(res){
				game.getAssetManager().getOrLoadAsset("tileMapFragShader", function(res2)
				{
					mat.vertexShader = res;
					mat.fragmentShader = res2;
					mat.needsUpdate = true;
				}, function(err){
					throw err;
				});
			}, function(err)
			{
				throw err;
			});
			return mat;
		}
	};

	/**
	 * Read a Tiled JSON map from a string. This file must be stored in Base64 gzip
	 * @param inStr: string; The entire Tiled JSON map.
	 */
	E.TiledMap.readTiledJSON = function(inStr)
	{
		var tiledFile = JSON.parse(inStr);
		var width = tiledFile.width;
		var height = tiledFile.height;
		var layers = new Array();
		for(var i = 0; i < tiledFile.layers.length; i++)
		{
			if(tiledFile.layers[i].type == "tilelayer")
			{
				layers.push(tiledFile.layers[i].data);
			}
		}
		var tilesetColumns = tiledFile.tilesets[0].columns;
		var tileWidth = tiledFile.tilesets[0].tilewidth;
		var tileHeight = tiledFile.tilesets[0].tileheight;
		var tilesetImage = tiledFile.tilesets[0].image;
		return new E.TiledMap(width, height, tilesetColumns, tileWidth, tileHeight, tilesetImage, layers, tiledFile);
	};


	return E;
}(Engine || {}));
