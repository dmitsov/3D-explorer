

// каноничен куб - конструктор
CanonicalCube = function()
{	
	// върхове
	var v = [ [+0.5,-0.5,-0.5], [+0.5,+0.5,-0.5],
			  [-0.5,+0.5,-0.5], [-0.5,-0.5,-0.5],
			  [+0.5,-0.5,+0.5], [+0.5,+0.5,+0.5],
			  [-0.5,+0.5,+0.5], [-0.5,-0.5,+0.5] ];
	// нормални вектори
	var n = [ [1,0,0], [-1,0,0],
			  [0,1,0], [0,-1,0],
			  [0,0,1], [0,0,-1] ];
	// общ списък връх-нормала
	var data = [].concat(
			  v[0],n[0],0,0, v[1],n[0],1,0, v[4],n[0],0,1, // предна стена
			  v[4],n[0],0,1, v[1],n[0],1,0, v[5],n[0],1,1,
			  v[6],n[1],0,1, v[2],n[1],0,0, v[7],n[1],1,1, // задна стена
			  v[7],n[1],1,1, v[2],n[1],0,0, v[3],n[1],1,0, 
			  v[5],n[2],0,1, v[1],n[2],0,0, v[6],n[2],1,1, // дясна стена 
			  v[6],n[2],1,1, v[1],n[2],0,0, v[2],n[2],1,0, 
			  v[4],n[3],1,1, v[7],n[3],0,1, v[0],n[3],1,0, // лява стена 
			  v[0],n[3],1,0, v[7],n[3],0,1, v[3],n[3],0,0, 
			  v[4],n[4],0,0, v[5],n[4],1,0, v[7],n[4],0,1, // горна стена
			  v[7],n[4],0,1, v[5],n[4],1,0, v[6],n[4],1,1, 
			  v[0],n[5],0,0, v[3],n[5],0,1, v[1],n[5],1,0, // долна стена 
			  v[1],n[5],1,0, v[3],n[5],0,1, v[2],n[5],1,1 );
	// локална променлива за инстанцията с WebGL буфер
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	// запомняме буфера в текущата инстанция
	this.buf = buf;
}

// каноничен куб - метод за рисуване
CanonicalCube.prototype.draw = function(texture)
{	
	// активираме буфера, създаден от конструктора
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// казваме къде са координатите
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,8*FLOATS,0*FLOATS);
	// казваме къде са нормалите
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,8*FLOATS,3*FLOATS);
	// казваме къде са текстурите
	if (gl.isTexture(texture))
	{
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.enableVertexAttribArray(aST);
		gl.vertexAttribPointer(aST,2,gl.FLOAT,false,8*FLOATS,6*FLOATS);
	}
	else
	{
		gl.disableVertexAttribArray(aST);
	}
	// рисуваме
	gl.drawArrays(gl.TRIANGLES,0,36);
}

var canonicalCube;

// куб - конструктор с параметри център и размер
Cube = function(center,size)
{
	// съхраняваме центъра и размера на куба
	this.center = center;
	this.size = size;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.rot = undefined;
	this.texture = undefined; // неизвестна текстура
	this.texMatrix = new Float32Array([1,0,0,0,1,0,0,0,1]); // текстурна матрица
	// създаваме еднократно канонична инстанция
	if (!canonicalCube)
		canonicalCube = new CanonicalCube();
}

// куб - рисуване
Cube.prototype.draw = function()
{
	pushMatrix(); // запомняме матрицата
	gl.vertexAttrib3fv(aColor,this.color); // подаваме цвета
	translate(this.center); // мястото
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.size]); // и размера
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	gl.uniformMatrix3fv(uTexMatrix,false,this.texMatrix);
	canonicalCube.draw(this.texture); // самото рисуване
	popMatrix(); // възстановяваме матрицата
}



// кубоид - конструктор с параметри център и размер
Cuboid = function(center,size)
{
	// съхраняваме центъра и размера на куба
	this.center = center;
	this.size = size;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.rot = undefined;
	this.texture = undefined; // неизвестна текстура
	this.texMatrix = new Float32Array([1,0,0,0,1,0,0,0,1]); // текстурна матрица
	// създаваме еднократно канонична инстанция
	if (!canonicalCube)
		canonicalCube = new CanonicalCube();
}

