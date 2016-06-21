#!/bin/bash

if [ -n "$TRAVIS_TAG" ]; then
    export ARTIFACTS_TARGET_PATHS=/
else
    export ARTIFACTS_TARGET_PATHS=beta
fi

# delete translations.json if it's the same than the one online
wget https://s3.amazonaws.com/connect2.musescore.com/translations.json
diff -q translations.json dist/translations.json > /dev/null
if [ $? == 0 ]
then
  rm dist/translations.json
fi
rm translations.json

export TRAVIS_BUILD_DIR=
export ARTIFACTS_PATHS=dist/
export ARTIFACTS_PERMISSIONS=public-read
export ARTIFACTS_CACHE_CONTROL='public, max-age=315360000'


artifacts upload
