package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

func main() {
	serveDirPath := flag.String("d", "./site", "Full or relative path of directory to serve")
	port := flag.Int("p", 9090, "Server port")
	flag.Parse()

	http.Handle("/", http.FileServer(http.Dir(*serveDirPath)))

	fmt.Printf("Listening on http://127.0.0.1:%d\n", *port)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}