// кубоид - рисуване
Cuboid.prototype.draw = function()
{
	pushMatrix(); // запомняме матрицата
	gl.vertexAttrib3fv(aColor,this.color); // подаваме цвета
	translate(this.center); // мястото
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale(this.size); // и размера
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	gl.uniformMatrix3fv(uTexMatrix,false,this.texMatrix);
	canonicalCube.draw(this.texture); // самото рисуване
	popMatrix(); // възстановяваме матрицата
}



// канонична пирамида - конструктор
CanonicalPyramid = function(n)
{	
	// текущ ъгъл и ъглова разлика
	var a = 0, dA = 2*Math.PI/n;

	// генериране на основата като ветрило
	var data = [0,0,0, 0,0,-1];
	for (var i=0; i<=n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),0,0,0,-1);
		a += dA;
	}

	// генериране на околните стени
	a = 0;
	var nZ = Math.cos(Math.PI/n); // височина на нормалния вектор
	for (var i=0; i<=n; i++)
	{ 
		// нормален вектор (няма нужда да е единичен, в щейдъра се нормализира)
		var N = [Math.cos(a+dA/2),Math.sin(a+dA/2),0/*nZ*/];
		data.push(0,0,1,N[0],N[1],nZ);
		data.push(Math.cos(a),Math.sin(a),0,N[0],N[1],0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,N[0],N[1],0);
		a += dA;
	}
	
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме n и буфера
	this.n = n;
	this.buf = buf;
}

// канонична пирамида - метод за рисуване
CanonicalPyramid.prototype.draw = function(hollow)
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
	// рисуваме основата
	if (!hollow)
	{
		gl.drawArrays(gl.TRIANGLE_FAN,0,this.n+2);
	}
	// рисуваме околните стени
	gl.drawArrays(gl.TRIANGLES,this.n+2,3*this.n);
}

// масив от канонични пирамиди
var canonicalPyramid = [];

// пирамида - конструктор с параметри център, размер на основата, височина и брой стени
Pyramid = function(center,size,height,n)
{
	this.center = center;
	this.size = size;
	this.height = height;
	this.n = n;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.hollow = false;
	this.rot = undefined;
	// създаваме еднократно канонична пирамида
	if (!canonicalPyramid[n])
		canonicalPyramid[n] = new CanonicalPyramid(n);
}

// пирамида - рисуване
Pyramid.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.height]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	canonicalPyramid[this.n].draw(this.hollow);
	popMatrix();
}


// каноничен конус - конструктор
CanonicalCone = function(n)
{	
	// текущ ъгъл и ъглова разлика
	var a = 0, dA = 2*Math.PI/n;

	// генериране на основата като ветрило
	var data = [0,0,0, 0,0,-1];
	for (var i=0; i<=n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),0,0,0,-1);
		a += dA;
	}

	// генериране на околните стени
	a = 0;
	//var nZ = Math.cos(Math.PI/n); // височина на нормалния вектор
	for (var i=0; i<=n; i++)
	{ 
		// нормален вектор (няма нужда да е единичен, в щейдъра се нормализира)
		data.push(0,0,1,0,0,1/*N[0],N[1],N[2]*/);
		data.push(Math.cos(a),Math.sin(a),0,Math.cos(a),Math.sin(a),0/*Nz*/);
		a += dA;
		data.push(Math.cos(a),Math.sin(a),0,Math.cos(a),Math.sin(a),0/*Nz*/);
	}
	
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме n и буфера
	this.n = n;
	this.buf = buf;
}

// канонична пирамида - метод за рисуване
CanonicalCone.prototype.draw = function(hollow)
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
	// рисуваме основата
	if (!hollow)
	{
		gl.drawArrays(gl.TRIANGLE_FAN,0,this.n+2);
	}
	// рисуваме околните стени
	gl.drawArrays(gl.TRIANGLES,this.n+2,3*this.n);
}

// масив от канонични конуси
var canonicalCone = [];

// конус - конструктор с параметри център, размер на основата, височина
var CONE_SIDES = 32;
Cone = function(center,size,height)
{
	this.center = center;
	this.size = size;
	this.height = height;
	this.n = CONE_SIDES;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.hollow = false;
	this.rot = undefined;
	// създаваме еднократно канонична пирамида
	if (!canonicalCone[this.n])
		canonicalCone[this.n] = new CanonicalCone(this.n);
}

// конус - рисуване
Cone.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.height]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	canonicalCone[this.n].draw(this.hollow);
	popMatrix();
}



