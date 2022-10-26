package main

import (
	"flag"
	"log"
	"net/http"
)

func main() {
	serveDirPath := flag.String("d", "./site", "Full or relative path of directory to serve")
	flag.Parse()

	http.Handle("/", http.FileServer(http.Dir(*serveDirPath)))
	port := ":9090"
	log.Fatal(http.ListenAndServe(port, nil))
}
