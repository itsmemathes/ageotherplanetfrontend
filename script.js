fetch("https://ageotherplanet.ageotherplanet.workers.dev")
    .then(res => res.json())
    .then(data => {
        document.getElementById("output").innerText = data.message;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("output").innerText = "Error loading data (Backend might be waking up...)";
    });