// канонична призма - конструктор
CanonicalPrism = function(n)
{	
	// текущ ъгъл и ъглова разлика
	var a = 0, dA = 2*Math.PI/n;

	// генериране на долната основа като ветрило
	var data = [0,0,0, 0,0,-1];
	for (var i=0; i<=n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),0,0,0,-1);
		a += dA;
	}

	// генериране на горната основа като ветрило
	data.push(0,0,1, 0,0,1);
	for (var i=0; i<=n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),1,0,0,1);
		a += dA;
	}

	// генериране на околните стени
	a = 0;
	var nZ = Math.cos(Math.PI/n); // височина на нормалния вектор
	for (var i=0; i<=n; i++)
	{ 
		var N = [Math.cos(a+dA/2),Math.sin(a+dA/2)];
		data.push(Math.cos(a),Math.sin(a),1,N[0],N[1],0);
		data.push(Math.cos(a),Math.sin(a),0,N[0],N[1],0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,N[0],N[1],0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),1,N[0],N[1],0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,N[0],N[1],0);
		data.push(Math.cos(a),Math.sin(a),1,N[0],N[1],0);
		a += dA;
	}
	
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме n и буфера
	this.n = n;
	this.buf = buf;
}

// канонична призма - метод за рисуване
CanonicalPrism.prototype.draw = function(hollow)
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
	// рисуваме долната и горната основа
	if (!hollow)
	{
		gl.drawArrays(gl.TRIANGLE_FAN,0,this.n+2);
		gl.drawArrays(gl.TRIANGLE_FAN,this.n+2,this.n+2);
	}
	// рисуваме околните стени
	gl.drawArrays(gl.TRIANGLES,2*this.n+4,6*this.n);
}

// масив от канонични призми
var canonicalPrism = [];

// призма - конструктор с параметри център, размер на основата, височина и брой стени
Prism = function(center,size,height,n)
{
	this.center = center;
	this.size = size;
	this.height = height;
	this.n = n;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.hollow = false;
	this.rot = undefined;
	// създаваме еднократно канонична призма
	if (!canonicalPrism[n])
		canonicalPrism[n] = new CanonicalPrism(n);
}

// призма - рисуване
Prism.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.height]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	canonicalPrism[this.n].draw(this.hollow);
	popMatrix();
}



// каноничен цилиндър - конструктор
CanonicalCylinder = function(n)
{	
	// текущ ъгъл и ъглова разлика
	var a = 0, dA = 2*Math.PI/n;

	// генериране на долната основа като ветрило
	var data = [0,0,0, 0,0,-1, 0.5,0.5];
	for (var i=0; i<=n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),0,0,0,-1, 0.5+0.5*Math.cos(a),0.5+0.5*Math.sin(a));
		a += dA;
	}

	// генериране на горната основа като ветрило
	data.push(0,0,1, 0,0,1, 0.5,0.5);
	for (var i=0; i<=n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),1,0,0,1, 0.5+0.5*Math.cos(a),0.5+0.5*Math.sin(a));
		a += dA;
	}

	// генериране на околните стени
	a = 0;
	var nZ = Math.cos(Math.PI/n); // височина на нормалния вектор
	for (var i=0; i<=n; i++)
	{ 
		var N = [Math.cos(a),Math.sin(a)]; // нормала към един отвес
		var M = [Math.cos(a+dA),Math.sin(a+dA)]; // нормала към следващия отвес
		data.push(Math.cos(a),Math.sin(a),1,N[0],N[1],0, i/n,1);
		data.push(Math.cos(a),Math.sin(a),0,N[0],N[1],0, i/n,0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,M[0],M[1],0, (i+1)/n,0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),1,M[0],M[1],0, (i+1)/n,1);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,M[0],M[1],0, (i+1)/n,0);
		data.push(Math.cos(a),Math.sin(a),1,N[0],N[1],0, i/n,1);
		a += dA;
	}
	
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме n и буфера
	this.n = n;
	this.buf = buf;
}

// каноничен цилиндър - метод за рисуване
CanonicalCylinder.prototype.draw = function(hollow, texture, texMatrix, texMatrixBase)
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,8*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,8*FLOATS,3*FLOATS);
	// казваме къде са текстурите
	if (gl.isTexture(texture))
	{
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.enableVertexAttribArray(aST);
		gl.vertexAttribPointer(aST,2,gl.FLOAT,false,8*FLOATS,6*FLOATS);
	}
	else
	{
		gl.disableVertexAttribArray(aST);
	}
	// рисуваме долната и горната основа
	if (!hollow)
	{
		gl.uniformMatrix3fv(uTexMatrix,false,texMatrixBase);
		gl.drawArrays(gl.TRIANGLE_FAN,0,this.n+2);
		gl.drawArrays(gl.TRIANGLE_FAN,this.n+2,this.n+2);
	}
	// рисуваме околните стени
	gl.uniformMatrix3fv(uTexMatrix,false,texMatrix);
	gl.drawArrays(gl.TRIANGLES,2*this.n+4,6*this.n);
}

