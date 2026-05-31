document.addEventListener("DOMContentLoaded", () => {
    const comparisonGrid = document.getElementById("comparisonGrid");
    const noSelectionMessage = document.getElementById("noSelectionMessage");

    const allListings = JSON.parse(localStorage.getItem("mojavto_listings")) || [];
    const comparedIds = JSON.parse(localStorage.getItem("mojavto_compareItems")) || [];

    if (comparedIds.length === 0) {
        noSelectionMessage.style.display = "block";
        comparisonGrid.style.display = "none";
        return;
    }

    const itemsToCompare = allListings.filter(listing => comparedIds.includes(listing.id));

    itemsToCompare.forEach(item => {
        const card = document.createElement("div");
        card.className = "comparison-card";

        // Prepare display data — show "-" if value is missing
        const detailsHTML = `
            <ul class="comparison-details">
                <li><span class="label">Year</span><span class="value">${item.year || '-'}</span></li>
                <li><span class="label">Mileage</span><span class="value">${item.mileage ? item.mileage.toLocaleString() + ' mi' : '-'}</span></li>
                <li><span class="label">Fuel</span><span class="value">${item.fuel || '-'}</span></li>
                <li><span class="label">Engine Power</span><span class="value">${item.power ? item.power + ' HP' : '-'}</span></li>
                <li><span class="label">Transmission</span><span class="value">${item.transmission || '-'}</span></li>
                ${item.fuel === 'Elektrika' ? `
                <li><span class="label">Battery</span><span class="value">${item.battery ? item.battery + ' kWh' : '-'}</span></li>
                <li><span class="label">Range</span><span class="value">${item.range ? item.range + ' mi' : '-'}</span></li>
                ` : ''}
            </ul>
        `;

        card.innerHTML = `
            <img src="${item.images?.exterior[0] || 'https://via.placeholder.com/300x180?text=Vehicle'}" alt="${item.title}">
            <div class="comparison-content">
                <h3>${item.title}</h3>
                <p class="price">$${item.price.toLocaleString()}</p>
                ${detailsHTML}
            </div>
        `;

        comparisonGrid.appendChild(card);
    });
});
