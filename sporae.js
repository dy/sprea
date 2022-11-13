// autoinit
const s = document.currentScript
if (s && s.hasAttribute('init')) {
  sporae(document.documentElement)
}

// dew element: apply directives
export default function sporae(el, scope) {
  scope ||= {}

  // TODO: parts are not parsed, but detected from directives
  let params,
      update = diff => { for (let dir in directives) directives[dir].update(el, scope) }

  for (let dir in directives) directives[dir].init(el, scope)

  // return update via destructuring of result to allow batch-update
  scope[Symbol.iterator] = function*(){ yield params; yield update; }

  return params = new Proxy(scope,  {
    set: (s, k, v) => (scope[k]=v, update(scope), 1),
    deleteProperty: (s,k) => (delete scope[k], update(), 1)
  })
}

// dict of directives
const directives = {}, store = new WeakMap

// register a directive
export const directive = (name, init, update) => directives[name] = {
  init(container, scope) {
    let els = container.querySelectorAll(`[${name}]`)

    // replace all shortcuts with inner templates
    for (el of els) {
      // FIXME: make sure no leak is introduced here
      if (!el._sporae) {
        el._sporae = scope
        init(el, el.getAttribute(name), scope)
      }
    }

    return els
  },
  update(container, scope) {
    let els = container.querySelectorAll(`[${name}]`)

    // replace all shortcuts with inner templates
    for (el of els) {
      if (el._sporae) update(el, el.getAttribute(name), scope)
    }
  }
}

// hidden attribute directive example
directive('hidden', (el, expr) => {
  let evaluate = parse(expr)
  return (state) => {
    let value = evaluate(state)
    prop(el, 'hidden', value)
  }
})
directive('if', (el, expr, stash) => {
  stasj
  let stash = {els: [el], clauses:[parse(expr)], holder:new Text}, current = el
  ifStash.set(el, stash)
  return state => {
    let idx = stash.clauses.findIndex(match => match(state))
    if (idx >= 0) current.replaceWith(current = els[idx])
    else current.replaceWith(current = holder)
  }
})
directive('else-if', (el, expr) => {
  const ifNode = prev('text-with-if')
  const stash = ifStash.get(ifNode)
  stash.els.push(el)
  stash.els.
  return
})
directive('else', (el, expr) => {

})

// configure directives
directive('if', (instance, part) => {
  // clauses in evaluation read detected clause by :if part and check if that's them
  (part.addCase = (casePart, matches=casePart.eval) => (
    casePart.eval = state => part.match ? '' : !matches(state) ? '' : (
      part.match = casePart, // flag found case
      // FIXME: create on the first match and only update after; complicated by el losing children on update
      new TemplateInstance(casePart.template, state, processor)
    )
  ))(instance.ifPart=part)

  // `if` case goes first, so we clean up last matched case and detect match over again
  const evalCase = part.eval
  part.eval = state => (part.match = null, evalCase(state))
})
directive('else-if', (instance, part) => instance.ifPart?.addCase(part))
directive('else', (instance, part) => (part.eval=()=>true, instance.ifPart?.addCase(part), instance.ifPart=null) )

directive('each', (instance, part) => {
  let evalLoop = part.eval
  part.eval = state => {
    let [itemId, items] = evalLoop(state), list=[]
    // FIXME: cache els instead of recreating. Causes difficulties tracking el children
    for (let item of items) list.push(new TemplateInstance(part.template, {...state,[itemId]:item}, processor))
    return list
  }
})