// масив от канонични цилиндри
var canonicalCylinder = [];

// цилиндър - конструктор с параметри център, размер на основата, височина и брой стени
var CYLINDER_SIDES = 32;
Cylinder = function(center,size,height)
{
	this.center = center;
	this.size = size;
	this.height = height;
	this.n = CYLINDER_SIDES;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.hollow = false;
	this.rot = undefined;
	this.texture = undefined; // неизвестна текстура
	this.texMatrix = new Float32Array([1,0,0,0,1,0,0,0,1]); // текстурна матрица
	this.texMatrixBase = new Float32Array([1,0,0,0,1,0,0,0,1]); // текстурна матрица на основите
	// създаваме еднократно канонична призма
	if (!canonicalCylinder[this.n])
		canonicalCylinder[this.n] = new CanonicalCylinder(this.n);
}

// цилиндър - рисуване
Cylinder.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.height]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	canonicalCylinder[this.n].draw(this.hollow,this.texture,this.texMatrix,this.texMatrixBase);
	popMatrix();
}

// пресечен коноид - конструктор
Conoid = function(center,size,ratio)
{
	this.center = center;
	this.size = size;
	this.n = CONE_SIDES;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.hollow = false;
	this.rot = undefined;

	// заради ratio пресеченият коноид няма канонична форма
	var a = 0, dA = 2*Math.PI/this.n;
	// генериране на долната основа като ветрило
	var data = [0,0,0, 0,0,-1];
	for (var i=0; i<=this.n; i++)
	{ 
		data.push(Math.cos(a),Math.sin(a),0,0,0,-1);
		a += dA;
	}
	// генериране на горната основа като ветрило
	data.push(0,0,1, 0,0,1);
	for (var i=0; i<=this.n; i++)
	{ 
		data.push(ratio[0]*Math.cos(a),ratio[1]*Math.sin(a),1,0,0,1);
		a += dA;
	}
	// генериране на околните стени
	a = 0;
	var nZ = Math.cos(Math.PI/this.n); // височина на нормалния вектор
	for (var i=0; i<=this.n; i++)
	{ 
		var N = [Math.cos(a),Math.sin(a)]; // нормала към един отвес
		var M = [Math.cos(a+dA),Math.sin(a+dA)]; // нормала към следващия отвес
		data.push(ratio[0]*Math.cos(a),ratio[1]*Math.sin(a),1,N[0],N[1],0);
		data.push(Math.cos(a),Math.sin(a),0,N[0],N[1],0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,M[0],M[1],0);
		data.push(ratio[0]*Math.cos(a+dA),ratio[1]*Math.sin(a+dA),1,M[0],M[1],0);
		data.push(Math.cos(a+dA),Math.sin(a+dA),0,M[0],M[1],0);
		data.push(ratio[0]*Math.cos(a),ratio[1]*Math.sin(a),1,N[0],N[1],0);
		a += dA;
	}
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	this.buf = buf;
}

// // пресечен коноид - рисуване
Conoid.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale(this.size);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
		// рисуване на пресечен конус
		gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
		gl.enableVertexAttribArray(aXYZ);
		gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
		gl.enableVertexAttribArray(aNormal);
		gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
		if (!this.hollow)
		{
			gl.drawArrays(gl.TRIANGLE_FAN,0,this.n+2);
			gl.drawArrays(gl.TRIANGLE_FAN,this.n+2,this.n+2);
		}
		gl.drawArrays(gl.TRIANGLES,2*this.n+4,6*this.n);
	popMatrix();
}

// канонична сфера - конструктор
CanonicalSphere = function(n)
{	
	n = 2*Math.floor(n/2);
	function dataPush(a,b,s,t)
	{	// координати на точка и нормален вектор, текстурни координати
		data.push(
			Math.cos(a)*Math.cos(b),
			Math.sin(a)*Math.cos(b),
			Math.sin(b),
			s, t );
	}
	
	var data = [];
	
	// генериране на хоризонтални ленти
	var b = -Math.PI/2, dB = 2*Math.PI/n;
	for (var bi=0; bi<n/2; bi++)
	{
		// генериране на една лента
		var a = 0, dA = 2*Math.PI/n;
		for (var ai=0; ai<=n; ai++)
		{
			dataPush(a,b,ai/n,bi/(n/2));
			dataPush(a,b+dB,ai/n,(bi+1)/(n/2));
			a += dA;
		}
		b += dB;
	}

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме n и буфера
	this.n = n;
	this.buf = buf;
}

