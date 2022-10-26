package main

import (
	"log"
	"net/http"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("./site")))
	port := ":9090"
	log.Fatal(http.ListenAndServe(port, nil))
}
