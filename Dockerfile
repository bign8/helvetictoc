FROM golang:1.16-alpine as go
WORKDIR /go/src
ADD static ./static
ADD main.go go.mod ./
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /go/bin/time -v

FROM scratch
COPY --from=go /go/bin/time /time
ENTRYPOINT ["/time"]
