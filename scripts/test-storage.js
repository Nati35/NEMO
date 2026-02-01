
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env vars since we're running plain node
// Note: In a real scenario we'd use dotenv, but let's try to just read the file or rely on the user having them set. 
// Easier: I will just hardcode the values from the .env file I verified earlier for this temporary test script to ensure it runs without dependency strings attached.
// I saw the values in Step 120.

const SUPABASE_URL = "https://hwydxzmwmimfsnpnvomj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3eWR4em13bWltZnNucG52b21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjkxMDQsImV4cCI6MjA4NTIwNTEwNH0.sf7efPgqg-36oMLx-OLAcmylJLPTRgI6q22NuxDpP10";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testUpload() {
    console.log("Testing connection to Supabase Storage...");

    // 1. List Buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("❌ Failed to list buckets:", listError);
    } else {
        console.log("✅ Buckets found:", buckets.map(b => b.name));
        const mediaBucket = buckets.find(b => b.name === 'MEDIA');
        if (!mediaBucket) {
            console.error("❌ 'MEDIA' bucket is MISSING! (Found: " + buckets.map(b => b.name).join(', ') + ")");
        } else {
            console.log("✅ 'MEDIA' bucket exists.");
        }
    }

    // 2. Try Upload
    console.log("Attempting upload to MEDIA...");
    const fileName = `test-${Date.now()}.txt`;
    const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, 'Hello World Test', {
            contentType: 'text/plain',
            upsert: false
        });

    if (error) {
        console.error("❌ Upload FAILED:", error);
    } else {
        console.log("✅ Upload SUCCESS:", data);
    }
}

testUpload();
