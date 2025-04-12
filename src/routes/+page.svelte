<script>
	import { Button, Card, Menu, MenuItem, Settings, Toggle } from 'svelte-ux';
</script>

<Button variant="outline" color="danger">Click here</Button>


<Card>

    <Settings
  components={{
    Button: { classes: "border-2 font-bold" },
    Menu: { classes: "shadow-xl border-gray-500" },
    MenuItem: { classes: "font-bold" },
  }}
>
  <Toggle let:on={open} let:toggle let:toggleOff>
    <Button on:click={toggle} variant="outline" color="primary">
      Click me
      <Menu {open} on:close={toggleOff}>
        <MenuItem>Refresh</MenuItem>
        <MenuItem>Settings</MenuItem>
        <MenuItem>Help</MenuItem>
        <MenuItem>Sign In</MenuItem>
        <MenuItem disabled>Disabled</MenuItem>
      </Menu>
    </Button>
  </Toggle>
</Settings>
</Card>
