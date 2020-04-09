#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

#
# load an .env file if it exists
#
ENV_FILE="./.env"
if [ -f "${ENV_FILE}" ]; then
    echo "INFO: loading '${ENV_FILE}'!"
    export $(cat "${ENV_FILE}")
fi

#
# load a few so there is some data
#
./bin/loadrepo.py adamfairhead brandicons bestofjs vlz-ar21 svgporn

#
# run in watch mode
npx nodemon dist/server.js


