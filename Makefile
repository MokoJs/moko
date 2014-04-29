MOCHA_PATH=node_modules/mocha/bin/mocha
MOCHA_OPTS=--reporter=spec --harmony

test: 
	NODE_ENV=test $(MOCHA_PATH) $(MOCHA_OPTS) -w

test-debug: 
	NODE_ENV=test $(MOCHA_PATH) $(MOCHA_OPTS) debug

test-once:
	NODE_ENV=test $(MOCHA_PATH) $(MOCHA_OPTS)

test-coverage:
	NODE_ENV=test MOKO_COVERAGE=1 $(MOCHA_PATH) --harmony test --require blanket --reporter html-cov > coverage.html

test-coveralls:
	NODE_ENV=test MOKO_COVERAGE=1 $(MOCHA_PATH) --harmony test --require blanket --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

.PHONY: test test-coverage test-coveralls test-once test-debug
