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

	/**
	 * Abstract class for packet data
	 */
	E.Packet = class {
		/**
		 * @param packetId: int; The packet id of this object.
		 * @param network: Engine.Networking; The network
		 */
		constructor(packetId, network)
		{
			this.packetId = packetId;
			this.network = network;
		}

		/**
		 * Abstract. Encodes this packet in a binary representation
		 * @return: string; The binary representation
		 */
		encode()
		{
			return "" + String.fromCharCode(this.packetId);
		}

		/**
		 * Abstract. Decodes a packet from a binary representation
		 * @param network: Engine.Networking; The network that received the message.
		 * @param packetId: int; The packet ID.
		 * @param data: string; The binary representation to read from.
		 * @return: Engine.Packet; The packet that was in the binary representation.
		 */
		decode(network, packetId, data)
		{
			return new E.Packet(packetId, network);
		}
	};

	/**
	 * Treats incoming messages as packets and handles them accordingly
	 */
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
				this._packetHandler(this._packetTypes[packetId].decode(this, packetId, data.substring(1)));
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

	/**
	 * This packet should only be used in SyncNetworking
	 */
	E.UpdatePacket = class extends E.Packet {
		/**
		 * @param packetId: int; The packetId
		 * @param network: Engine.Networking; The network
		 * @param netId: string; The network ID of the thing we're updating
		 * @param value: Object; The value of the thing we're updating
		 * @param gameTime: float; The time that this update came at.
		 * @param encodeValueFcn: string function(Object); A function that takes the value object and converts it into a string
		 */
		constructor(packetId, network, netId, value, gameTime, encodeValueFcn)
		{
			super(packetId, network);
			this.netId = netId;
			this.value = value;
			this.gameTime = gameTime;

			this._encodeValueFcn = encodeValueFcn;
		}

		/**
		 * Applies the value associated with this packet to the syncable.
		 */
		applyUpdate()
		{
			this.network.getReadingSyncable(this.netId).setValue(this.value);
		}

		/**
		 * @override
		 */
		encode()
		{
			return super.encode() + E.NetworkUtils.String.getIOString(this.netId) + this._encodeValueFcn(this.value) + E.NetworkUtils.Float.toBinary(this.gameTime);
		}

		decode(network, packetId, data)
		{
			var dataContainer = {str: data};
			var netId = E.NetworkUtils.String.readFirstC(dataContainer);
			var syncable = network.getReadingSyncable(netId);
			return new E.UpdatePacket(packetId, network, netId, syncable.readValueC(dataContainer), E.NetworkUtils.Float.readFirstC(dataContainer), syncable.encodeValue);
		}
	};

	/**
	 * A class that controls how an object syncs over a network
	 */
	E.Syncable = class
	{
		/**
		 * @param netId: string | undefined; The network ID of this object OR undefined to generate a new object
		 */
		constructor(netId)
		{
			if(netId)
			{
				this._netId = netId;
			}
			else
			{
				this._netId = "";
				for(var i = 0; i < 8; i++)
				{
					this._netId += String.fromCharCode(Math.floor(Math.random() * 65535));
				}
			}
		}

		/**
		 * Abstract. Sets the value of this syncable to the provided value.
		 * @param value: object; The value to set to.
		 */
		setValue(value)
		{

		}

		/**
		 * Abstract. Gets the value of this syncable.
		 * @return: object; The value
		 */
		getValue()
		{

		}

		/**
		 * Reads the value of this syncable object from a network message without consuming
		 * @param data: string; The string to read the value from
		 * @return: object; The value of this syncable value.
		 */
		readValue(data)
		{
			return {};
		}

		/**
		 * Reads the value of this syncable object from a network message and consumes it.
		 * @param dataContainer: {str: string}; An object containing the string to read the value from
		 * @return: object; The value of this syncable value.
		 */
		readValueC(dataContainer)
		{
			return {};
		}

		/**
		 * Encodes the value in a binary representation. This function should be static.
		 * @param value: object; The value to encode
		 * @return: string; The binary representation
		 */
		encodeValue(value)
		{
			return "";
		}

		/**
		 * Gets the netId associated with this object.
		 * @return: string; The network ID
		 */
		getNetId()
		{
			return this._netId;
		}
	}

	/**
	 * Uses some default packets in order to keep objects synced across the network
	 */
	E.SyncNetworking = class extends E.PacketNetworking {

		constructor(handleCustomPacket)
		{
			super([E.UpdatePacket], this.handlePacket);
			this._customHandler = handleCustomPacket;

			this._readingSync = {};
			this._writingSync = {};
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
						packet.applyUpdate();
						break;
					default:
						break;
				}
			}
		}

		/**
		 * Sends updates for all the writing syncables.
		 * @param gameTime: float; The current game time.
		 */
		update(gameTime)
		{
			for (var key in this._writingSync)
			{
				if(this._writingSync.hasOwnProperty(key))
				{
					this.sendPacket(new E.UpdatePacket(0, this, key, this._writingSync[key].getValue(), gameTime, this._writingSync[key].encodeValue));
				}
			}
		}

		/**
		 * Adds the syncable to the reading list.
		 * @param syncable: Engine.Syncable; The syncable to add
		 */
		addReadingSyncable(syncable)
		{
			this._readingSync[syncable.getNetId()] = syncable;
		}

		/**
		 * Adds the syncable to the writing list.
		 * @param syncable: Engine.Syncable; The syncable to add
		 */
		addWritingSyncable(syncable)
		{
			this._writingSync[syncable.getNetId()] = syncable;
		}

		/**
		 * Deletes the syncable from the reading list.
		 * @param syncable: Engine.Syncable; The syncable to remove
		 */
		removeReadingSyncable(syncable)
		{
			delete this._readingSync[syncable.getNetId()];
		}

		/**
		 * Deletes the syncable from the writing list.
		 * @param syncable: Engine.Syncable; The syncable to remove
		 */
		removeWritingSyncable(syncable)
		{
			delete this._writingSync[syncable.getNetId()];
		}

		/**
		 * Gets the reading Syncable associated with the network ID
		 * @param netId: string; The network ID of the syncable
		 * @return: Engine.Syncable; The syncable associated with the network ID
		 */
		getReadingSyncable(netId)
		{
			return this._readingSync[netId];
		}

		/**
		 * Gets the writing Syncable associated with the network ID
		 * @param netId: string; The network ID of the syncable
		 * @return: Engine.Syncable; The syncable associated with the network ID
		 */
		getWritingSyncable(netId)
		{
			return this._writingSync[netId];
		}
	};
}(Engine || {}))
