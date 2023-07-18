
<script lang=ts>
  type T = $$Generic

  export let result: Result<T>

  interface $$Slots {
    default: { data: T }
    err: { err: Error }
    empty: {}
  }

</script>


{#if result.success}

  <!-- DONT UNWRAP ARRAY -->
  <slot data={result.data}/>
  
{:else}
  <slot name="err" err={result.error}>
    Error "{result.error.name}", {result.error.message}<br>
    Cause, {result.error.cause}
  </slot>
{/if}

