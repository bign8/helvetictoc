time: Dockerfile
	docker build -t bign8/time:latest .
.PHONY: static

run: time
	docker run -it --rm -p 8080:8080 bign8/time:latest
.PHONY: run
