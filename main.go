package main

import "net/http"

func main() {
	http.ListenAndServe(":3333", http.FileServer(http.Dir("static")))
}
