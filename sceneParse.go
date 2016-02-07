package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
)

type Vector3 [3]float64
type Vector2 [2]float64

type MeshPoint [3]int64

type Polygon [3]MeshPoint

type Material struct {
	AmbientColor  Vector3 `json:"aColor"`
	DiffuseColor  Vector3 `json:"dColor"`
	SpecularColor Vector3 `json:"sColor"`
	SpecularScale float64 `json:"shinines"`
	ImgSrc        string  `json:"imgSrc"`
}

type Mesh map[string][]Polygon

type Camera struct {
	Pos    Vector3 `json:"pos"`
	LookAt Vector3 `json:"lookAt"`
	Up     Vector3 `json:"up"`
	Aspect float64 `json:"aspect"`
	Fov    float64 `json:"fov"`
	Near   float64 `json:"near"`
	Far    float64 `json:"far"`
}

type JsonModel struct {
	Vertecies []Vector3 `json:"vs"`
	TexCoords []Vector2 `json:"texCoords"`
	Normals   []Vector3 `json:"normals"`
	ModelMesh Mesh      `json:"meshes"`
	Texture   Material  `json:"texture"`
}

type GameObj struct {
	Type               string     `json:"type"`
	ModelFileName      string     `json:"modelFile"`
	VertexShader       string     `json:"vShader"`
	FragShader         string     `json:"fShader"`
	MaterialName       string     `json:"mat"`
	AdditionalTextures []string   `json:"textures"`
	Center             Vector3    `json:"center"`
	Scale              Vector3    `json:"scale"`
	Rotation           [4]float64 `json:"rot"`
}

type Scene struct {
	Objects   map[string]GameObj  `json:"objects"`
	Materials map[string]Material `json:"materials"`
	Cam       Camera              `json:"camera"`
}

func removeEmptyStrings(str []string) []string {
	var fullStr []string = make([]string, 0)
	for _, v := range str {
		if len(v) > 0 {
			fullStr = append(fullStr, v)
		}
	}

	return fullStr
}

func parseStringArray(arr string) []string {
	str := make([]string, 0)
	arr = strings.Trim(arr, "[]")
	values := strings.Split(arr, ",")
	for _, v := range values {
		v = strings.Trim(v, "\t\r ")
		str = append(str, v)
	}

	return str
}

type SimpleModel struct {
	Vertecies []Vector3 `json:"vs"`
	Mesh      []Polygon `json:"mesh"`
	Mat       Material  `json:"material"`
}

func parseVertecies(objFile []byte) ([]Vector3, error) {
	var vectors []Vector3 = make([]Vector3, 0)
	vertexRegEx, errV := regexp.Compile(`v\x20+-?[\d]+(\x2E[\d]+)?\x20+-?[\d]+(\x2E[\d]+)?\x20+-?[\d]+(\x2E[\d]+)?(\x20+.*|\x20*)`)
	if errV != nil {
		fmt.Println("Error in compiling regex ", errV)
		return nil, errV
	}

	vectorFiller := func(values []string) {
		var x, y, z float64
		x, _ = strconv.ParseFloat(strings.Trim(values[0], "\t\r"), 64)
		y, _ = strconv.ParseFloat(strings.Trim(values[1], "\t\r"), 64)
		z, _ = strconv.ParseFloat(strings.Trim(values[2], "\t\r"), 64)
		v := Vector3{x, y, z}
		vectors = append(vectors, v)
	}

	vertexLines := vertexRegEx.FindAllString(string(objFile), -1)
	fmt.Println("Number of vertecies ", len(vertexLines))
	for _, line := range vertexLines {
		vals := strings.Split(line, " ")[1:]
		vectorFiller(removeEmptyStrings(vals))
	}

	return vectors, nil
}

func parseTexCoords(objFile []byte) ([]Vector2, error) {
	var textureCoords []Vector2 = make([]Vector2, 0)

	texRegEx, errT := regexp.Compile(`vt\x20+-?[\d]+(\x2E[\d]+)?\x20+-?[\d]+(\x2E[\d]+)?\x20+.*\n`)
	if errT != nil {
		fmt.Println("Error in compiling regex ", errT)
		return nil, errT
	}

	texFiller := func(values []string) {
		var s, t float64
		s, _ = strconv.ParseFloat(strings.Trim(values[0], "\t\r"), 64)
		t, _ = strconv.ParseFloat(strings.Trim(values[1], "\t\r"), 64)
		v := Vector2{s, t}
		textureCoords = append(textureCoords, v)
	}

	texLines := texRegEx.FindAllString(string(objFile), -1)
	for _, line := range texLines {
		vals := strings.Split(line, " ")[1:]
		texFiller(removeEmptyStrings(vals))
	}

	return textureCoords, nil
}

