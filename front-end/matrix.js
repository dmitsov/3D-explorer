// преобразува градуси в радиани
function radians(degrees)
{
	return degrees*Math.PI/180;
}


// синус
function sin(a)
{
	return Math.sin(a);
}


// косинус
function cos(a)
{
	return Math.cos(a);
}


// пи
var PI = Math.PI;


// задаване на група от свойства на обект
function custom(obj,props)
{
	for(var n in props) obj[n]=props[n];
	return obj;
}

// създава матрица за ортографска проекция
function orthoMatrix(width, height, near, far)
{
	var matrix = [
		2.0/width, 0, 0, 0,
		0, 2.0/height, 0, 0,
		0, 0, 2.0/(near-far), 0,
		0, 0, (far+near)/(near-far), 1];
	return new Float32Array(matrix);
}


// създава матрица за перспективна проекция
// ъгълът на зрителното поле е в градуси
function perspMatrix(angle, aspect, near, far)
{
	var fov = 1/Math.tan(radians(angle)/2);
	var matrix = [
		fov/aspect, 0, 0, 0,
		0, fov, 0, 0,
		0, 0, (far+near)/(near-far), -1,
		0, 0, 2.0*near*far/(near-far), 0];
	return new Float32Array(matrix);
}


// установява перспективна проекция
function perspective(angle,aspect,near,far)
{
	var proj = perspMatrix(angle,aspect,near,far);
	gl.uniformMatrix4fv(uProjectionMatrix,false,proj);
}


// единичен вектор
function unitVector(x)
{
	var len = 1/Math.sqrt( x[0]*x[0]+x[1]*x[1]+x[2]*x[2] );
	return [ len*x[0], len*x[1], len*x[2] ];
}


// векторно произведение на два вектора
function vectorProduct(x,y)
{
	return [
		x[1]*y[2]-x[2]*y[1],
		x[2]*y[0]-x[0]*y[2],
		x[0]*y[1]-x[1]*y[0] ];
}


// скаларно произведение на два вектора
function scalarProduct(x,y)
{
	return x[0]*y[0] + x[1]*y[1] + x[2]*y[2];
}


// вектор между две точки
function vectorPoints(x,y)
{
	return [ x[0]-y[0], x[1]-y[1], x[2]-y[2] ];
}


// генерира матрица за гледна точка, параметрите сa масиви с по 3 елемента
function viewMatrix (eye, focus, up)
{
	// единичен вектор Z' по посоката на гледане
	var z = unitVector(vectorPoints(eye,focus));
	
	// единичен вектор X', перпендикулярен на Z' и на посоката нагоре
	var x = unitVector(vectorProduct(up,z));
	
	// единичен вектор Y', перпендикулярен на X' и Z'
	var y = unitVector(vectorProduct(z,x));
	
	// резултатът е тези три вектора + транслация
	var matrix = [
		x[0], y[0], z[0], 0,
		x[1], y[1], z[1], 0,
		x[2], y[2], z[2], 0,
		-scalarProduct(x,eye),
		-scalarProduct(y,eye),
		-scalarProduct(z,eye), 1 ];
	return new Float32Array(matrix);
};


// умножение на матрици
function multiplyMatrix(a, b) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	var out=[];
	var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
	out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	return out;
};

// създаване на матрица за нормалните вектори,
// чрез реципрочна стойност и транспозиция
function calculateNormalMatrix(a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

		b00 = a00 * a11 - a01 * a10,
		b01 = a00 * a12 - a02 * a10,
		b02 = a00 * a13 - a03 * a10,
		b03 = a01 * a12 - a02 * a11,
		b04 = a01 * a13 - a03 * a11,
		b05 = a02 * a13 - a03 * a12,
		b06 = a20 * a31 - a21 * a30,
		b07 = a20 * a32 - a22 * a30,
		b08 = a20 * a33 - a23 * a30,
		b09 = a21 * a32 - a22 * a31,
		b10 = a21 * a33 - a23 * a31,
		b11 = a22 * a33 - a23 * a32,

		// детерминанта
		det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	det = 1.0 / det;

	var out=[];
	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	out[3] = 0;
	
	out[4] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[6] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	out[7] = 0;

	out[8] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[9] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	out[11] = 0;
	
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;

	return out;
};


// установява гледна точка
function lookAt(eye,target,up)
{
	glvmat = viewMatrix(eye,target,up);
	gl.uniformMatrix4fv(uViewMatrix,false,glvmat);
}


// единична матрица
function unitMatrix()
{
	var matrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1];
	return new Float32Array(matrix);
}

// матрица за транслация по вектор V
function translateMatrix(v)
{
	var matrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		v[0], v[1], v[2], 1];
	return new Float32Array(matrix);
}


// матрица за мащабиране с вектор V
function scaleMatrix(v)
{
	var matrix = [
		v[0], 0, 0, 0,
		0, v[1], 0, 0,
		0, 0, v[2], 0,
		0, 0, 0, 1];
	return new Float32Array(matrix);
}


// матрица за въртене от X към Y около Z на ъгъл A
function zRotateMatrix(a)
{
	a = radians(a);
	var c = Math.cos(a);
	var s = Math.sin(a);
	var matrix = [
		c, s, 0, 0,
	   -s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1];
	return new Float32Array(matrix);
}


