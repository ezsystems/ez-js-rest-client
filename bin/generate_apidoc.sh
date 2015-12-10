#! /bin/sh
# Script to generate the client API doc and to push the generated
# to a repository in a given branch.
# This script expects the $GH_TOKEN variable to be set to a valid
# Github user token who is allowed to push on the target repository

JS_REST_CLIENT_DIR="javascript-rest-client"
TRIGGER_COMMIT_MSG=`git log --oneline -1`
# TODO change to ezsystems/ezsystems.github.com
DOC_REPOSITORY="dpobel/test-doc"
# TODO change to master
DOC_BRANCH=gh-pages
GITHUB_USER="eZ Robot, I do what I'm told to..."
# TODO change to ezrobot's email
GITHUB_USER_EMAIL="dp@ez.no"

grunt doc
git clone https://${GH_TOKEN}@github.com/${DOC_REPOSITORY}.git ../ezsystems.github.com

cd ../ezsystems.github.com

git config user.name "$GITHUB_USER"
git config user.email "$GITHUB_USER_EMAIL"

git checkout "$DOC_BRANCH"
rsync -av --checksum $TRAVIS_BUILD_DIR/api/ "$JS_REST_CLIENT_DIR/"

STATUS=`git status --porcelain`

if [ ! -z "$STATUS" ] ; then
    git add "$JS_REST_CLIENT_DIR"
    git commit -m "Updated JavaScript REST Client API doc\n\nAfter:\n$TRIGGER_COMMIT_MSG"
    git pull --rebase
    git push origin $DOC_BRANCH
else
    echo "No change in the doc"
fi
