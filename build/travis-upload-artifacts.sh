#!/bin/bash

if [ -n "$TRAVIS_TAG" ]; then
    export ARTIFACTS_TARGET_PATHS=":beta"
else
    export ARTIFACTS_TARGET_PATHS=beta
fi

export TRAVIS_BUILD_DIR=
export ARTIFACTS_PATHS=dist/
export ARTIFACTS_PERMISSIONS=public-read

artifacts upload
