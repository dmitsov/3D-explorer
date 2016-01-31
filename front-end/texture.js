
// функция за създаване на текстурен обект от картинка
// функцията връща обекта веднага, но той става годна
// текстура по-късно, след зареждането на картинката
function loadTexture(url,post)
{
	var texture = gl.createTexture();
	var image = new Image();
	image.onload = function()
	{
		imageLoaded(texture,image);
		if (post) post(texture);
	};
	image.src = url;
	return texture;
}
	
// функция, която се извиква при зареждането на изображение
function imageLoaded(texture,image)
{

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

// установява единична текстурна 3D матрица
function texIdentity()
{
	return new Float32Array([1,0,0,0,1,0,0,0,1]);
}

// транслира текстурна 3D матрица с 2D вектор 
function texTranslate(m,v)
{
	m[6] += m[0]*v[0]+m[3]*v[1];
	m[7] += m[1]*v[0]+m[4]*v[1];
}

// мащабира текстурна 3D матрица с 2D вектор 
function texScale(m,v)
{
	m[0] *= v[0];
	m[1] *= v[0];
	
	m[3] *= v[1];
	m[4] *= v[1];
}

// върти текстурна 3D матрица на ъгъл в градуси 
function texRotate(m,a)
{
	a = radians(a);
	var s = Math.sin(a);
	var c = Math.cos(a);
	
	a = m[0]*s+m[3]*c;
	m[0]=m[0]*c-m[3]*s;
	m[3]=a;
	
	a = m[1]*s+m[4]*c;
	m[1]=m[1]*c-m[4]*s;
	m[4]=a;
}
