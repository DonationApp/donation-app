#/bin/bash

set -e

# only run on Travis
if [ -n "$TRAVIS_BUILD_ID" ]; then
  echo TRAVIS_BRANCH=$TRAVIS_BRANCH
  echo DEPLOY_BRANCH=$DEPLOY_BRANCH

  # only run on the $DEPLOY_BRANCH branch
  if [ "$TRAVIS_BRANCH" == "$DEPLOY_BRANCH" ]; then
    # don't run on pull requests
    if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
      npm run deploy
    else
      echo "Skipping deploy. Travis should not deploy from pull requests"
      exit 0
    fi
  else
    echo "Skipping deploy. Travis should only deploy from the DEPLOY_BRANCH ($DEPLOY_BRANCH) branch"
    exit 0
  fi
else
  echo "ERROR: Deploy script should only be run by Travis"
  exit 1
fi
