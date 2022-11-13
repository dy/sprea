# sporae

> Reactive directives with expressions for DOM microtemplating.

```html
<div :if="user">
  Logged in as <span :text="user.displayName">Guest.</span>
</div>

<script>
  import spores from 'sporae';

  const state = spores(document.body, { user: { displayName: 'Dmitry Ivanov' } });

  // update value
  state.user.displayName = 'dy'
</script>
```

A lightweight alternative to [templize](https://github.com/dy/templize), [alpine](https://github.com/alpinejs/alpine) and [petite-vue](https://github.com/vuejs/petite-vue) with [better ergonomics](#justification).


## API

> `state = sporae(element, data)`<br/>
> `[state, update] = sporae(element, data)`

Evaluate directives within an `element` subtree with passed `data`.

`state` is proxy reflecting template values. Changing any of its props updates directives.<br/>
`update` can be used for bulk-updating multiple props.<br/>
`data` is the initial state to render the template. It can include reactive values.<br/>

## Reactivity

Directive expressions are naturally reactive, ie. data may contain any async/reactive values, such as:

* _Promise_ / _Thenable_
* _Observable_ / _Subject_ / _Subscribable_
* _AsyncIterable_
* _observ-*_
* etc., see [sube](https://github.com/dy/sube/blob/main/README.md) for the full list.

This way, for example, _@preact/signals_ or _rxjs_ can be connected directly bypassing subscription or reading value.

Update happens when any value changes:

```html
<div id="done" :text="loading ? 'loading' : result">...</div>

<script>
  import spores from 'sporae';
  import { signals } from '@preact/signals';

  // <div id="done">...</div>

  const loading = signal(false), result = signal(false);
  spores(done, { loading, result })

  // <div id="done">loading</div>

  setTimeout(() => (loading.value = true, result.value = 'done'), 1000)

  // ... 1s after
  // <div id="done">done</div>
</script>
```

Note: observers don't require disposal, since they're connected in weak fashion. Once element is disposed, observables are disconnected.


## Directives

* `:if="condition"`, `:else-if="condition"`, `:else` - controls flow of elements.
* `:each="item, idx? in list"` - creates instance of element per item in the list.
* `:text="value"` - set text content of an element.
* `:value="value"` – bind value to input or textarea.
* `:id`, `:name`, `:for`, `:alt`, `:title`, `:type`, `:hidden`, `:href`, `:autocomplete`, `:disabled`, `:src`, `:width`, `:height` – common attributes setters.
* `:class="[ a, 'b', c ]"` – set element class from an array, object or a string.
* `:style="{ a:1, b:2 }"` – set element style from a string or an object.
* `:prop="{ foo:1, bar:2 }"` – set any attribute / property.
* `:on="{ click:e=>{}, touch:e=>{} }"` – bind [multiple] events.
* `:data="{ foo:1, bar:2 }"` – set any data-attribute.
* `:aria="{ hidden:1 }"` – set any aria-role attribute.
* `:item="{ id: 1 }"` – set any item* attribute.

### Loops

Iterating over set of items can be done with `each` directive:

```html
<ul>
  <li :each="item, index in items" :id="'item-' + item.id" :data="{value:item.value}" :text="item.label"></li>
</ul>
```

<!--
#### Cases

```html
<li :each="{{ item, index in array }}">
<li :each="{{ key, value, index in object }}">
<li :each="{{ value in object }}">
```
-->

### Conditions

To optionally display an element, there are `if`, `else-if`, `else` directives.

```html
<span :if="status == 0">Inactive</span>
<span :else-if="status == 1">Active</span>
<span :else>Finished</span>
```

### Adding directives

Directives can be added by registering them via `directive(name, onCreate, onUpdate)`:

```js
import init, { directive } from 'sporae'

directive(':html',
  (el, expr, state) => {
    el._eval = parseExpression(expr)
  },
  (el, expr, state) => {
    el.innerHTML = el._eval(state)
  }
)
```

## Justification

. [Template-parts](https://github.com/dy/template-parts) / [templize](https://github.com/dy/templize) is progressive, but is stuck with native HTML quirks (parsing table case, svg attributes, conflict with liquid syntax etc). Besides ergonomics of `attr="{{}}"` is inferior to `:attr=""`.
. [Alpine](https://github.com/alpinejs/alpine) / [vue](https://github.com/vuejs/petite-vue) / [lit](https://github.com/lit/lit/tree/main/packages/lit-html) escapes native HTML quirks, but the syntax is a bit scattered: `:attr`, `v-*`,`x-*`, `@evt`, `{{}}` can be expressed with single convention. Besides, functionality is too broad and can be reduced to essence.
. [preact](https://ghub.io/preact) with HTML as JSX is a nice way to wire JS to templates, but it doesn't really support reactive fields (needs render call). Also migrating HTML to JS is an extreme with unwanted side-effects.

_Sporae_ takes elegant syntax convention of _alpine_ and method of _templize_ to connect any reactive values (like [@preact/signals](https://ghub.io/@preact/signals) or observables) to static HTML.

* It doesn't break static html markup.
* It provides organic fallback placeholder.
* It provides means for island hydration.
* It doesn't introduce syntax noise.
* It supports simple expressions with exposed reactive data types.

<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>