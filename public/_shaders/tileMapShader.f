varying vec2 pixelCoord;
varying vec2 texCoord;

uniform vec2 inverseLayerSize;
uniform vec2 inverseTilesetSize;
uniform vec2 tileSize;
uniform vec2 numTiles;
uniform vec2 mapToTileRatio;

uniform sampler2D tileset;
uniform sampler2D tileIds;

float decode24 (const in vec3 rgb)
{
	const vec3 bit_shift = vec3(256.0*256.0, 256.0, 1.0);
	float fl = dot(rgb, bit_shift);
	return fl * 255.0;
}

void main(void)
{
	vec2 tileLookingAt = (texCoord - mod(texCoord, inverseLayerSize)) * mapToTileRatio;
	vec3 tileId = texture2D(tileIds, tileLookingAt + inverseLayerSize * .5 * mapToTileRatio).rgb;
	tileId.rgb = tileId.bgr;
	float tileValue = decode24(tileId);
	if(tileValue == 0.0)
	{
		gl_FragColor = vec4(0,0,0,0);
	}
	else
	{
		vec2 tileLoc = vec2(mod(tileValue, numTiles.x) - 1.0, floor(tileValue / numTiles.x));

		vec2 offset = floor(tileLoc) * (tileSize + vec2(2,2));
		vec2 coord = pixelCoord - tileLookingAt / inverseLayerSize / mapToTileRatio * tileSize; //mod(pixelCoord, (tileSize)); // 

		coord += vec2(1,1);
		coord = clamp (coord, vec2(1,1), vec2(1,1) + tileSize);
		vec2 srcCoord = (offset + coord) * inverseTilesetSize;
		srcCoord = vec2(srcCoord.x, 1.0 - srcCoord.y);
		gl_FragColor = texture2D(tileset, srcCoord);
	}
}
