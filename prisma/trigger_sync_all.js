async function runSync() {
  console.log("Triggering initial sync for all 15 active RSS sources via HTTP POST...");
  try {
    const res = await fetch('http://localhost:3015/api/admin/importer/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    console.log("Sync Results Summary:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Sync Trigger Error:", err);
  }
}

runSync().then(() => process.exit(0));
