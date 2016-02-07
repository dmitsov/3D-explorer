var vShader =
	'uniform mat4 uProjectionMatrix;\n'+
	'uniform mat4 uViewMatrix;\n'+
	'uniform mat4 uModelMatrix;\n'+
	'uniform mat4 uNormalMatrix;\n'+
	'uniform bool uUseNormalMatrix;\n'+
	''+
	'uniform vec3 uAmbientColor;\n'+
	''+
	'uniform vec3 uLightDir;\n'+
	''+
	'attribute vec3 aXYZ;\n'+
	'attribute vec2 aST;\n'+
	'attribute vec3 aColor;\n'+
	'attribute vec3 aNormal;\n'+
	''+
	'varying vec3 vST;\n'+
	'varying vec3 vColor;\n'+
	'varying vec3 vNormal;\n'+
	'varying vec3 vPos;'+
	''+
	'void main(){'+
	'	mat4 mvMatrix = uViewMatrix * uModelMatrix;\n'+
	'	gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1);'+
	'	mat4 nMatrix = uUseNormalMatrix?uNormalMatrix:mvMatrix;'+
	''+
	'	vec4 pos = mvMatrix*vec4(aXYZ,1);'+
	'	vec2 st = aST*1.0;'+
	'	vST = vec3(st,1);'+
	'	vec3 color = uAmbientColor*aColor;'+
	'	vColor = color;'+
	''+
	'	vec3 light = normalize(-uLightDir);'+
	'	vec3 normal = vec3(normalize(nMatrix*vec4(aNormal,0)));'+
	'	vNormal = normal;'+
	'	vPos = pos.xyz/pos.w;'+
	'}';
	
var fShader =
	'precision mediump float;\n'+
	'uniform mat3 uTexMatrix;'+
	'uniform sampler2D uSampler;'+
	'uniform highp vec3 uLightDir;'+
	'uniform vec3 uSpecularColor;'+
	'uniform float uShinines;'+
	'uniform vec3 uDiffuseColor;'+
	'uniform bool uIsTextured;'+
	''+
	'varying vec3 vPos;'+
	'varying vec3 vST;'+
	'varying vec3 vColor;'+
	'varying vec3 vNormal;'+
	''+
	'void main()'+
	'{'+
	'	vec4 texCol =  texture2D(uSampler,(uTexMatrix*vST).st);'+
	'	vec3 light = normalize(-uLightDir);'+
	'	vec3 reflectedLight = normalize(reflect(light,vNormal));'+
	'	float cosa = max(dot(reflectedLight,vNormal),0.0);'+
	'	vec3 color = vColor;'+
	'	vec3 dColor = color*uDiffuseColor*abs(dot(vNormal,reflectedLight));'+
	'	color += dColor;'+
	'	vec4 modelCol=uIsTextured?texCol*vec4(color,1.0):vec4(color,1.0);'+
	'	vec3 specularColor = uSpecularColor*pow(cosa,uShinines);'+
	'	gl_FragColor = modelCol + vec4(specularColor*0.9,0.0);'+
	'}';
