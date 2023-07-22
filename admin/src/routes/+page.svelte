


<script lang=ts>
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import { Form, Unwrap } from "cp"

  export let form: ActionData
</script>

<div class="min-h-screen grid place-items-center bg-base-300">
  <div class="card w-96 bg-base-100 min-w-[28rem] shadow-xl">
    
    <form method="post" class="card-body" action="?/login" use:enhance>
      <h2 class="card-title text-4xl mb-4">Banter</h2>
      <div class="form-control">
        <label for="username" class="label">
          <span class="label-text">Username</span>
        </label>
        <input type="text" placeholder="username" id="username" name=username value="{form?.username ?? ''}" class="input input-bordered" />
      </div>
      <div class="form-control">
        <label for="password" class="label">
          <span class="label-text">Password</span>
        </label>
        <input type="password" placeholder="password" id="password" name=passwd class="input input-bordered" />
      </div>
      
      <div class="card-actions my-4">
        <button class="btn btn-primary flex-grow">Login</button>
      </div>
      
      <Form {form} let:form>
        <div class="px-4 pb-4">
          <Unwrap result={form.result} let:data>
            <slot name=none>
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{JSON.stringify(data)}</span>
            </slot>
          </Unwrap>
        </div>
      </Form>
    </form>
    
  </div>
</div>