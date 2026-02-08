fetch("https://ageotherplanet.rvw.workers.dev")
    .then(res => res.json())
    .then(data => {
        document.getElementById("output").innerText = data.message;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("output").innerText = "Error loading data";
    });
