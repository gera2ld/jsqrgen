set -e
DEMO_DIR=dist
npm run lint
rm -rf $DEMO_DIR
npm run gulp --production
cd $DEMO_DIR
git init
git add .
git commit -m 'Auto deploy to github-pages'
git push -f git@github.com:gera2ld/jsqrgen.git master:gh-pages
