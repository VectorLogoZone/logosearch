#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

./node_modules/.bin/tsc

export COMMIT=$(git rev-parse --short HEAD)
export LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)
PORT=80 node dist/server.js

