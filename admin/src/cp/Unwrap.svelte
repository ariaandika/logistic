
<script lang=ts>
  type T = $$Generic

  export let result: Result<T[]> | Result<T> | null

  interface $$Slots {
    default: { data: T }
    err: { err: Error }
    empty: {}
  }

</script>


{#if result && result.success}

  {#if Array.isArray(result.data)}
  
    <!-- UNWRAP ARRAY -->
    {#each result.data as elem}
      <slot data={elem}/>
    {:else}
      <slot name="empty">
        Tidak Ditemukan
      </slot>
    {/each}
    
  {:else}
  
    <!-- UNWRAP OTHER -->
    <slot data={result.data}/>
  
  {/if}
  
{:else if result}
  <slot name="err" err={result.error}>
    Error "{result.error.name}", {result.error.message}<br>
    Cause, {result.error.cause}
  </slot>
{/if}
