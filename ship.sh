#! /bin/bash -ex

go build -o time -v -ldflags="-w -s" .
gzip -f time
scp time.gz me.bign8.info:/opt/bign8
ssh me.bign8.info -- sudo systemctl restart time

rm -f time.gz
