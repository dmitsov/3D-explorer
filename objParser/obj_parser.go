package objParser

import(
	"os"
)

type Vector3 [3]float64
type Vector2 [2]float64

type MeshPoint [3]int64

type Polygon [3]MeshPoint
type Mesh []MeshPoint


func ReadObjFile(filename string) []byte {
//	var vectors []Vector3 = make([]Vector3,0)
	
	os.OpenFile(".\\front-end\\"+filename,"r")
	defer os.Close()
	
	
	return []byte{}
}