// канонична сфера - метод за рисуване
CanonicalSphere.prototype.draw = function(texture)
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,5*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,5*FLOATS,0*FLOATS);
	// казваме къде са текстурите
	if (gl.isTexture(texture))
	{
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.enableVertexAttribArray(aST);
		gl.vertexAttribPointer(aST,2,gl.FLOAT,false,5*FLOATS,3*FLOATS);
	}
	else
	{
		gl.disableVertexAttribArray(aST);
	}
	// рисуваме n ленти
	for (var i=0; i<this.n/2; i++)
		gl.drawArrays(gl.TRIANGLE_STRIP,2*(this.n+1)*i,2*(this.n+1));
}

// масив от канонични сфери
var canonicalSphere = [];

// сфера - конструктор с параметри център, радиус и n
var SPHERE_SIDES = 32;
Sphere = function(center,size)
{
	this.center = center;
	this.size = size;
	this.n = SPHERE_SIDES;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.rot = undefined;
	this.texture = undefined; // неизвестна текстура
	this.texMatrix = new Float32Array([1,0,0,0,1,0,0,0,1]); // текстурна матрица
	// създаваме еднократно канонична сфера
	if (!canonicalSphere[this.n])
		canonicalSphere[this.n] = new CanonicalSphere(this.n);
}

// сфера - рисуване
Sphere.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.size]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	gl.uniformMatrix3fv(uTexMatrix,false,this.texMatrix);
	canonicalSphere[this.n].draw(this.texture,this.texMatrix);
	popMatrix();
}

// сфероид - конструктор
Spheroid = function(center,size)
{
	this.center = center;
	this.size = size;
	this.n = SPHERE_SIDES;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.rot = undefined;
	// създаваме еднократно канонична сфера
	if (!canonicalSphere[this.n])
		canonicalSphere[this.n] = new CanonicalSphere(this.n);
}

// сфероид - рисуване
Spheroid.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale(this.size);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	
	gl.uniform1i(uUseNormalMatrix,true);
	var nmat = calculateNormalMatrix(multiplyMatrix(glvmat,glmat));
	gl.uniformMatrix4fv(uNormalMatrix,false,nmat);
	canonicalSphere[this.n].draw();
	gl.uniform1i(uUseNormalMatrix,false);

	popMatrix();
}

// каноничен икосаедър - конструктор
CanonicalIcosahedron = function(n)
{	
	var data = [];
	
	// генерира триъгълник, смята нормалния
	// вектор чрез векторно произведение
	function triangle(p1,p2,p3)
	{
		var u = vectorPoints(p2,p1);
		var v = vectorPoints(p3,p1);
		var norm = unitVector(vectorProduct(u,v));
		data.push( p1[0], p1[1], p1[2], norm[0], norm[1], norm[2] );
		data.push( p2[0], p2[1], p2[2], norm[0], norm[1], norm[2] );
		data.push( p3[0], p3[1], p3[2], norm[0], norm[1], norm[2] );
	}
	
	// златното сечение 1.618...
	var f = (1+Math.sqrt(5))/2;

	// триъгълници - стени на икосаедъра
	triangle([ 0, 1, f], [ 1, f, 0], [-1, f, 0]);	// десен горен
	triangle([ 0, 1,-f], [-1, f, 0], [ 1, f, 0]);	// десен долен
	triangle([ 0,-1, f], [-1,-f, 0], [ 1,-f, 0]);	// ляв горен
	triangle([ 0,-1,-f], [ 1,-f, 0], [-1,-f, 0]);	// ляв долен

	triangle([ 1, f, 0], [ f, 0, 1], [ f, 0,-1]);	// предни и задни
	triangle([ 1,-f, 0], [ f, 0,-1], [ f, 0, 1]);
	triangle([-1, f, 0], [-f, 0,-1], [-f, 0, 1]);
	triangle([-1,-f, 0], [-f, 0, 1], [-f, 0,-1]);

	triangle([ f, 0, 1], [ 0, 1, f], [ 0,-1, f]);	// горни и долни
	triangle([-f, 0, 1], [ 0,-1, f], [ 0, 1, f]);
	triangle([ f, 0,-1], [ 0,-1,-f], [ 0, 1,-f]);
	triangle([-f, 0,-1], [ 0, 1,-f], [ 0,-1,-f]);

	triangle([ 0, 1, f], [ f, 0, 1], [ 1, f, 0]);	// горни ъглови 
	triangle([ 0, 1, f], [-1, f, 0], [-f, 0, 1]);
	triangle([ 0,-1, f], [ 1,-f, 0], [ f, 0, 1]); 
	triangle([ 0,-1, f], [-f, 0, 1], [-1,-f, 0]);
	
	triangle([ 0, 1,-f], [ 1, f, 0], [ f, 0,-1]);	// долни ъглови 
	triangle([ 0, 1,-f], [-f, 0,-1], [-1, f, 0]);
	triangle([ 0,-1,-f], [ f, 0,-1], [ 1,-f, 0]); 
	triangle([ 0,-1,-f], [-1,-f, 0], [-f, 0,-1]);
	
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме буфера
	this.buf = buf;
}

