#!/bin/bash
az login -u $USER -p $PASS
rm -rf /root/.azure-devops/python-sdk/cache
node ./scripts.js