// матрица за въртене от Y към Z около X на ъгъл A
function xRotateMatrix(a)
{
	a = radians(a);
	var c = Math.cos(a);
	var s = Math.sin(a);
	var matrix = [
		1, 0, 0, 0,
		0, c, s, 0,
		0,-s, c, 0,
		0, 0, 0, 1];
	return new Float32Array(matrix);
}


// матрица за въртене от X към Z около Y на ъгъл A
function yRotateMatrix(a)
{
	a = radians(a);
	var c = Math.cos(a);
	var s = Math.sin(a);
	var matrix = [
		c, 0, s, 0,
		0, 1, 0, 0,
	   -s, 0, c, 0,
		0, 0, 0, 1];
	return new Float32Array(matrix);
}


// матрица за въртене около вектор V на ъгъл A
function rotateMatrix(a, v)
{
	a = radians(a);
	v = unitVector(v);
	
	var c = Math.cos(a);
	var s = Math.sin(a);
	
	var xx = v[0]*v[0]*(1-c);
	var xy = v[0]*v[1]*(1-c);
	var xz = v[0]*v[2]*(1-c);
	var yy = v[1]*v[1]*(1-c);
	var yz = v[1]*v[2]*(1-c);
	var zz = v[2]*v[2]*(1-c);
	
	var matrix = [
		xx+c,      xy-v[2]*s, xz+v[1]*s, 0,
		xy+v[2]*s, yy+c,      yz-v[0]*s, 0,
		xz-v[1]*s, yz+v[0]*s, zz+c,      0,
		0, 0, 0, 1];
	return new Float32Array(matrix);
}


// зарежда единичната матрица в матрицата на модела
function identity()
{
	glmatnew = true;
	glmat = new Float32Array( [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] );
}


// добавя транслация към матрицата на модела
function translate(v)
{
	glmatnew = true;
	glmat[12] += glmat[0]*v[0]+glmat[4]*v[1]+glmat[8]*v[2];
	glmat[13] += glmat[1]*v[0]+glmat[5]*v[1]+glmat[9]*v[2];
	glmat[14] += glmat[2]*v[0]+glmat[6]*v[1]+glmat[10]*v[2];
}


// добавя мащабиране към матрицата на модела
function scale(v)
{
	glmatnew = true;
	glmat[0] *= v[0];
	glmat[1] *= v[0];
	glmat[2] *= v[0];
	
	glmat[4] *= v[1];
	glmat[5] *= v[1];
	glmat[6] *= v[1];
	
	glmat[8] *= v[2];
	glmat[9] *= v[2];
	glmat[10] *= v[2];
}


// ако матрицата на модела е променена, изпраща я към шейдъра
function useMatrix()
{
	if (glmatnew)
	{
		glmatnew = false;
		gl.uniformMatrix4fv(uModelMatrix,false,glmat);
	}
}


// добавя въртене около X към матрицата на модела
function xRotate(a)
{
	glmatnew = true;
	
	a = radians(a);
	var s = Math.sin(a);
	var c = Math.cos(a);
	
	a = glmat[4]*s+glmat[8]*c;
	glmat[4]=glmat[4]*c-glmat[8]*s;
	glmat[8]=a;
	
	a = glmat[5]*s+glmat[9]*c;
	glmat[5]=glmat[5]*c-glmat[9]*s;
	glmat[9]=a;
	
	a = glmat[6]*s+glmat[10]*c;
	glmat[6]=glmat[6]*c-glmat[10]*s;
	glmat[10]=a;
}


// добавя въртене около Y към матрицата на модела
function yRotate(a)
{
	glmatnew = true;

	a = radians(a);
	var s = Math.sin(a);
	var c = Math.cos(a);
	
	a = glmat[0]*s+glmat[8]*c;
	glmat[0]=glmat[0]*c-glmat[8]*s;
	glmat[8]=a;
	
	a = glmat[1]*s+glmat[9]*c;
	glmat[1]=glmat[1]*c-glmat[9]*s;
	glmat[9]=a;
	
	a = glmat[2]*s+glmat[10]*c;
	glmat[2]=glmat[2]*c-glmat[10]*s;
	glmat[10]=a;
}


// добавя въртене около Z към матрицата на модела
function zRotate(a)
{
	glmatnew = true;

	a = radians(a);
	var s = Math.sin(a);
	var c = Math.cos(a);
	
	a = glmat[0]*s+glmat[4]*c;
	glmat[0]=glmat[0]*c-glmat[4]*s;
	glmat[4]=a;
	
	a = glmat[1]*s+glmat[5]*c;
	glmat[1]=glmat[1]*c-glmat[5]*s;
	glmat[5]=a;
	
	a = glmat[2]*s+glmat[6]*c;
	glmat[2]=glmat[2]*c-glmat[6]*s;
	glmat[6]=a;
}


// добавя текущата матрица на модела в стека за матрици
function pushMatrix()
{
	var mat = new Float32Array(glmat.length);
	mat.set(glmat);
	glstack.push(mat);
}


// извлича матрица на модела от стека за матрици
// при празен стек връща единичната матрица
function popMatrix()
{
	glmatnew = true;
	if (glstack.length)
		glmat = glstack.pop();
	else
		identity();
}


// клонира матрица като копира всичките ѝ стойности
function cloneMatrix(a)
{
	var b = new Float32Array(a.length);
	b.set(a);
	return b;
}


