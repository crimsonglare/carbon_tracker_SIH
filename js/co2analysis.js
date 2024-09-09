import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";


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


const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);


const emissionFactorDiesel = 2.68;
const emissionFactorElectricity = 1.0; 
const methaneGWP = 28; 

const btn = document.getElementById('btn');

btn.addEventListener('click', (e) => {
    calculateEmissions();
});


function storeEmissionsInDatabase(totalEmissions) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            const timestamp = Date.now();

            
            const emissionsRef = ref(database, 'users/' + uid + '/totalEmission');

            const newEmissionRef = push(emissionsRef);

         
            set(newEmissionRef, {
                timestamp: timestamp,
                value: totalEmissions
            })
            .then(() => {
                console.log("Emissions data stored successfully.");
                alert("Emission data stored in the database.");
            })
            .catch((error) => {
                console.error("Error storing data:", error);
                alert("Error storing emission data.");
            });
        } else {
            alert("User is not logged in.");
        }
    });
}


function calculateEmissions() {
    const excavation = parseFloat(document.getElementById('excavation').value) || 0;
    const transportation = parseFloat(document.getElementById('transportation').value) || 0;
    const fuelCombustion = parseFloat(document.getElementById('fuel-combustion').value) || 0;
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;
    const blasting = parseFloat(document.getElementById('blasting').value) || 0;
    const waterPumping = parseFloat(document.getElementById('water-pumping').value) || 0;
    const ventilation = parseFloat(document.getElementById('ventilation').value) || 0;
    const methane = parseFloat(document.getElementById('methane').value) || 0;
    const employees = parseInt(document.getElementById('employees').value) || 0;

    const excavationEmissions = excavation * emissionFactorDiesel;
    const transportationEmissions = transportation * emissionFactorDiesel;
    const fuelCombustionEmissions = fuelCombustion * emissionFactorDiesel;
    const electricityEmissions = (electricity + waterPumping + ventilation) * emissionFactorElectricity;
    const blastingEmissions = blasting * emissionFactorDiesel;
    const methaneEmissions = methane * methaneGWP;

    const totalEmissions = excavationEmissions + transportationEmissions + fuelCombustionEmissions +
        electricityEmissions + blastingEmissions + methaneEmissions;

    const perCapitaEmissions = employees > 0 ? (totalEmissions / employees).toFixed(2) : 0;

 
    document.getElementById('result1').innerHTML = `
        <p><strong>Total Emissions:</strong> ${totalEmissions.toFixed(2)} kg CO₂</p>
        <p><strong>Per Capita Emission:</strong> ${perCapitaEmissions} kg CO₂ per employee</p>
    `;

 
    storeEmissionsInDatabase(totalEmissions.toFixed(2));
}
