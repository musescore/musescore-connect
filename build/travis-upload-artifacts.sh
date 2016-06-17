#!/bin/bash

if [ -n "$TRAVIS_TAG" ]; then
    export ARTIFACTS_TARGET_PATHS=/
else
    export ARTIFACTS_TARGET_PATHS=beta
fi

export TRAVIS_BUILD_DIR=
export ARTIFACTS_PATHS=dist/
export ARTIFACTS_PERMISSIONS=public-read
export ARTIFACTS_CACHE_CONTROL='public, max-age=315360000'


artifacts upload
