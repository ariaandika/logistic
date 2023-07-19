
<script lang=ts>
  type T = $$Generic

  export let result: Result<T> | null

  interface $$Slots {
    default: { data: T }
    none: { message: string }
    err: { err: Error }
    empty: {}
  }

</script>


{#if result && result.success}

  {#if result.data === null}
  
  <slot name="none" message={result.message}/>
  
  {:else}
  
  <slot data={result.data}/>
  
  {/if}
  
{:else if result}
  <slot name="err" err={result.error}>
    Error "{result.error.name}", {result.error.message}<br>
    Cause, {result.error.cause}
  </slot>
{/if}
