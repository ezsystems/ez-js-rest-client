# JavaScript client library for the eZ Publish REST API

[![Build Status](https://travis-ci.org/ezsystems/ez-js-rest-client.png)](https://travis-ci.org/ezsystems/ez-js-rest-client)

This repository provides a JavaScript library meant to ease the usage of [the eZ
Publish REST API](https://confluence.ez.no/display/EZP/eZ+Publish+REST+API).

## Installation

The eZ Publish JavaScript REST Client is a [bower](http://blower.io) package, so
the easiest way to install it is to run:

```
$ bower install --save ezsystems/ez-js-rest-client
```

Then you can include in your project the file
`bower\_components/ez-js-rest-client/dist/CAPI-min.js` (or the non minified
version).

There is also an option to use promise-based version of the client (file
`bower\_components/ez-js-rest-client/dist/PromiseCAPI.js` or
`bower\_components/ez-js-rest-client/dist/PromiseCAPI-min.js`).
It provides the same functional but all asynchronous methods are
promise-wrapped which helps to make code more clean and readable.

Read more about promise-based version in the **Build** section of this manual.

It's also possible to directly take any of the mentioned files in a clone
of this repository.

## Development

### Requirements

The project maintenance is handled in a [nodejs](http://nodejs.org) based
environment with a help of Grunt task runner.

* Install [nodejs](http://nodejs.org/)
* Clone this repository
* From the root of the repository, install the local npm dependencies:
  ```
  $ npm install
  ```
* Install the global dependencies (usually you need to be root)
  ```
  # npm install -g grunt-cli yuidoc bower
  ```

### API Documentation

The JavaScript API documentation can be generated in the `api` directory with:

```
$ grunt doc
```
Alternatively, you can run
```
$ grunt livedoc
```
to run the [yuidoc documentation
server](http://yui.github.io/yuidoc/args/index.html#server). The dynamic
documentation can then be reached at http://127.0.0.1:3000.


### Build

The library can be built with:

```
$ grunt build
```

 This command will (re)generate the files `dist/CAPI.js`, `dist/CAPI-min.js` and `dist/PromiseCAPI.js`.
First 2 files are full and minified versions of the regular client library wich doesn't have any dependencies and
is intended for general use.

 The `PromiseCAPI.js` is a promise-based version of the library
which has a dependency on the Q library. While using this version a developer himself is responsible for inclusion of Q library into the project.
It can be done by using preferred dependency management system or by simply downloading and including Q library file into scripts.
For example see the source file from manual testing bundle: `test/manual/jsRestClientBundle/Resources/views/promise.test.html.twig`.

More info on Q and promises: https://github.com/kriskowal/q.


### Tests

#### Unit tests

The unit tests can be executed with:
```
$ grunt test
```

It's also possible to generate a coverage report with:

```
$ grunt coverage
```

After this command, the report is available in
`test/coverage/lcov-report/index.html`.

#### Manual tests

The library can be manually tested by installing the Symfony2 bundle
*jsRestClientBundle*, which is situated in the test/manual/ folder.

Before bundle installation run `grunt build` command once. It will build all the
source files into Resources/public/js/CAPI.js file.

Then the bundle could be installed into your current ezPublish 5.x instance
using following instruction:

* Create `path/to/ezpublish5/src/EzSystems` if it does not exist.
* Symlink the bundle into /src/EzSystems/ (keep folder name).
* Edit /ezpublish/EzPublishKernel.php and add the following line before in the
  return statement of the method registerBundles:

    ```php
    $bundles[] = new EzSystems\jsRestClientBundle\jsRectClientBundle();
    ```

* Import routing.yml file of the bundle into main routing file by adding the
  following lines at the very bottom of `ezpublish/config/routing.yml`:

    ```yaml
    jsRestClientBundle:
        resource: "@jsRestClientBundle/Resources/config/routing.yml"
    ```
* If you intend to test promise-based version of the CAPI, additionally install
Q library by running
```
$ bower install
```
* Clear the Symfony 2 caches with ezpublish/console.

After these steps you may access `/js-rest-client-test/` path where you will find
testing html page.  Most of requests can be configured a little bit before
executing them by changing input values.  See details of tests implementation in
`Resources/public/js/cookbook-*.js` files.

To test promise-based version of the CAPI you can use
`/js-rest-client-promise-test/` path.
This setup includes Q library as a bower package. See details of (rather basic)
tests implementation in `Resources/public/js/cookbook-PromiseCAPI.js`.