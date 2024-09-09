import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJ4gcPMh1q4ZxWex1y_goV5GH2q-P05lE",
    authDomain: "carbon-emmision-8042b.firebaseapp.com",
    databaseURL: "https://carbon-emmision-8042b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "carbon-emmision-8042b",
    storageBucket: "carbon-emmision-8042b.appspot.com",
    messagingSenderId: "303600366911",
    appId: "1:303600366911:web:53bd32e25fef31578c4f8a",
    measurementId: "G-QCG1WD3ZTG"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

// Sequestration rate (CO2 absorbed per hectare per year in metric tons)
const sequestrationRate = 6; // Average for forests, varies by species

const button = document.getElementById("result-btn");

button.addEventListener('click', (e) => {
    calculateCarbonSequestration();
});

// Function to calculate carbon sequestration and emission gap
function calculateCarbonSequestration() {
    // Get inputs from the fields
    const forestArea = parseFloat(document.getElementById('forest-area').value) || 0;
    const afforestationArea = parseFloat(document.getElementById('afforestation-area').value) || 0;
    const totalEmissions = parseFloat(document.getElementById('total-emissions').value) || 0;

    // Calculate sequestration for both existing forest and afforestation
    const existingSequestration = forestArea * sequestrationRate;
    const plannedSequestration = afforestationArea * sequestrationRate;

    // Total sequestration
    const totalSequestration = existingSequestration + plannedSequestration;

    // Calculate emission gap
    const emissionGap = totalEmissions - (totalSequestration * 1000); // Convert metric tons to kg CO2

    // Display results
    document.getElementById('result2').innerHTML = `
        <p><strong>Total Sequestration:</strong> ${totalSequestration.toFixed(2)} metric tons CO₂/year</p>
        <p><strong>Emission Gap:</strong> ${emissionGap > 0 ? emissionGap.toFixed(2) : 0} kg CO₂ to offset</p>
    `;

    // Display recommendations
    const recommendationSection = document.getElementById('recommendation-section');
    if (emissionGap > 0) {
        recommendationSection.innerHTML = `
            <p><strong>Recommendation:</strong> Increase afforestation efforts by adding more forest cover to offset the remaining ${emissionGap.toFixed(2)} kg CO₂.</p>
        `;
    } else {
        recommendationSection.innerHTML = `
            <p><strong>Great Job!</strong> Your sequestration efforts are sufficient to offset your emissions.</p>
        `;
    }

    // Update the bar chart
    updateChart(totalEmissions, totalSequestration * 1000); // Convert metric tons to kg CO2 for comparison

    // Store total sequestration in Firebase
    storeTotalSequestration(totalSequestration);
}

// Function to store the totalSequestration in Firebase
function storeTotalSequestration(totalSequestration) {
    // Get the current user's uid
    const user = auth.currentUser;
    if (user) {
        const uid = user.uid;

        // Generate a unique ID for each result (TSID_x) and get the current year
        const timestamp = Date.now();
        const currentYear = new Date().getFullYear();
        const newSequestrationKey = `TSID_${timestamp}`;

        // Create the sequestration data object
        const sequestrationData = {
            year: currentYear,
            value: totalSequestration
        };

        // Store the result under totalSequestration in Firebase
        const userSequestrationRef = ref(database, `users/${uid}/totalSequestration/${newSequestrationKey}`);
        set(userSequestrationRef, sequestrationData)
            .then(() => {
                console.log('Total sequestration saved successfully!');
                alert("Total sequestration stored in the database.");
            })
            .catch((error) => {
                console.error('Error saving total sequestration:', error);
            });
    } else {
        console.error('User not authenticated');
    }
}

// Function to create and update the bar chart using Chart.js
function updateChart(emissions, sequestration) {
    const ctx = document.getElementById('sequestrationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Emissions (kg CO₂)', 'Total Sequestration (kg CO₂)'],
            datasets: [{
                label: 'Emissions vs Sequestration',
                data: [emissions, sequestration],
                backgroundColor: ['#f44336', '#4caf50'],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
