document.addEventListener("DOMContentLoaded", async () => {
    const continet = document.getElementById('continet');
    const data = await fetch('../data/countries.json')
        .then((response) => response.json())
        .catch((error) => {
            console.error("Error fetching countries data:", error);
            return {};
        });

    continet.addEventListener("input", () => {
        renderFlags(data, continet.value);
    });

    renderFlags(data, "All"); // Initially render all flags
});

function renderFlags(data, continent) {
    const flagsData = getDataByContinent(data, continent);
    let processedComponents = "";
    flagsData.forEach((flagData) => {
        processedComponents += `
        <div class="column is-3">
            <div class="card has-background-link-light">
                <div class="card-content">
                    <a href="${flagData.link}" target="_blank" rel="noopener"
                        title="Click to view detailed info about ${flagData.name}">
                        <figure style="margin: auto;" class="is-flex is-justify-content-center">
                            <img loading='lazy' class="flagimg" src="../assets/Flag Images/${flagData.img}"
                                alt="${flagData.name} Flag Image" />
                        </figure>
                        <p
                            class="is-size-5 has-text-black mt-2 has-text-centered has-text-weight-semibold">
                            ${flagData.name}
                        </p>
                    </a>
                </div>
            </div>
        </div>`;
    });

    document.getElementById("flagsContainer").innerHTML = processedComponents;
}

function getDataByContinent(data, continent) {
    if (continent === "All") {
        return Object.values(data).flat();
    }
    return data[continent] || [];
}