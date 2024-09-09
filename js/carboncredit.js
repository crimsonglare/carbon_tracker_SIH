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

window.financialChart = null;

const btn = document.getElementById('calculate-btn');

btn.addEventListener('click', (e) => {
    calculateCarbonCredits();
});


function calculateCarbonCredits() {

    const emissionReduction = parseFloat(document.getElementById('emission-reduction').value) || 0;
    const marketPrice = parseFloat(document.getElementById('market-price').value) || 0;

 
    const carbonCredits = emissionReduction / 1000;  

  
    const financialValue = carbonCredits * marketPrice;

  
    document.getElementById('result4').innerHTML = `
        <p><strong>Carbon Credits Earned:</strong> ${carbonCredits.toFixed(2)} tons CO₂</p>
        <p><strong>Financial Value:</strong> $${financialValue.toFixed(2)} USD</p>
    `;

    updateChart(carbonCredits, financialValue);

  
    storeResultsInFirebase(carbonCredits, financialValue);
}


function storeResultsInFirebase(carbonCredits, financialValue) {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;

       
        const currentDate = new Date();
        const formattedDate = currentDate.getDate().toString().padStart(2, '0') + '/' +
                              (currentDate.getMonth() + 1).toString().padStart(2, '0') + '/' +
                              currentDate.getFullYear();

       
        const carbonCreditRef = ref(database, 'users/' + uid + '/carbonCredit');
        const newCCRef = push(carbonCreditRef);
        set(newCCRef, {
            date: formattedDate,
            value: carbonCredits.toFixed(2)
        });

   
        const financialValueRef = ref(database, 'users/' + uid + '/financialValue');
        const newFVRef = push(financialValueRef);
        set(newFVRef, {
            date: formattedDate,
            value: financialValue.toFixed(2)
        });
    } else {
        console.log("User not logged in");
    }
}


function updateChart(carbonCredits, financialValue) {
    const ctx = document.getElementById('financialChart').getContext('2d');

    if (window.financialChart) {
        window.financialChart.destroy();
    }

  
    window.financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Carbon Credits Earned (tons CO₂)', 'Financial Value (USD)'],
            datasets: [{
                label: 'Carbon Credits & Financial Analysis',
                data: [carbonCredits, financialValue],
                backgroundColor: ['#4caf50', '#ff9800'],
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
