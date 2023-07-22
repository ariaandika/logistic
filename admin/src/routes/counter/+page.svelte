

<script lang=ts>
  import { Unwrap, Container } from "cp";
    import type { LayoutData } from "./$types";
  
  export let data: LayoutData
</script>

<Container>
  
  <h1 class="text-2xl font-bold">Halo {data.auth.username}</h1>


  <Unwrap result={data.queries} let:data>
    <div class="overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>No Resi</th>
            <th>Kota</th>
            <th>Total Koli</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {#each data as d (d.no_resi)}
          <tr>
            <td>{d.no_resi}</td>
            <td>{d.kota}</td>
            <td>{d.total_koli}</td>
            <td><input type="checkbox" class="checkbox checkbox-primary" name="{String(d.no_resi)}"></td>
          </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Unwrap>

  <form action="?/logout" method="post">
    <button class="btn btn-primary" name="logout">Logout</button>
  </form>
  
</Container>
