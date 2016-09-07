set -e
npm run lint
npm run gulp --production -- build
git add dist/qrgen.js
