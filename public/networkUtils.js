var Engine = (function(E){
	E.NetworkUtils = {
		Int: {},
		Float: {},
		String: {}
	};

	/**
	 * Converts an int into a binary representation of it.
	 * @param int: int; The number to convert.
	 * @return: string; The binary representation
	 */
	E.NetworkUtils.Int.toBinary = function(int)
	{
		var iab = new Int32Array([int]);
		var uiab = new Uint16Array(iab.buffer);
		var str = "";
		for(var i = 0; i < uiab.length; i++)
		{
			str += String.fromCharCode(uiab[i]);
		}
		return str;
	};

	/**
	 * Reads the first 4 bytes of the string and converts it into an int
	 * @param str: string; The binary representation to parse. Must be at least 4 bytes long
	 * @return: int; The int value (int32)
	 */
	E.NetworkUtils.Int.readFirst = function(str)
	{
		var iab = new Uint16Array(2);
		iab[0] = str.charCodeAt(0);
		iab[1] = str.charCodeAt(1);

		var fab = new Int32Array(iab.buffer);
		return fab[0];
	};

	/**
	 * Reads the first 4 bytes of the string, converts it into an int, and then consumes the read bytes.
	 * @param strContainer: { str: string }; The object that stores the binary representation to parse. Must be at least 4 bytes long
	 * @return: int; The int value (int32)
	 */
	E.NetworkUtils.Int.readFirstC = function(strContainer)
	{
		var val = E.NetworkUtils.Int.readFirst(strContainer.str);
		strContainer.str = strContainer.str.substring(2);
		return val;
	};

	/**
	 * Converts a float into a binary string representation of it.
	 * @param flt: float; The number to convert
	 * @return: string; The binary representation
	 */
	E.NetworkUtils.Float.toBinary = function(flt)
	{
		var fab = new Float32Array([flt]);
		var iab = new Uint16Array(fab.buffer);
		var str = "";
		for(var i = 0; i < iab.length; i++)
		{
			str += String.fromCharCode(iab[i]);
		}
		return str;
	};

	/**
	 * Reads the first 4 bytes of the string and converts it into a float
	 * @param str: string; The binary representation to parse. Must be at least 4 bytes long
	 * @return: float; The float value (float32)
	 */
	E.NetworkUtils.Float.readFirst = function(str)
	{
		var iab = new Uint16Array(2);
		iab[0] = str.charCodeAt(0);
		iab[1] = str.charCodeAt(1);

		var fab = new Float32Array(iab.buffer);
		return fab[0];
	};

	/**
	 * Reads the first 4 bytes of the string, converts it into a float, and then consumes the read bytes.
	 * @param strContainer: { str: string }; The object that stores the binary representation to parse. Must be at least 4 bytes long
	 * @return: float; The float value (float32)
	 */
	E.NetworkUtils.Float.readFirstC = function(strContainer)
	{
		var val = E.NetworkUtils.Float.readFirst(strContainer.str);
		strContainer.str = strContainer.str.substring(2);
		return val;
	};

	/**
	 * Makes a string easier to send over the network. Only for strings with length 0-65535
	 * @param str: string; The string to send. Length must be 0-65535
	 * @return: string; The network string
	 */
	E.NetworkUtils.String.getIOString = function(str)
	{
		return String.fromCharCode(str.length) + str;
	};

	/**
	 * Read the first IO string in str
	 * @param str: string; The binary representation to read from.
	 * @return: string; The IO string
	 */
	E.NetworkUtils.String.readFirst = function(str)
	{
		var len = str.charCodeAt(0);
		return str.substring(1, len + 1);
	};

	/**
	 * Read the first IO string in str, then consume it
	 * @param strContainer: {str: string}; The object that stores the binary representation to parse
	 * @return: string; The IO string
	 */
	E.NetworkUtils.String.readFirstC = function(strContainer)
	{
		var len = strContainer.str.charCodeAt(0);
		var val = strContainer.str.substring(1, len + 1);
		strContainer.str = strContainer.str.substring(len + 1);
		return val;
	};

	return E;
}(Engine || {}))
