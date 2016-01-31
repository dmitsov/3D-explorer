var gl;				// глобален WebGL контекст
var glprog;			// глобална GLSL програма
var glmat;			// глобална матрица на модела
var glmatnew;		// true, ако матрицата е променена, но не е подадена на шейдъра
var glvmat;			// глобална матрица на гледната точка
var glstack = [];	// стек от матрици на модела


// брой байтове в един WebGL FLOAT (трябва да са 4 байта)
var FLOATS = Float32Array.BYTES_PER_ELEMENT;


// връща WebGL контекст, свързан с HTML елемент с даден id
function getContext(id)
{
	var canvas = document.getElementById(id);
	if (!canvas)
	{
		alert("Искаме canvas с id=\""+id+"\", а няма!");
		return null;
	}

	var context = canvas.getContext("webgl");
	if (!context)
	{
		context = canvas.getContext("experimental-webgl");
	}
	
	if (!context)
	{
		alert("Искаме WebGL контекст, а няма!");
	}
	
	return context;
}


// връща компилиран шейдър
function getShader(id,type)
{
	var elem = document.getElementById(id);
	var source = elem?elem.text:id;
	var shader = gl.createShader(type);

	gl.shaderSource(shader,source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}


// връща готова програма
function getProgram(idv,idf)
{
	var vShader = getShader(idv,gl.VERTEX_SHADER);
	var fShader = getShader(idf,gl.FRAGMENT_SHADER);
			
	if (!vShader || !fShader) {return null;}
	
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram,vShader);
	gl.attachShader(shaderProgram,fShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS))
	{
		alert(gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	gl.useProgram(shaderProgram);
	return shaderProgram;
}


// намира адресите на всички глобални и атрибутни променливи
function getVariables()
{
	for (var i=0; i<gl.getProgramParameter(glprog,gl.ACTIVE_UNIFORMS); i++)
	{
		var name = gl.getActiveUniform(glprog,i).name;
		window[name] = gl.getUniformLocation(glprog,name);
	}

	for (var i=0; i<gl.getProgramParameter(glprog,gl.ACTIVE_ATTRIBUTES); i++)
	{
		var name = gl.getActiveAttrib(glprog,i).name;
		window[name] = gl.getAttribLocation(glprog,name);
	}
}

// случайно дробно число в интервал
function random(a,b)
{
	return a+(b-a)*Math.random();
}

