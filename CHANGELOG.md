# Radiks-js Changelog

## 0.2.1 - June 9th, 2019

Thanks to @pradel for contributing most of the work in this release!

- Update to blockstack.js v19.2.1
- When a model is destroyed, also delete the file in Gaia [#34]
- Docs to show how to extend user model [#33]
- Adds a method to count the number of models for a given query [#32]
  - Must use `radiks-server` v0.1.12
- When you call `findById` or `fetch`, return `undefined` if nothing is found. [#31]
- Update docs to fix a typo when describing how to invite a user to a `UserGroup` [#28]
- Fix typings not being exported properly at the root level [#24]

## 0.2.0 - March 24, 2019

- Support for Blockstack.JS version 19 and higher
- Fully re-written in Typescript
- Support for deleting models

## 0.1.10 - March 7, 2019

- Adds the 'Central' API, with docs

## 0.1.9 - February 18, 2019

- Changes `Streamer` to use a secure websocket connection if the current URL is `https`