#!/bin/bash
set -e

# Build UI
export NODE_OPTIONS=--openssl-legacy-provider
(cd ./gmg-app && npm i && npm run publish)

# Build Client
(cd ./gmg-client && npm i)

# Build Server
(cd ./gmg-server && npm i)
