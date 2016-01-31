var vShader =
	'uniform mat4 uProjectionMatrix;'+
	'uniform mat4 uViewMatrix;'+
	'uniform mat4 uModelMatrix;'+
	'uniform mat4 uNormalMatrix;'+
	'uniform bool uUseNormalMatrix;'+
	''+
	'uniform vec3 uAmbientColor;'+
	''+
	'uniform vec3 uLightDir;'+
	''+
	'attribute vec3 aXYZ;'+
	'attribute vec2 aST;'+
	'attribute vec3 aColor;'+
	'attribute vec3 aNormal;'+
	''+
	'varying vec3 vST;'+
	'varying vec3 vColor;'+
	'varying vec3 vNormal;'+
	'varying vec3 vPos;'+
	''+
	'void main(){'+
	'	mat4 mvMatrix = uViewMatrix * uModelMatrix;'+
	'	gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1);'+
	'	mat4 nMatrix = uUseNormalMatrix?uNormalMatrix:mvMatrix;'+
	
	'	vec4 pos = mvMatrix*vec4(aXYZ,1);'+
	'	vST = vec3(aST,1);'+
	'	vColor = uAmbientColor*aColor;'+
	''+
	'	vec3 light = normalize(-uLightDir);'+
	'	vec3 normal = vec3(normalize(nMatrix*vec4(aNormal,0)));'+
	'	vNormal = normal;'+
	'	vPos = pos.xyz/pos.w;'+
	'}';
	
var fShader =
	'precision mediump float;'+
	'uniform mat3 uTexMatrix;'+
	'uniform sampler2D uSampler;'+
	'uniform highp vec3 uLightDir;'+
	'uniform vec3 uSpecularColor;'+
	'uniform float uShinines;'+
	'uniform vec3 uDiffuseColor;'+
	'uniform bool uIsTextured;'+
	
	'varying vec3 vPos;'+
	'varying vec3 vST;'+
	'varying vec3 vColor;'+
	'varying vec3 vNormal;'+
	
	'void main()'+
	'{'+
	'	vec4 texCol =  texture2D(uSampler,(uTexMatrix*vST).st);'+
	'	vec3 light = normalize(-uLightDir);'+
	'	vec3 reflectedLight = normalize(reflect(light,vNormal));'+
	'	float cosa = max(dot(reflectedLight,vNormal),0.0);'+
	'	vec3 color = vColor;'+
	'	color += color*uDiffuseColor*abs(dot(vNormal,reflectedLight));'+
	'	vec4 modelCol;'+
	'	if(uIsTextured){'+
	'		modelCol = texCol*vec4(color,1.0);'+
	'	} else {'+
	'		modelCol = vec4(color,1.0);'+
	'	}'+
	'	vec3 specularColor = uSpecularColor*pow(cosa,uShinines);'+
	'	gl_FragColor = vec4(1,0,0,1) + vec4(specularColor*0.9,0.0);'+
	'}';
