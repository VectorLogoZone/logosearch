#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

docker build -t logosearch .

if [ ! -f ".env" ]
then
    echo "ERROR: no .env file!"
    exit 1
fi
export $(cat .env)

docker run -it \
	--publish 4000:4000 \
	--expose 4000 \
	--env "INDEX_URLS=${INDEX_URLS}" \
	--env "LOG_LEVEL=${LOG_LEVEL}" \
	logosearch