func parseNormals(objFile []byte) ([]Vector3, error) {
	var normals []Vector3 = make([]Vector3, 0)

	normalRegEx, errN := regexp.Compile(`vn\x20+-?[\d]+(\x2E[\d]+)?\x20+-?[\d]+(\x2E[\d]+)?\x20+-?[\d]+(\x2E[\d]+)?(\x20+.*|\x20*)`)
	if errN != nil {
		fmt.Println("Error in compiling regex ", errN)
		return nil, errN
	}

	normalFiller := func(values []string) {
		var x, y, z float64
		x, _ = strconv.ParseFloat(strings.Trim(values[0], "\t\r"), 64)
		y, _ = strconv.ParseFloat(strings.Trim(values[1], "\t\r"), 64)
		z, _ = strconv.ParseFloat(strings.Trim(values[2], "\t\r"), 64)
		v := Vector3{x, y, z}
		normals = append(normals, v)
	}

	normalLines := normalRegEx.FindAllString(string(objFile), -1)

	fmt.Println("Found normals ", len(normalLines))

	for _, line := range normalLines {
		vals := strings.Split(line, " ")[1:]
		normalFiller(removeEmptyStrings(vals))
	}

	return normals, nil
}

func parseSimpleFaces(objFile []byte) ([]Polygon, error) {
	var mesh []Polygon = make([]Polygon, 0)

	faceRegex, err := regexp.Compile(`f\x20+[1-9][\d]*\x20+[1-9][\d]*\x20+[1-9][\d]*.*\n`)
	if err != nil {
		fmt.Println("Regex compile error in SimpleFaces ", err)
		return nil, err
	}

	faceFiller := func(values []string, m *[]Polygon) {
		var poly Polygon

		vals := make([]string, 0)
		for i, _ := range values {
			values[i] = strings.Trim(values[i], "\t\n\r")
			if len(values[i]) > 0 {
				vals = append(vals, values[i])
			}
		}

		values = vals

		for i := 0; i < 3; i++ {
			var v int64
			v, _ = strconv.ParseInt(values[i], 10, 64)
			var point MeshPoint = MeshPoint{v - 1}
			poly[i] = point
		}

		(*m) = append(*m, poly)

		if len(values) == 4 {
			var v int64
			v, _ = strconv.ParseInt(values[0], 10, 64)
			var point MeshPoint = MeshPoint{v - 1}
			poly[0] = point

			for i := 2; i < 4; i++ {
				v, _ = strconv.ParseInt(values[0], 10, 64)
				point = MeshPoint{v - 1}
				poly[i-1] = point
			}
			*m = append(*m, poly)
		}
	}

	faceLines := faceRegex.FindAllString(string(objFile), -1)

	for _, line := range faceLines {
		line = strings.Trim(line, "\t\r\n")
		values := strings.Split(line, " ")[1:]
		faceFiller(values, &mesh)
	}

	return mesh, nil
}

