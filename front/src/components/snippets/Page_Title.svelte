<script>
    export let appName;
    export let comp;
    export let titleOverride = null;

    // Sets document.title imperatively instead of via <svelte:head><title>.
    // svelte:head appends a *new* <title> node - if index.html ever gets a static
    // fallback <title>, that static one (first in tree order) would permanently win
    // over Svelte's appended one. Mutating document.title in place avoids that trap
    // and correctly updates whichever <title> element is already there.
    $: computedTitle = titleOverride || (appName && comp ? `${appName} - ${comp}` : null);
    $: if(computedTitle) document.title = computedTitle;
</script>