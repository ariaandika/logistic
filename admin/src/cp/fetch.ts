
import { writable } from "svelte/store";

export function getProm<T>(link: string) {
  const s = writable<FetchEvent<T>>({ type: 'idle' })
  
  return {
    store: s,
    fetch: (altLink?: string, query?: object) => {
      s.set({ type: 'loading' })
      
      const ctr = new AbortController()
      let target = altLink ?? link
      
      if (query) {
        const ent = Object.entries(query)
        target += '?'
        ent.forEach(([k,v])=>{
          target += k + '=' + String(v)
        })
      }
      
      fetch(target, { signal: ctr.signal })
        .then(e=>e.json())
        .then(data=>{
          s.set({ type: 'resolved', data })
        })
        .catch(error=>s.set({ type: 'error', error }))
      
      return ctr
    },
  }
}

export type FetchEvent<T,Er = Error> = {
  type: 'idle' | 'loading',
} | {
  type: 'resolved'
  data: T
} | {
  type: 'error',
  error: Er
}

