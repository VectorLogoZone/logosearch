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
ENV_FILE="${1:-./logosearch.env}"
if [ -f "${ENV_FILE}" ]; then
    echo "INFO: loading '${ENV_FILE}'!"
    export $(cat "${ENV_FILE}")
fi

if [ ! -d "node_modules" ]; then
    echo "INFO: installing node modules!"
    npm install
fi

#
# run in watch mode
#
npx nodemon


