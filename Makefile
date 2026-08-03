# Makefile for Jupyterlab extensions version 1.31+local
# changelog:
#   1.31+local - LOCAL DIVERGENCE from the shared template, not yet upstreamed:
#                uninstall takes the distribution name (a wheel path always errored,
#                and the error was swallowed, so the target never uninstalled);
#                version bump moved off `build` onto `publish`/`release_build`, so a
#                plain `make install` no longer mutates package.json; `npm install`
#                reduced to `--package-lock-only` so yarn alone owns node_modules
#                while package-lock.json still tracks package.json; added
#                integration_test for the Playwright/Galata suite, which also
#                installs its own node_modules since mrproper removes them;
#                clean no longer depends on uninstall, so a failed build can no
#                longer leave the environment with the extension removed;
#                .NOTPARALLEL: added - the bump is now a sibling of install
#                rather than an ancestor of build, and make does not order
#                siblings under -j, so `make -j publish` would otherwise build
#                the wheel at the old version and bump afterwards
#   1.31 - mrproper now removes ui-tests/node_modules (Playwright browser binaries)
#   1.30 - check twine in check_dependencies, ensure publish doesn't fail on missing twine
#   1.29 - replace yarn with jlpm, add prettier format, auto-commit and push after publish
#   1.28 - initial versioned Makefile
# author: Stellars Henson <konrad.jelen@gmail.com>
# License: MIT Open Source License

# Targets here are order-dependent (publish must bump before it builds), and make
# does not order sibling prerequisites under -j.
.NOTPARALLEL:

.PHONY: build release_build install clean uninstall publish dependencies mrproper increment_version install_dependencies check_dependencies upgrade help test integration_test
.DEFAULT_GOAL := help

# Read current version from package.json (only if node is available)
VERSION := $(shell command -v node >/dev/null 2>&1 && node -p "require('./package.json').version" || echo "0.0.0")

## increment project version
increment_version:
	@echo "Current version: $(VERSION)"
	@bash -c 'CURRENT_VERSION=$(VERSION); \
	IFS="." read -r major minor patch <<< "$$CURRENT_VERSION"; \
	NEW_PATCH=$$((patch + 1)); \
	NEW_VERSION="$$major.$$minor.$$NEW_PATCH"; \
	echo "New version: $$NEW_VERSION"; \
	sed -i "s/\"version\": \"$$CURRENT_VERSION\"/\"version\": \"$$NEW_VERSION\"/" package.json; '

## build packages
build: clean check_dependencies
	npm install --package-lock-only
	jlpm install
	npx prettier --write package-lock.json package.json
	python -m build

## bump the patch version, then build
release_build: increment_version build

## install package
install: build
	pip install dist/*.whl --force-reinstall

## run unit tests
test: check_dependencies
	jlpm test

## run the Playwright/Galata integration tests
integration_test: check_dependencies
	cd ui-tests && jlpm install && jlpm playwright test

## clean builds and installables
clean: check_dependencies
	@command -v npm >/dev/null 2>&1 && npm run clean || true
	@command -v npm >/dev/null 2>&1 && npm run clean:labextension || true
	rm -rf dist lib || true

## uninstall package
uninstall:  check_dependencies
	pip uninstall -y jupyterlab_open_in_terminal_extension 2>/dev/null || true

## check if required dependencies are installed
check_dependencies:
	@echo "Checking dependencies..."
	@MISSING=""; \
	command -v node >/dev/null 2>&1 || MISSING="$$MISSING node"; \
	command -v npm >/dev/null 2>&1 || MISSING="$$MISSING npm"; \
	python -m twine --version >/dev/null 2>&1 || MISSING="$$MISSING twine"; \
	if [ -n "$$MISSING" ]; then \
		echo "Missing dependencies:$$MISSING"; \
		echo "Installing missing dependencies..."; \
		$(MAKE) install_dependencies; \
	else \
		echo "All dependencies are installed."; \
	fi

## publish package to public repository
publish: check_dependencies increment_version install
	npm publish --access public
	python -m twine upload dist/*
	git add package.json package-lock.json
	git commit -m "chore: post-publish $$(node -p "require('./package.json').version") package metadata"
	git push

## install all required build dependencies
install_dependencies:
	pip install nodeenv twine
	nodeenv --node=lts --prebuilt -p
	npm install -g yarn rimraf

## upgrade all npm and yarn dependencies
upgrade: check_dependencies
	jlpm up

## cleanup all build and metabuild artefacts
mrproper: clean uninstall
	rm -rf node_modules .yarn ui-tests/node_modules || true

## prints the list of available commands
help:
	@echo ""
	@echo "$$(tput bold)Available rules:$$(tput sgr0)"
	@sed -n -e "/^## / { \
		h; \
		s/.*//; \
		:doc" \
		-e "H; \
		n; \
		s/^## //; \
		t doc" \
		-e "s/:.*//; \
		G; \
		s/\\n## /---/; \
		s/\\n/ /g; \
		p; \
	}" ${MAKEFILE_LIST} \
	| LC_ALL='C' sort --ignore-case \
	| awk -F '---' \
		-v ncol=$$(tput cols) \
		-v indent=19 \
		-v col_on="$$(tput setaf 6)" \
		-v col_off="$$(tput sgr0)" \
	'{ \
		printf "%s%*s%s ", col_on, -indent, $$1, col_off; \
		n = split($$2, words, " "); \
		line_length = ncol - indent; \
		for (i = 1; i <= n; i++) { \
			line_length -= length(words[i]) + 1; \
			if (line_length <= 0) { \
				line_length = ncol - indent - length(words[i]) - 1; \
				printf "\n%*s ", -indent, " "; \
			} \
			printf "%s ", words[i]; \
		} \
		printf "\n"; \
	}' 
	@echo ""


# EOF

