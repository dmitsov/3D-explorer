package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

//какви искам да са ми пътищата
// Един главен път за приложението
// Засега тествам само един път и то за експлолера
// Първо трябва да направя да се зарежда дефаултната страница
//

//дефаултна страница
func DefaulPathHandler(w http.ResponseWriter, r *http.Request) {
	fileHandler := http.FileServer(http.Dir("./front-end/"))
	fmt.Println("Home page")
	homePageRequest, err := http.NewRequest("GET", "explorer.html", nil)
	if err != nil {
		fmt.Fprintf(w, "Error finding file")
		return
	}

	fileHandler.ServeHTTP(w, homePageRequest)

}

func DataHandler(w http.ResponseWriter, r *http.Request) {
	fileHandle := http.FileServer(http.Dir("./front-end/"))

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
		jsonResponse, err = ReadObjFile(filePath, "MA41/noodas.png")
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