// икосаедър - метод за рисуване
CanonicalIcosahedron.prototype.draw = function()
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
	// рисуваме 20 триъгълника
	gl.drawArrays(gl.TRIANGLES,0,3*20);
}

var canonicalIcosahedron;

// икосахедрон - конструктор
Icosahedron = function(center,size)
{
	this.center = center;
	this.size = size;
	this.color = [1,0.75,0];
	this.offset = undefined;
	this.rot = undefined;
	// създаваме еднократно каноничен икосаедър
	if (!canonicalIcosahedron)
		canonicalIcosahedron = new CanonicalIcosahedron();
}

// икосаедър - рисуване
Icosahedron.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.size]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	canonicalIcosahedron.draw();
	popMatrix();
}

var GEODESIC_SIDES = 3;

// масив от различни степени на детайлност
var canonicalGeodesicSphere = [];

// канонична геодезична сфера - конструктор
CanonicalGeodesicSphere = function(level)
{	
	var data = [];
	var n = 0;
	
	// средна точка на отсечка
	function mid(p,q)
	{
		return [(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2];
	}
	
	function triangle(p1,p2,p3,level)
	{
		if (level)
		{	// ако не сме достигнали границата на раздробяване,
			//  делим триъгълника на 4 по-малки триъгълника
			var m12 = mid(p1,p2);
			var m23 = mid(p2,p3);
			var m31 = mid(p3,p1);
			level--;
			triangle(p1,m12,m31,level);
			triangle(m12,p2,m23,level);
			triangle(m31,m23,p3,level);
			triangle(m12,m23,m31,level);
		}
		else
		{	// стигнали сме границата на раздробяване,
			// генерираме триъгълника
			p1 = unitVector(p1);
			p2 = unitVector(p2);
			p3 = unitVector(p3);
			data.push( p1[0], p1[1], p1[2] );
			data.push( p2[0], p2[1], p2[2] );
			data.push( p3[0], p3[1], p3[2] );
			n++;
		}
	}
	
	// златното сечение 1.618...
	var f = (1+Math.sqrt(5))/2;

	// триъгълници - стени на икосаедър
	triangle([ 0, 1, f], [ 1, f, 0], [-1, f, 0], level);	// десен горен
	triangle([ 0, 1,-f], [-1, f, 0], [ 1, f, 0], level);	// десен долен
	triangle([ 0,-1, f], [-1,-f, 0], [ 1,-f, 0], level);	// ляв горен
	triangle([ 0,-1,-f], [ 1,-f, 0], [-1,-f, 0], level);	// ляв долен

	triangle([ 1, f, 0], [ f, 0, 1], [ f, 0,-1], level);	// предни и задни
	triangle([ 1,-f, 0], [ f, 0,-1], [ f, 0, 1], level);
	triangle([-1, f, 0], [-f, 0,-1], [-f, 0, 1], level);
	triangle([-1,-f, 0], [-f, 0, 1], [-f, 0,-1], level);

	triangle([ f, 0, 1], [ 0, 1, f], [ 0,-1, f], level);	// горни и долни
	triangle([-f, 0, 1], [ 0,-1, f], [ 0, 1, f], level);
	triangle([ f, 0,-1], [ 0,-1,-f], [ 0, 1,-f], level);
	triangle([-f, 0,-1], [ 0, 1,-f], [ 0,-1,-f], level);

	triangle([ 0, 1, f], [ f, 0, 1], [ 1, f, 0], level);	// горни ъглови 
	triangle([ 0, 1, f], [-1, f, 0], [-f, 0, 1], level);
	triangle([ 0,-1, f], [ 1,-f, 0], [ f, 0, 1], level); 
	triangle([ 0,-1, f], [-f, 0, 1], [-1,-f, 0], level);
	
	triangle([ 0, 1,-f], [ 1, f, 0], [ f, 0,-1], level);	// долни ъглови 
	triangle([ 0, 1,-f], [-f, 0,-1], [-1, f, 0], level);
	triangle([ 0,-1,-f], [ f, 0,-1], [ 1,-f, 0], level); 
	triangle([ 0,-1,-f], [-1,-f, 0], [-f, 0,-1], level);
	
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	this.n = n; // запомняме броя триъгълници
	this.buf = buf;
}

// канонична геодезична сфера - метод за рисуване
CanonicalGeodesicSphere.prototype.draw = function()
{	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,3*FLOATS,0*FLOATS);
	// рисуваме n триъгълника
	gl.drawArrays(gl.TRIANGLES,0,3*this.n);
	// рисуваме n контура на триъгълниците
	//gl.vertexAttrib3fv(aColor,[0,0,0]);
	//for (var i=0; i<this.n; i++)
	//	gl.drawArrays(gl.LINE_LOOP,3*i,3);
}

