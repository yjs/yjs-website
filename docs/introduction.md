---
title: Introduction
description: >-
  Modular building blocks for building collaborative applications like Google
  Docs and Figma.
sidebar_position: 1
---

Yjs is a high-performance
[CRDT](https://en.wikipedia.org/wiki/Conflict-free\_replicated\_data\_type) for
building collaborative applications that sync automatically.

It exposes its internal CRDT model as _shared data types_ that can be
manipulated concurrently. Shared types are similar to common data types like
`Map` and `Array`. They can be manipulated, fire events when changes happen, and
automatically merge without merge conflicts.

## Quick Start

This is a working example of how shared types automatically sync. We also have a
[getting-started guide](getting-started/a-collaborative-editor.md), API
documentation, and lots of [live demos with source
code](https://github.com/yjs/yjs-demos).

```javascript live
// import * as Y from 'yjs'

/*
 * Yjs documents are collections of shared types.
 */
const ydoc = new Y.Doc()

/*
 * Define a shared Y.Map type on the Yjs document.
 */
const ymap = ydoc.getMap('my map')

/*
 * Observers are triggered when the shared type changes (local and remote
 * changes). The event object describes the changes
 */
ymap.observe(event => {
  event.changes.keys.get('keyA')
})

/*
 * A Y.Map type works similarly to a normal Map type.
 */
ymap.set('keyA', 'valueA')

/*
 * Define another Yjs document that we also manipulate.
 */
const ydocRemote = new Y.Doc()
const ymapRemote = ydocRemote.getMap('my map')
ymapRemote.set('keyB', 'my map')

/*
 * Sync changes to the remote ydoc.
 * Providers are extensions that do this automatically for you.
 */
const update = Y.encodeStateAsUpdate(ydoc)
Y.applyUpdate(ydocRemote, update)

/*
 * The changes from the original ydoc are now synced to our remoteYdoc.
 *
 * Unlike Git repositories, Yjs documents resolve potential conflicts
 * automatically without merge-conflicts.
 */
ymapRemote.toJSON()

```

## Editor Support

Yjs supports several popular text and rich-text editors. We are working with
other projects to enable collaboration-support through Yjs.

<ListCategoryItems label="Editor Bindings" />

## Network Agnostic 📡

Yjs doesn't make any assumptions about the network technology you are using. As
long as all changes eventually arrive, the documents will sync. The order in
which document updates are applied doesn't matter.

You can [integrate Yjs into your existing communication
infrastructure](tutorials/creating-a-custom-provider.md), or use one of the
[several existing network providers](ecosystem/network-provider.md) that allow
you to jump-start your application backend.

Scaling shared editing backends is not trivial. Most shared editing solutions
depend on a single source of truth - a central server - to perform conflict
resolution. Yjs doesn't need a central source of truth. This enables you to
design the backend using ideas from distributed system architecture. Multiple
backends can serve the same document to your users. And if one of them fails -
no problem - clients can just fall back to your backup servers. This makes
scaling your infrastructure much easier.

Another interesting application for Yjs as a data model for decentralized and
[Local-First software](https://www.inkandswitch.com/local-first.html).

## Rich Ecosystem 🔥

Yjs is a modular approach that allows the community to make any editor
collaborative using any network technology. It has thought-through solutions for
almost all shared-editing related problems.

We built a rich ecosystem of extensions around Yjs. There are ready-to-use
editor integrations for many popular (rich-)text editors, adapters to different
network technologies (like WebRTC, WebSocket, or Hyper), and persistence
providers that store document updates in a database.

## Unmatched Performance 🚀

Yjs is the fastest CRDT implementation, by far.

[crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks)

