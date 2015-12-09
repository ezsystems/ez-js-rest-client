#! /bin/sh

JS_REST_CLIENT_DIR="javascript-rest-client"
TRIGGER_COMMIT_MSG=`git log --oneline -1`
# TODO replace to ezsystems/ezsystems.github.com
DOC_REPOSITORY="dpobel/test-doc"
# TODO replace to master
DOC_BRANCH=gh-pages

grunt doc
git clone https://${GH_TOKEN}@github.com/${DOC_REPOSITORY}.git ../ezsystems.github.com

cd ../ezsystems.github.com

git config user.name "eZ Robot, I do what I'm told to..."
# TODO replace with ezrobot's email
git config user.email "dp@ez.no"

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
