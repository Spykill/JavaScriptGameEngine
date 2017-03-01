varying vec2 pixelCoord;
varying vec2 texCoord;

uniform vec2 mapSize;

void main(void)
{
	pixelCoord = (vec2(uv.x, 1.0 - uv.y) * mapSize);
	texCoord = vec2(uv.x, 1.0 - uv.y);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
