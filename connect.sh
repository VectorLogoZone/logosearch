#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

# 
# check for env settings
#
ENV_FILE=".env"
if [ -f "${ENV_FILE}" ]; then
    echo "INFO: loading '${ENV_FILE}'"
    export $(cat ${ENV_FILE})
fi


ssh root@${ORIGIN_IP}