// геодезична сфера - конструктор
GeodesicSphere = function(center,size)
{
	this.center = center;
	this.size = size;
	this.color = [1,0.75,0];
	this.n = GEODESIC_SIDES;
	this.offset = undefined;
	this.rot = undefined;
	// създаваме еднократно канонична геодезична сфера
	if (!canonicalGeodesicSphere[this.n])
		canonicalGeodesicSphere[this.n] = new CanonicalGeodesicSphere(this.n);
}

// геодезична сфера - рисуване
GeodesicSphere.prototype.draw = function()
{
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.size]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();
	canonicalGeodesicSphere[this.n].draw();
	popMatrix();
}


var ROTATIONAL_SIDES = 32;
var ROTATIONAL_LEVELS = 40;

// ротационен обект - конструктор
RotationalSolid = function(center,size,f)
{	
	// пресмята връх от ъгъл и височина
	function vertex(a,z)
	{
		var r = f(z);
		return [r*Math.cos(a),r*Math.sin(a),z];
	}

	// пресмята нормален вектор във връх с ъгъл a и височина z
	function normal(a,z)
	{
		var p = vertex(a,z);
		var u = vectorPoints(vertex(a+0.0001,z),p);
		var v = vectorPoints(vertex(a+0.0001,z+0.0001),p);
		return unitVector(vectorProduct(u,v));
	}
		
	// попълва в буфера връх и нормалният му вектор
	function dataPush(a,z)
	{	
		var p = vertex(a,z);
		var n = normal(a,z);
		data.push(p[0],p[1],p[2],n[0],n[1],n[2]);
	}
	
	var data = [];
	
	// генериране на хоризонтални ленти
	var dZ = 1/ROTATIONAL_LEVELS;
	for (var zi=0; zi<ROTATIONAL_LEVELS; zi++)
	{
		var a = 0, dA = 2*Math.PI/ROTATIONAL_SIDES;

		var z1 = zi*dZ;
		var z2 = (zi+1)*dZ;
		
		for (var ai=0; ai<=ROTATIONAL_SIDES; ai++)
		{
			dataPush(a,z1);
			dataPush(a,z2);
			a += dA;
		}
	}

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме брой ленти, брой триъгълници, буфера, центъра, размера, цвета
	this.l = ROTATIONAL_LEVELS;
	this.n = ROTATIONAL_SIDES*2+2;
	this.buf = buf;
	this.center = center;
	this.size = size;
	this.color = [[1,0.5,1],[0.9,0.4,0.8]];
	this.offset = undefined;
	this.rot = undefined;
}

// ротационен обект - метод за рисуване
RotationalSolid.prototype.draw = function()
{	
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale(this.size);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();

	// заради мащаба ползваме матрица за нормалите
	gl.uniform1i(uUseNormalMatrix,true);
	var nmat = calculateNormalMatrix(multiplyMatrix(glvmat,glmat));
	gl.uniformMatrix4fv(uNormalMatrix,false,nmat);

		gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
		// върхове
		gl.enableVertexAttribArray(aXYZ);
		gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
		// нормали
		gl.enableVertexAttribArray(aNormal);
		gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
		// рисуваме лентите с редуване на цветовете
		for (var i=0; i<this.l; i++)
		{
			gl.vertexAttrib3fv(aColor,this.color[i%2]);
			gl.drawArrays(gl.TRIANGLE_STRIP,this.n*i,this.n);
		}
		
	gl.uniform1i(uUseNormalMatrix,false);

	popMatrix();
}


