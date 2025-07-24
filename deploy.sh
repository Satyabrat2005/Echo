#!/bin/bash
set -e

dfx stop 2>/dev/null || true
dfx start --background
dfx deploy

echo "ECHO deployed! Frontend: http://localhost:4943/?canisterId=$(dfx canister id frontend)" 