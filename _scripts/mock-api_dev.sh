#!/usr/bin/env bash

set -e

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd $BASE_DIR

if [[ -z "${RUN_WITH}" ]]; then
    if [[ "$(node --version)" ]]; then
        RUN="node"
    elif [[ "$(docker info)" ]]; then
        RUN="docker"
    else
        echo "node or docker must be installed"
        exit 1
    fi
elif [[ $RUN_WITH == "node" ]]; then
    if [[ ! "$(node --version)" ]]; then
        echo "node must be installed"
        exit 1
    fi
    RUN="node"
elif [[ $RUN_WITH == "docker" ]]; then
    if [[ ! "$(docker info)" ]]; then
        echo "docker must be installed"
        exit 1
    fi
    RUN="docker"
else
    echo "invalid RUN_WITH value. must be either 'node' or 'docker'"
    exit 1
fi

echo "Running with $RUN"

if [[ $RUN == "node" ]]; then
    cd mock-api
    npm install
    npm run lint
    node server.js
elif [[ $RUN == "docker" ]]; then
    IMAGE_TAG="mv4-api/mock-server:1.0"
    CONTAINER_NAME="mv4-api"

    docker build -f Dockerfile.mock -t $IMAGE_TAG .
    IMAGE_ID="$(docker images -q ${IMAGE_TAG})"

    docker run --rm -p 8080:8080 --name $CONTAINER_NAME $IMAGE_ID
fi