func parseFaces(objFile []byte) (Mesh, error) {
	var mesh Mesh = make(Mesh)

	faceRegex, errF := regexp.Compile(`s\x20+([1-9][\d]*|off).*\n(f\x20+[1-9][0-9]*/[1-9][\d]*/[1-9][\d]*\x20+[1-9][\d]*/[1-9][\d]*/[1-9][\d]*\x20+[1-9][\d]*/[1-9][\d]*/[1-9][\d]*(.*|\x20+[1-9][\d]*/[1-9][\d]*/[1-9][\d]*.*)\n)+`)
	if errF != nil {
		fmt.Println("Error in compiling  regex faces", errF)
		return nil, errF
	}

	//helper function for filling smooth group with triangles
	faceFiller := func(values []string, m *Mesh, k string) {

		var poly Polygon
		//	fmt.Println(values)
		vals := make([]string, 0)
		for i, _ := range values {
			values[i] = strings.Trim(values[i], "\t\n\r")
			if len(values[i]) > 0 {
				vals = append(vals, values[i])
			}
		}

		values = vals
		for i := 0; i < 3; i++ {
			indecies := strings.Split(values[i], "/")
			var v, vt, vn int64
			v, _ = strconv.ParseInt(indecies[0], 10, 64)
			vt, _ = strconv.ParseInt(indecies[1], 10, 64)
			vn, _ = strconv.ParseInt(indecies[2], 10, 64)

			var point MeshPoint = MeshPoint{v - 1, vt - 1, vn - 1}
			poly[i] = point
		}

		(*m)[k] = append((*m)[k], poly)
		poly = Polygon{}
		//	fmt.Println("Reading faces")
		//	fmt.Println(len(values))
		if len(values) == 4 {
			//		fmt.Println("Reading 4th point")

			indecies := strings.Split(values[0], "/")
			var v, vt, vn int64
			v, _ = strconv.ParseInt(indecies[0], 10, 64)
			vt, _ = strconv.ParseInt(indecies[1], 10, 64)
			vn, _ = strconv.ParseInt(indecies[2], 10, 64)

			var point MeshPoint = MeshPoint{v - 1, vt - 1, vn - 1}
			poly[0] = point

			for i := 2; i < 4; i++ {
				//		fmt.Printf("Value: '%s'\n", values[i])
				indecies = strings.Split(values[i], "/")
				v, _ = strconv.ParseInt(indecies[0], 10, 64)
				vt, _ = strconv.ParseInt(indecies[1], 10, 64)
				vn, _ = strconv.ParseInt(indecies[2], 10, 64)

				point = MeshPoint{v - 1, vt - 1, vn - 1}
				poly[i-1] = point
			}

			(*m)[k] = append((*m)[k], poly)
		}

	}

	smoothGroups := faceRegex.FindAllString(string(objFile), -1)
	fmt.Println("Groups num: ", len(smoothGroups))

	helperFunc := func(str []string) string {
		for _, v := range str {
			if len(v) > 0 {
				return v
			}
		}
		return ""
	}

	for _, s := range smoothGroups {
		lines := strings.Split(s, "\n")
		gr := helperFunc(strings.Split(lines[0], " ")[1:])
		gr = strings.Trim(gr, "\t")
		if _, exists := mesh[gr]; !exists {
			mesh[gr] = make([]Polygon, 0)
		}

		for _, line := range lines[1:] {
			if len(line) > 0 {
				line = strings.Trim(line, " \t")
				values := strings.Split(line, " ")
				faceFiller(values[1:], &mesh, gr)
			}
		}
	}

	fmt.Println("Group size: ", len(mesh))
	return mesh, nil
}

func parseVector3(strV string) Vector3 {
	//format (x,y,z)
	strV = strings.Trim(strV, "()")
	coords := strings.Split(strV, ",")
	x, _ := strconv.ParseFloat(coords[0], 64)
	y, _ := strconv.ParseFloat(coords[1], 64)
	z, _ := strconv.ParseFloat(coords[2], 64)

	return Vector3{x, y, z}
}

func parseCamera(fileContents []byte) (Camera, error) {
	cameraRegex, err := regexp.Compile(`Camera(\x20|\x09)+{.+}.*\n`)
	if err != nil {
		fmt.Println("Error in reading camera regex ", err)
		return Camera{}, err
	}

	cameraString := cameraRegex.FindString(string(fileContents))
	var cam Camera

	if len(cameraString) > 0 {

		lines := strings.Split(cameraString, "\n")[1:]
		for i := 0; i < len(lines)-1 && err != nil; i++ {

			l := strings.Split(lines[i], " ")
			l[0] = strings.Trim(l[0], "\t\r")
			l[1] = strings.Trim(l[1], "\t\r")
			switch l[0] {
			case "pos":
				cam.Pos = parseVector3(l[1])
			case "lookAt":
				cam.LookAt = parseVector3(l[1])
			case "up":
				cam.Up = parseVector3(l[1])
			case "aspect":
				cam.Aspect, err = strconv.ParseFloat(l[1], 64)
			case "fov":
				cam.Fov, err = strconv.ParseFloat(l[1], 64)
			case "near":
				cam.Near, err = strconv.ParseFloat(l[1], 64)
			case "far":
				cam.Aspect, err = strconv.ParseFloat(l[1], 64)
			}
		}
	}

	return cam, err
}

func ParseSceneFile(filename string) (Scene, error) {
	var sc Scene

	sceneFile, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error in opening scene file: ", err)
		return Scene{}, err
	}

	fileInfo, _ := sceneFile.Stat()
	sceneData := make([]byte, fileInfo.Size())
	n, err := sceneFile.Read(sceneData)
	if err != nil {
		fmt.Println("Error in reading scene file ", err)
		return Scene{}, err
	}

	sceneData = sceneData[:n]

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		sc.Objects, err = parseGameObjects(sceneData)
		wg.Done()
	}()

	wg.Add(1)
	go func() {
		sc.Materials, err = parseMaterials(sceneData)
		wg.Done()
	}()

	wg.Add(1)
	go func() {
		sc.Cam, err = parseCamera(sceneData)
		wg.Done()
	}()

	wg.Wait()
	if err != nil {
		fmt.Println("Error: ", err)
		return Scene{}, err
	}

	return sc, nil
}

