#!/bin/bash

export ARTIFACTS_TARGET_PATHS=beta

export TRAVIS_BUILD_DIR=dist
export ARTIFACTS_PATHS=index.html
export ARTIFACTS_PERMISSIONS=public-read

artifacts upload
