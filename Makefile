test:
	env NODE_ENV='test' mocha test/test.js

server:
	env NODE_ENV='development' node app.js | bunyan

start:
	pm2 startOrRestart processes.json

stop:
	pm2 delete api

vm\:test:
	vagrant ssh -c 'cd /var/www/kenthackenough && env NODE_ENV='test' mocha test/test.js'

vm\:server:
	vagrant ssh -c 'cd /var/www/kenthackenough && env NODE_ENV='development' node app.js | bunyan'

vm\:start:
	vagrant ssh -c 'cd /var/www/kenthackenough && pm2 startOrRestart processes.json'

vm\:stop:
	vagrant ssh -c 'cd /var/www/kenthackenough && pm2 delete api'

vm\:rebuild:
	vagrant ssh -c 'cd /var/www/kenthackenough && npm rebuild'

.PHONY: test server