var TORUS_MAJOR_SIDES = 50;
var TORUS_MINOR_SIDES = 25;

// тор - конструктор
Torus = function(center,size,R,r)
{	
	// пресмята връх от два ъгъла
	function vertex(a,b)
	{
		var x = (R+r*Math.cos(b))*Math.cos(a);
		var y = (R+r*Math.cos(b))*Math.sin(a);
		var z = r*Math.sin(b);
		return [x,y,z];
	}

	// пресмята нормален вектор във връх с ъгъл a и височина z
	function normal(a,b)
	{
		var u = [-Math.cos(a)*Math.sin(b),-Math.sin(b)*Math.sin(a),Math.cos(b)];
		var v = [-Math.sin(a),Math.cos(a),0];
		return unitVector(vectorProduct(v,u));
	}
		
	// попълва в буфера връх и нормалният му вектор
	function dataPush(a,b,ai,bi)
	{	
		var p = vertex(a,b);
		var n = normal(a,b);
		data.push(p[0],p[1],p[2],n[0],n[1],n[2],ai,bi);
	}
	
	var data = [];
	
	var dA = 2*Math.PI/TORUS_MAJOR_SIDES;
	var dB = 2*Math.PI/TORUS_MINOR_SIDES;

	// генериране на ленти (по b)
	for (var bi=0; bi<TORUS_MINOR_SIDES; bi++)
	{
		var b1 = bi*dB;
		var b2 = (bi+1)*dB;
		
		// генериране на лента (по a)
		for (var ai=0; ai<=TORUS_MAJOR_SIDES; ai++)
		{
			var a = ai*dA;
			dataPush(a,b1,ai/TORUS_MAJOR_SIDES,bi/TORUS_MINOR_SIDES);
			dataPush(a,b2,ai/TORUS_MAJOR_SIDES,(bi+1)/TORUS_MINOR_SIDES);
		}
	}

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// запомняме брой ленти, брой триъгълници, буфера, центъра, размера, цвета
	this.l = TORUS_MINOR_SIDES;
	this.n = TORUS_MAJOR_SIDES*2+2;
	this.buf = buf;
	this.center = center;
	this.size = size;
	this.color = [0.5,0.75,1];
	this.offset = undefined;
	this.rot = undefined;
	this.texture = undefined; // неизвестна текстура
	this.texMatrix = new Float32Array([1,0,0,0,1,0,0,0,1]); // текстурна матрица
}

// тор - метод за рисуване
Torus.prototype.draw = function()
{	
	pushMatrix();
	gl.vertexAttrib3fv(aColor,this.color);
	translate(this.center);
	if (this.rot)
	{
		if (this.rot[0]) zRotate(this.rot[0]);	// хоризонтален ъгъл
		if (this.rot[1]) yRotate(this.rot[1]);	// вертикален ъгъл
		if (this.rot[2]) xRotate(this.rot[2]);	// вертикален ъгъл
		if (this.rot[3]) zRotate(this.rot[3]);	// осев ъгъл
	}
	scale([this.size,this.size,this.size]);
	if (this.offset) translate(this.offset); // и отместването
	useMatrix();

	gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
	// върхове
	gl.enableVertexAttribArray(aXYZ);
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,8*FLOATS,0*FLOATS);
	// нормали
	gl.enableVertexAttribArray(aNormal);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,8*FLOATS,3*FLOATS);
	// казваме къде са текстурите
	if (gl.isTexture(this.texture))
	{
		gl.bindTexture(gl.TEXTURE_2D,this.texture);
		gl.enableVertexAttribArray(aST);
		gl.vertexAttribPointer(aST,2,gl.FLOAT,false,8*FLOATS,6*FLOATS);
	}
	else
	{
		gl.disableVertexAttribArray(aST);
	}
	gl.uniformMatrix3fv(uTexMatrix,false,this.texMatrix);
	// рисуваме лентите
	for (var i=0; i<this.l; i++)
	{
		gl.drawArrays(gl.TRIANGLE_STRIP,this.n*i,this.n);
	}

	popMatrix();
}