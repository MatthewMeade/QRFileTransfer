#!/bin/bash
REACT_APP_BUILD_VERSION=`git rev-parse --short HEAD` REACT_APP_BUILD_DATE=`date` yarn start