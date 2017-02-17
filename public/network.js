(function(E){
	E.Networking = class {
		constructor()
		{

		}

		/**
		 * Connects to host
		 * @param host: string; The host name
		 */
		connectToServer(host)
		{
			this.connection = io(host);

			var self = this;
			io.on('connection', function(){ self.handleConnection(); });
			io.on('message', function(data){ self.handleMessage(data); });
			io.on('connection', function(){ self.handleConnection(); });
		}

		/**
		 * An event called when the connection is established.
		 */
		handleConnection() {}

		/**
		 * An event called when we receive a message over the network.
		 */
		handleMessage(evt) {}

		/**
		 * An event called when there is an error with the connection.
		 */
		handleError(evt) {}

		/**
		 * Sends a message over the network.
		 * @param data: Object; The data to be sent
		 */
		sendMessage(data)
		{
			this.connection.send(data);
		}
	};

	E.NetworkUtils = {};

	E.NetworkUtils.floatToBinary = function(flt)
	{
		
	};

	E.Packet = class {
		constructor(packetId)
		{
			this.packetId = packetId;
		}

		encode()
		{
			return "" + String.fromCharCode(this.packetId);
		}

		decode(network, packetId, data)
		{
			return new E.Packet(packetId);
		}
	};

	E.PacketNetworking = class extends E.Networking {
		/**
		 * @param packetClasses: Array[classOf<E.Packet>]; An array of classes that inherit from E.Packet. The index in the array is the packet id.
		 * 		The index of the function in the array is the packet id, which will always be the first element of any message. Data will not include the portion that identifies the packet.
		 * @param packetHandler: function({packetId: i, ...}); The function to call when a packet is received (the function is given the packet).
		 */
		constructor(packetClasses, packetHandler)
		{
			this._packetTypes = packetCreators;
			this._packetHandler = packetHandler;
		}

		/**
		 * @override
		 */
		handleMessage(evt)
		{
			var data = evt.data;
			var packetId = data.charCodeAt(0);
			if(this._packetTypes.length > packetId)
			{
				this._packetHandler(this._packetTypes[packetId](this, packetId, data.substring(1)));
			}
			else
			{
				console.log('Unknown packet received! What are you doing wrong friend??? Packet Id: ' + packetId);
			}
		}

		/**
		 * Sends a packet through the connection.
		 * @param packet: E.Packet; The packet to send.
		 */
		sendPacket(packet)
		{
			this.connection.send(packet.encode());
		}
	};

	E.UpdatePacket = class {
		constructor(packetId, netId, value, gameTime, encodeValueFcn)
		{
			super(packetId);
			this.netId = netId;
			this.value = value;
			this.gameTime = gameTime;

			this._encodeValueFcn = encodeValueFcn;
		}

		encode()
		{
			return super.encode() + String.fromCharCode(this.netId.length) + this.netId + this._encodeValueFcn(this.value) + this.convertFloatToBinary(this.gameTime);
		}

		/**
		 * Converts a float to its binary representation in a String
		 * @param flt: float; the float to convert
		 * @return:
		 */
		convertFloatToBinary(flt)
		{
			var fab = new Float32Array([flt]);
			var iab = new Int16Array(fab.buffer);
			var str = "";
			for(var i = 0; i < iab.length; i++)
			{
				str += String.fromCharCode(iab[i]);
			}
			return str;
		}
	};

	E.SyncNetworking = class extends E.PacketNetworking {

		constructor(handleCustomPacket)
		{
			super([E.UpdatePacket], this.handlePacket);
			this._customHandler = handleCustomPacket;
		}

		/**
		 * The packet to handle
		 */
		handlePacket(packet)
		{
			if(packet.packetId >= 1)
			{
				this._customHandler(packet);
			}
			else {
				switch (packet.packetId) {
					case 0:

						break;
					default:

				}
			}
		}
	};
}(Engine || {}))
