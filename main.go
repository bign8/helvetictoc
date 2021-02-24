package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed static
var site embed.FS

func main() {
	root, err := fs.Sub(site, "static")
	if err != nil {
		log.Fatal(err)
	}
	p := ":" + os.Getenv("PORT")
	if p == ":" {
		log.Fatal("Missing PORT variable")
	}
	log.Printf("Serving on %s", p)
	http.Handle("/", http.FileServer(http.FS(root)))
	if err := http.ListenAndServe(p, nil); err != nil {
		log.Fatal(err)
	}
}
