

<script lang=ts>
  import { enhance } from "$app/forms";
  
  export let data
</script>

<div>
  <h1 class="text-2xl font-bold">Halo {data.username}</h1>
  
  
  <form action="?/logout" method="post" use:enhance>
    <button class="btn btn-primary" name="logout">Logout</button>
  </form>
  
</div>