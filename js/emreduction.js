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

const btn = document.getElementById('cal');

btn.addEventListener('click', (e) => {
    calculateReduction();
});


function calculateReduction() {

    const cleanTechs = parseFloat(document.getElementById('clean-techs').value) || 0;
    const reductionPerTech = parseFloat(document.getElementById('reduction-per-tech').value) || 0;

    const totalEnergy = parseFloat(document.getElementById('total-energy').value) || 0;
    const renewablePercentage = parseFloat(document.getElementById('renewable-percentage').value) || 0;
    const emissionFactor = parseFloat(document.getElementById('emission-factor').value) || 0.92;

   
    const techReduction = cleanTechs * reductionPerTech * 1000;  

   
    const renewableEnergyAdopted = (renewablePercentage / 100) * totalEnergy;
    const energyReduction = renewableEnergyAdopted * emissionFactor;


    const totalReduction = techReduction + energyReduction;

 
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;

            
            const timestamp = Date.now();
            const newReductionKey = `TRID_${timestamp}`;

          
            const reductionData = {
                timestamp: timestamp,
                value: totalReduction
            };

         
            set(ref(database, `users/${uid}/totalReduction/${newReductionKey}`), reductionData)
            .then(() => {
                console.log('Total reduction saved successfully!');
                alert('Total reduction saved successfully!');
            })
            .catch((error) => {
                console.error('Error saving total reduction:', error);
            });
        } else {
            console.error('User not authenticated');
        }
    });

  
    document.getElementById('result3').innerHTML = `
        <p><strong>Total Emission Reduction:</strong> ${totalReduction.toFixed(2)} kg CO₂</p>
        <p><strong>Reduction from Clean Technologies:</strong> ${techReduction.toFixed(2)} kg CO₂</p>
        <p><strong>Reduction from Renewable Energy:</strong> ${energyReduction.toFixed(2)} kg CO₂</p>
    `;

   
    const recommendationSection = document.getElementById('recommendation1');
    if (techReduction < 40000 || energyReduction < 5000) {
        recommendationSection.innerHTML = `
            <p><strong>Recommendation:</strong> Consider adopting more clean technologies or increasing renewable energy usage to further reduce emissions.</p>
        `;
    } else {
        recommendationSection.innerHTML = `
            <p><strong>Good Job!</strong> Your current strategies are effectively reducing emissions.</p>
        `;
    }

    updateChart(techReduction, energyReduction);
}


function updateChart(techReduction, energyReduction) {
    const ctx = document.getElementById('reductionChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Clean Technologies', 'Renewable Energy'],
            datasets: [{
                label: 'Emission Reduction (kg CO₂)',
                data: [techReduction, energyReduction],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
