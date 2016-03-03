#!/bin/bash

export ARTIFACTS_TARGET_PATHS=beta

export TRAVIS_BUILD_DIR=
export ARTIFACTS_PATHS=dist/
export ARTIFACTS_PERMISSIONS=public-read

artifacts upload
