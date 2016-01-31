package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//какви искам да са ми пътищата
// Един главен път за приложението
// Засега тествам само един път и то за експлолера
// Първо трябва да направя да се зарежда дефаултната страница
//

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

func removeEmptyStrings(str []string) []string {
	var fullStr []string = make([]string, 0)
	for _, v := range str {
		if len(v) > 0 {
			fullStr = append(fullStr, v)
		}
	}

	return fullStr
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

func ReadObjSimpleFile(filename string) ([]byte, error) {
	var vertecies []Vector3
	var mesh []Polygon
	fileInfo, errI := os.Stat(".\\front-end\\" + filename)
	if errI != nil {
		fmt.Println("Error in finding file info ", errI)
		return nil, errI
	}

	objFile, errO := os.Open(".\\front-end\\" + filename)
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

	type SimpleModel struct {
		Vertecies []Vector3 `json:"vs"`
		Mesh      []Polygon `json:"mesh"`
		Mat       Material  `json:"material"`
	}

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

	fileInfo, errI := os.Stat(".\\front-end\\" + filename)
	if errI != nil {
		fmt.Println("Error in finding file info ", errI)
		return nil, errI
	}

	objFile, err := os.Open(".\\front-end\\" + filename)
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
		"MA41\\noodas.png",
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

//дефаултна страница
func DefaulPathHandler(w http.ResponseWriter, r *http.Request) {
	fileHandler := http.FileServer(http.Dir(".\\front-end"))

	homePageRequest, err := http.NewRequest("GET", "explorer.html", nil)
	if err != nil {
		fmt.Fprintf(w, "Error finding file")
		return
	}

	fileHandler.ServeHTTP(w, homePageRequest)

}

func DataHandler(w http.ResponseWriter, r *http.Request) {
	fileHandle := http.FileServer(http.Dir(".\\front-end"))
	filePath := strings.TrimPrefix(r.URL.Path, "/data/")

	dataRequest, err := http.NewRequest("GET", filePath, nil)
	if err != nil {
		fmt.Println("Couldn't load file")
		fmt.Fprintf(w, "Couldn't load file %s", filePath)
		return
	}

	fileHandle.ServeHTTP(w, dataRequest)
}

func modelHandle(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Wrong method", 405)
		return
	}
	filePath := strings.TrimPrefix(r.URL.Path, "/data/model/")
	var jsonResponse []byte
	var err error

	query := r.URL.Query()
	isSimple, _ := strconv.ParseBool(query["simple"][0])
	if isSimple {
		jsonResponse, err = ReadObjSimpleFile(filePath)
	} else {
		jsonResponse, err = ReadObjFile(filePath, "MA41\\noodas.png")
	}

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	fmt.Fprintf(w, string(jsonResponse))
}

func InitializePaths(mux *http.ServeMux) {
	fmt.Println("Initializing paths...")
	mux.HandleFunc("/", DefaulPathHandler)
	mux.HandleFunc("/data/model/", modelHandle)
	mux.HandleFunc("/data/", DataHandler)
}

func makeServer() (server *http.Server) {
	mux := http.NewServeMux()
	InitializePaths(mux)
	server = &http.Server{Addr: ":8282", Handler: mux, WriteTimeout: 1 * time.Second}
	return
}

func main() {
	server := makeServer()

	log.Fatal(server.ListenAndServe())
	fmt.Println("Stoping server")
}
