#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

#
# load a few so there is some data
#
./bin/loadrepo.py adamfairhead bestofjs vlz-ar21 svgporn

#
# run in watch mode
npx nodemon dist/server.js


