set -e
DEMO_DIR=dist
rm -rf $DEMO_DIR
npm run lint
npm run gulp --production
cd $DEMO_DIR
git init
git add .
git commit -m 'Auto deploy to github-pages'
git push -f git@github.com:gera2ld/jsqrgen.git master:gh-pages
