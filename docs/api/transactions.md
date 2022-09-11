---
title: Transactions 
description: Working with transactions
sidebar_position: 1
---

Every change that you perform on a Yjs document is implicitly wrapped in a
transaction. You can explicitly wrap your changes into a transaction to get more
out of Yjs. 

## Optimizing bulk changes

Changes can be applied in bulk using *transactions*. Changes that are bundled
into a transaction only fire a single event. Hence, you should always wrap bulk
changes in a transaction to avoid the cost of firing one event for every single
change.

```javascript live
const ydoc = new Y.Doc()
const ytext = ydoc.getText()

ytext.insert(0, 'World')

ytext.observe((event) => {
  // several changes are represented as a single change object
  event.changes.delta
})

ydoc.transact(tr => {
  ytext.insert(5, '!')
  ytext.insert(0, 'Hello ')
})

ytext.toString()

```

Contrary to other databases that support transactions, Yjs' transactions can't
be cancelled. 

## Event order

Events are fired immediately before and after executing transactions. There are no
asynchronous events that fire *eventually*.

Events fire in the following order:

* `ydoc.on('beforeTransaction', event => { .. })` - Called immediately before
  any transaction, allowing you to store relevant information before changes
  happen.
* `ydoc.on('beforeObserverCalls', event => { .. })` - Fired immediately after
  the transaction, but before observers are fired.
* `ytype.observe(event => { .. })` - Observers are called.
* `ytype.observeDeep(events => { .. })` - Deep observers are called.
* `ydoc.on('afterTransaction', event => {})` - Called after each transaction.
* `ydoc.on('update', update => { .. })` - This update message is propagated by
  the providers.

## The `origin` concept

This is a useful concept that is used through the Y ecosystem for writing
(editor) bindings to other tools. Usually, when we observe changes on a Yjs type
we don't know where a change originates from. A change could be applied from one
of your network providers, or it could originate from some other part of your
application. *Transaction origins* allow you to specify where a change comes
from.

The origin can then be observed when listening to events.

```javascript live

const ydoc = new Y.Doc()
const yarray = ydoc.getArray()

ydoc.on('beforeTransaction', tr => {
  tr.origin
})
ydoc.on('beforeObserverCalls', tr => {
  tr.origin
})
yarray.observe((event, tr) => {
  tr.origin
})
yarray.observeDeep((events, tr) => {
  tr.origin
})
ydoc.on('afterTransaction', tr => {
  tr.origin
})
ydoc.on('update', (update, origin, tr) => {
  origin
})

ydoc.transact(() => {
  yarray.insert(0, [1, 2, 3])
}, 'My Custom Origin')

```

It is recommended that the Yjs document is the source of truth for your
application. Yjs is designed to be the Model in
[MVC](https://www.wikiwand.com/de/Model_View_Controller). However, sometimes it
is not possible to make Yjs the source of truth. For instance, most prose
editors have their own editor model and expect that they have full control of
their model. All editor bindings in the Yjs organization implement a so-called
*double binding*. Double bindings keep two models in-sync. When one model
changes, we must apply the same change on the other model. To avoid that the
same change is applied multiple times, you should use the origin concept to
filter events that have already been applied.

```javascript

/**
 * This conceptual editor binding is very similar to the y-quill editor binding
 */
class MyEditorBinding {
  constructor (editor, ytype) {
    editor.on((delta, origin) => {
      if (origin !== this) {
        ytype.doc.transact(tr => {
          ytype.applyDelta(delta)
        }, this)
      }
    })
    ytype.observe(event => {
      if (event.origin !== editor) {
        editor.applyDelta(event.delta, this)
      }
    })
  }
}

```

Note that we use the instance of the editor binding when setting the transaction
origin. We recommend against using strings as origins. Using object identity,
we can create several editor bindings to the same shared type. This would lead
to problems when using strings as origin.

Most editors implement a similar, compatible origin concept. If they don't then
you could use mutexes to filter changes that have already been applied.

