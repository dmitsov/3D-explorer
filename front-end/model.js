function Material(materialJson){

	this.specularScale = 0;
	
	this.ambientColor = materialJson["aColor"]
	this.diffuseColor= materialJson["dColor"]
	this.specularColor = materialJson["sColor"]	
	this.specularScale = materialJson["shinines"]
	
	this.texture = loadTextureObj("/data/" + materialJson["imgSrc"])
}

Material.prototype.bindMaterial = function(){
	gl.bindTexture(gl.TEXTURE_2D,this.texture)
	gl.uniform3fv(uAmbientColor,this.ambientColor)
	gl.uniform3fv(uDiffuseColor,this.diffuseColor)
	gl.uniform3fv(uSpecularColor,this.specularColor)
	gl.uniform1f(uShinines,this.specularScale)
}

function loadTextureObj(imgSrc,post){
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,texture)
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,0,0,255]));
	
	var img = new Image();
	img.onload = function(){
		imageLoadedObj(texture,img);
		if(post) post(img);
	}
	img.src = imgSrc;
	
	return texture;
}


function imageLoadedObj(texture,image)
{
	function isPowerOf2(value){
		return (value & (value - 1)) == 0;
	}
	
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	if(isPowerOf2(image.width) && isPowerOf2(image.height)){
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR)
	}
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}



function Model(center,jsonObject){
	this.center = center;
	this.scale = [1,1,1]
	this.rot = [0,0,0,0]
	
	var vertecies = [];
	var normals = [];
	var texCoords = [];
	var smoothGroupSizes = [];
	this.texture = new Material(jsonObject["texture"]);
	
	for(var i in jsonObject["vs"]){
		vertecies.push(jsonObject["vs"][i]);
	}
	
	for(var i in jsonObject["normals"]){
		normals.push(jsonObject["normals"][i]);	
	}
	
	for(var i in jsonObject["texCoords"]){
		texCoords.push(jsonObject["texCoords"][i]);
	}
	
	this.meshes = []
	
	
	for(var i in jsonObject["meshes"]){
		var vertexDataMap = []
		var mesh = jsonObject["meshes"][i]
		
		var polygons = jsonObject["meshes"][i]
		
		var vertexIndexMap = {}
		var indexBuffer = []
		var vertexBuffer = []
		var ind = 0
		
		for(var p in polygons){
			var polygonJson = polygons[p];
			var currentIndecies = [];
			for(var j in polygonJson){
				var vertex = vertecies[polygonJson[j][0]];
				var normal = normals[polygonJson[j][2]];
				var tex = texCoords[polygonJson[j][1]];
				
				var key = polygonJson[j][0] + "/" + polygonJson[j][2] + "/" + polygonJson[j][1]
				
				if(!vertexIndexMap[key]){
					vertexIndexMap[key] = ind
					vertexBuffer.push(vertex[0],vertex[1],vertex[2], normal[0],normal[1],normal[2], tex[0], tex[1])
					ind++
				}
				
				currentIndecies.push(vertexIndexMap[key])
			}
		
			indexBuffer.push(currentIndecies[0],currentIndecies[1],currentIndecies[2])
		}
		
		var buffers = [vertexBuffer,indexBuffer]
		this.meshes.push(buffers)
	}
	
	this.vBuff = gl.createBuffer();
	this.iBuff = gl.createBuffer(); 
}
/*
Model.prototype.parseJson(jsonObject){
	this.
	
	
	for(var i in jsonObject["vs"]){
		parseVertex(jsonObject["vs"][i]);
	}
	
	for(var i in jsonObject["normals"]){
		parseNormal(jsonObject["normals"][i]);	
	}
	
	for(var i in jsonObject["texCoord"]){
		parseTexCoord(jsonObject["texCoord"][i]);
	}
	
	
	for(var i in jsonObject["meshes"]){
		this.smoothGroupSizes.push(3*jsonObject["meshes"][i]["polygons"].length);
		this.textures.push(new Material(jsonObject["meshes"][i]["material"]));
		parsePolygons(jsonObject["meshes"][i]["polygons"]);
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32(data),gl.DYNAMIC_DRAW);
}

*/

Model.prototype.draw = function(){
	pushMatrix();
	translate(this.center);
	
	if(this.rot[0]) zRotate(this.rot[0]);
	if(this.rot[1]) yRotate(this.rot[1]);
	if(this.rot[2]) xRotate(this.rot[2]);
	if(this.rot[3]) zRotate(this.rot[3]);
	
	scale(this.scale);
	useMatrix();
	this.texture.bindMaterial()
	gl.uniform1i(uIsTextured,true);
	for(var i = 0; i < this.meshes.length; i++){
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.meshes[i][0]),gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.meshes[i][1]),gl.DYNAMIC_DRAW);
		
		gl.enableVertexAttribArray(aXYZ);
		gl.enableVertexAttribArray(aNormal);
		gl.enableVertexAttribArray(aST);
		
		gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,8*FLOATS,0);
		gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,8*FLOATS,3*FLOATS);
		gl.vertexAttribPointer(aST,2,gl.FLOAT,false,8*FLOATS,6*FLOATS);
		
		gl.drawElements(gl.TRIANGLES,this.meshes[i][1].length,gl.UNSIGNED_SHORT,0);
	}
	
	
	popMatrix();
}

function SimpleModel(center, jsonObject){
	this.center = center;
	this.scale = [1,1,1];
	this.rot = [0,0,0,0]
	
	var vertecies = jsonObject["vs"]
	var polygons = jsonObject["mesh"]
	this.ambientColor = jsonObject["material"]["aColor"]
	this.diffuseColor = jsonObject["material"]["dColor"]
	this.specularColor = jsonObject["material"]["sColor"]
	this.shinines = jsonObject["material"]["shinines"]
	
	var vData = [];
		
	for(var i in polygons){
		var p1 = vertecies[polygons[i][0][0]];
		var p2 = vertecies[polygons[i][1][0]];
		var p3 = vertecies[polygons[i][2][0]];
		
		var normal = vectorProduct(vectorPoints(p1,p2),vectorPoints(p1,p3));
		normal = unitVector(normal);
		
		vData.push(p1[0],p1[1],p1[2],normal[0],normal[1],normal[2],
				   p2[0],p2[1],p2[2],normal[0],normal[1],normal[2],
				   p3[0],p3[1],p3[2],normal[0],normal[1],normal[2]);
	}
	
	this.n = vData.length/6;
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vData),gl.STATIC_DRAW);
	
}

SimpleModel.prototype.draw = function(){
	pushMatrix();
	translate(this.center);
	
	if(this.rot[0]) zRotate(this.rot[0]);
	if(this.rot[1]) yRotate(this.rot[1]);
	if(this.rot[2]) xRotate(this.rot[2]);
	if(this.rot[3]) zRotate(this.rot[3]);
	
	scale(this.scale);
	
	
	gl.uniform3fv(uAmbientColor,this.ambientColor);
	gl.uniform3fv(uDiffuseColor,this.diffuseColor);
	gl.uniform3fv(uSpecularColor,this.specularColor);
	gl.uniform1f(uShinines,this.shinines);
	gl.uniform1i(uIsTextured,false);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
		
	gl.enableVertexAttribArray(aXYZ);
	gl.enableVertexAttribArray(aNormal);
		
	gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0);
	gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);
	
	useMatrix();
	gl.drawArrays(gl.TRIANGLES,0,this.n);
	
	gl.uniform1i(uIsTextured,true);
	
	gl.disableVertexAttribArray(aXYZ);
	gl.disableVertexAttribArray(aNormal);
	popMatrix();
	
}