func ReadObjSimpleFile(filename string) ([]byte, error) {
	var vertecies []Vector3
	var mesh []Polygon
	fileInfo, errI := os.Stat("./front-end/" + filename)
	if errI != nil {
		fmt.Println("Error in finding file info ", errI)
		return nil, errI
	}

	objFile, errO := os.Open("./front-end/" + filename)
	if errO != nil {
		fmt.Println("Error in opening file ", errO)
		return nil, errO
	}
	defer objFile.Close()

	var fileContents []byte = make([]byte, fileInfo.Size())

	if _, errR := objFile.Read(fileContents); errR != nil {
		fmt.Println("Error in reading file contents ", errR)
		return nil, errR
	}

	var wg sync.WaitGroup
	var err error
	wg.Add(1)

	go func() {
		defer wg.Done()
		var e error
		vertecies, e = parseVertecies(fileContents)
		if err == nil {
			err = e
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		var e error
		mesh, e = parseSimpleFaces(fileContents)
		if err == nil {
			err = e
		}
	}()

	wg.Wait()

	var mat Material = Material{
		Vector3{1, 1, 1},
		Vector3{0.5, 0.2, 0.3},
		Vector3{1, 1, 1},
		20,
		"",
	}

	if err != nil {
		return nil, err
	}

	model := SimpleModel{vertecies, mesh, mat}
	jsonMessage, errJ := json.Marshal(&model)

	return jsonMessage, errJ
}

func ReadObjFile(filename string, texture string) ([]byte, error) {

	var vertecies []Vector3
	var texCoords []Vector2
	var normals []Vector3
	var mesh Mesh

	fileInfo, errI := os.Stat("./front-end/" + filename)
	if errI != nil {
		fmt.Println("Error in finding file info ", errI)
		return nil, errI
	}

	objFile, err := os.Open("./front-end/" + filename)
	if err != nil {
		fmt.Println("Error in opening file ", err)
		return nil, err
	}
	defer objFile.Close()

	var fileContents []byte = make([]byte, fileInfo.Size())
	reader := bufio.NewReader(objFile)

	if _, errR := reader.Read(fileContents); errR != nil {
		fmt.Println("Error in reading file contents ", errR)
		return nil, errR
	}

	var wg sync.WaitGroup

	err = nil
	wg.Add(1)
	go func() {

		defer wg.Done()
		var e error
		vertecies, e = parseVertecies(fileContents)
		if err == nil {
			err = e
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		var e error
		texCoords, e = parseTexCoords(fileContents)
		if err == nil {
			err = e
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		var e error
		normals, e = parseNormals(fileContents)
		if err == nil {
			err = e
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		var e error

		mesh, e = parseFaces(fileContents)
		if err == nil {
			err = e
		}
	}()

	wg.Wait()

	if err != nil {
		return nil, err
	}

	text := Material{
		Vector3{0.8, 0.8, 0.8},
		Vector3{1, 1, 1},
		Vector3{1, 1, 1},
		20,
		"MA41/noodas.png",
	}

	type JsonModel struct {
		Vertecies []Vector3 `json:"vs"`
		TexCoords []Vector2 `json:"texCoords"`
		Normals   []Vector3 `json:"normals"`
		ModelMesh Mesh      `json:"meshes"`
		Texture   Material  `json:"texture"`
	}

	model := &JsonModel{vertecies, texCoords, normals, mesh, text}
	var modelMsg []byte

	if modelMsg, err = json.Marshal(model); err != nil {
		fmt.Println("Error in encoding json ", err)
		return nil, err
	}
	//	fmt.Println(string(modelMsg))
	return modelMsg, nil
}

func getShaders(configFilename string) (map[string]string, error) {
	var shaders map[string]string = make(map[string]string)
	configFile, err := os.Open("./front-end/" + configFilename)
	defer configFile.Close()
	if err != nil {
		fmt.Println("Error: ", err)
		return nil, err
	}

	fileInfo, _ := configFile.Stat()
	var configInfo []byte = make([]byte, fileInfo.Size())
	configReader := bufio.NewReader(configFile)
	n, err := configReader.Read(configInfo)
	if err != nil {
		fmt.Println("Error in reading config file: ", err)
		return nil, err
	}

	configInfo = configInfo[:n]
	shaderFiles := strings.Split(string(configInfo), "\n")
	var shaderFile *os.File
	for _, lane := range shaderFiles {
		l := strings.Split(lane, ":")
		l[0] = strings.Trim(l[0], "\t\r ")
		l[1] = strings.Trim(l[1], "\t\r ")
		shaderFile, err = os.Open("./front-end/shaders/" + l[1])
		defer shaderFile.Close()
		if err != nil {
			fmt.Println("Error in opening fragment shader file: ", err)
			return nil, err
		}

		shaderInfo, err := shaderFile.Stat()
		if err != nil {
			fmt.Println("Error in reading shader file stat: ", err)
			return nil, err
		}
		shaderData := make([]byte, shaderInfo.Size())
		n, err = shaderFile.Read(shaderData)
		if err != nil {
			fmt.Println("Error: shader file not read: ", err)
			return nil, err
		}

		shaderData = shaderData[:n]
		shaders[l[0]] = string(shaderData)
	}

	return shaders, nil
}

func parseNumArray(arr string) []float64 {
	data := make([]float64, 0)
	arr = strings.Trim(arr, "[]")
	nums := strings.Split(arr, ",")
	for _, v := range nums {
		n, _ := strconv.ParseFloat(v, 64)
		data = append(data, n)
	}

	return data
}

func parseGameObjects(sceneFile []byte) (map[string]GameObj, error) {
	var gameObjectsMap map[string]GameObj
	gameObjRegex, err := regexp.Compile(`GameObj(\x20|\t)+[a-zA-Z]+(\x20|\t)*{\n.*\n}`)
	if err != nil {
		fmt.Println("Error in compiling game object regular expression: ", err)
		return nil, err
	}

	gameObjectStrings := gameObjRegex.FindAllString(string(sceneFile), -1)

	for _, g := range gameObjectStrings {
		lines := strings.Split(g, "\n")
		lines[0] = strings.Trim(lines[0], "{")
		gameObjName := strings.Split(lines[0], " ")[1]
		lines = lines[1 : len(lines)-1]
		gObj := GameObj{}
		for _, l := range lines {
			l = strings.Trim(l, "\t")
			values := strings.Split(l, ":")
			values[0] = strings.Trim(values[0], "\t\r ")
			values[1] = strings.Trim(values[1], "\t\r ")
			switch values[0] {
			case "center":
				gObj.Center = parseVector3(values[1])
			case "scale":
				gObj.Scale = parseVector3(values[1])
			case "rot":
				rotation := parseNumArray(values[1])[:4]
				gObj.Rotation = [4]float64{rotation[0], rotation[1], rotation[2], rotation[3]}
			case "type":
				gObj.Type = values[1]
			case "modelFile":
				gObj.ModelFileName = values[1]
			case "vShader":
				gObj.VertexShader = values[1]
			case "fShader":
				gObj.FragShader = values[1]
			case "material":
				gObj.MaterialName = values[1]
			case "textures":
				gObj.AdditionalTextures = parseStringArray(values[1])
			}
		}
		if gObj.Type == "mesh" && len(gObj.ModelFileName) > 0 {
			fmt.Println("Required mesh file")
		}

		gameObjectsMap[gameObjName] = gObj
	}

	return gameObjectsMap, nil
}

func parseMaterials(sceneFile []byte) (map[string]Material, error) {
	var materialMap map[string]Material = make(map[string]Material)
	materialRegex, err := regexp.Compile(`Material(\x20|\t)+[a-zA-Z]+(\x20|\t)*{\n.*\n}`)
	if err != nil {
		fmt.Println("Error in compiling game object regular expression: ", err)
		return nil, err
	}

	materialStrings := materialRegex.FindAllString(string(sceneFile), -1)

	for _, g := range materialStrings {
		lines := strings.Split(g, "\n")
		lines[0] = strings.Trim(lines[0], "{")
		materialName := strings.Split(lines[0], " ")[1]
		lines = lines[1 : len(lines)-1]
		mat := Material{}
		for _, l := range lines {
			l = strings.Trim(l, "\t")
			values := strings.Split(l, ":")
			values[0] = strings.Trim(values[0], "\t\r ")
			values[1] = strings.Trim(values[1], "\t\r ")
			switch values[0] {
			case "ambientColor":
				mat.AmbientColor = parseVector3(values[1])
			case "diffuseColor":
				mat.DiffuseColor = parseVector3(values[1])
			case "specularColor":
				mat.SpecularColor = parseVector3(values[1])
			case "shinines":
				mat.SpecularScale, err = strconv.ParseFloat(values[1], 64)
			case "imgSrc":
				mat.ImgSrc = values[1]
			}
		}
		if err != nil {
			fmt.Println("Error: ", err)
			return nil, err
		}

		materialMap[materialName] = mat
	}

	return materialMap, nil
}
