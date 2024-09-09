import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

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


let totalEmissionChart, totalReductionChart, totalSequestrationChart, carbonCreditChart, financialValueChart;

function createLineChart(ctx, labels, data, label) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


function calculateAverage(data) {
    const sum = data.reduce((a, b) => a + b, 0);
    return (sum / data.length).toFixed(2);
}


function updateChartData(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

auth.onAuthStateChanged(user => {
    if (user) {
        const uid = user.uid;

        const totalEmissionRef = ref(database, `users/${uid}/totalEmission`);
        onValue(totalEmissionRef, snapshot => {
            const timestamps = [];
            const values = [];
            snapshot.forEach(childSnapshot => {
                const entry = childSnapshot.val();
                const timestamp = new Date(entry.timestamp).toLocaleTimeString();
                timestamps.push(timestamp);
                values.push(parseFloat(entry.value));
            });
            if (!totalEmissionChart) {
                const ctx = document.getElementById('totalEmissionChart').getContext('2d');
                totalEmissionChart = createLineChart(ctx, timestamps, values, 'Total Emission');
            } else {
                updateChartData(totalEmissionChart, timestamps, values);
            }
            document.getElementById('totalEmissionAverage').textContent = calculateAverage(values);
        });

 
        const totalReductionRef = ref(database, `users/${uid}/totalReduction`);
        onValue(totalReductionRef, snapshot => {
            const timestamps = [];
            const values = [];
            snapshot.forEach(childSnapshot => {
                const entry = childSnapshot.val();
                const timestamp = new Date(entry.timestamp).toLocaleTimeString();
                timestamps.push(timestamp);
                values.push(parseFloat(entry.value));
            });
            if (!totalReductionChart) {
                const ctx = document.getElementById('totalReductionChart').getContext('2d');
                totalReductionChart = createLineChart(ctx, timestamps, values, 'Total Reduction');
            } else {
                updateChartData(totalReductionChart, timestamps, values);
            }
            document.getElementById('totalReductionAverage').textContent = calculateAverage(values);
        });

     
        const totalSequestrationRef = ref(database, `users/${uid}/totalSequestration`);
        onValue(totalSequestrationRef, snapshot => {
            const years = [];
            const values = [];
            snapshot.forEach(childSnapshot => {
                const entry = childSnapshot.val();
                const yearIndex = years.indexOf(entry.year);
                if (yearIndex !== -1) {
                    values[yearIndex] = parseFloat(entry.value);
                } else {
                    years.push(entry.year);
                    values.push(parseFloat(entry.value));
                }
            });
            if (!totalSequestrationChart) {
                const ctx = document.getElementById('totalSequestrationChart').getContext('2d');
                totalSequestrationChart = createLineChart(ctx, years, values, 'Total Sequestration');
            } else {
                updateChartData(totalSequestrationChart, years, values);
            }
            document.getElementById('totalSequestrationAverage').textContent = calculateAverage(values);
        });

        const carbonCreditRef = ref(database, `users/${uid}/carbonCredit`);
onValue(carbonCreditRef, snapshot => {
    const dates = [];
    const values = [];
    snapshot.forEach(childSnapshot => {
        const entry = childSnapshot.val();
        dates.push(entry.date);  
        values.push(parseFloat(entry.value));
    });
    if (!carbonCreditChart) {
        const ctx = document.getElementById('carbonCreditChart').getContext('2d');
        carbonCreditChart = createLineChart(ctx, dates, values, 'Carbon Credit'); 
    } else {
        updateChartData(carbonCreditChart, dates, values); 
    }
    document.getElementById('carbonCreditAverage').textContent = calculateAverage(values);
});

const financialValueRef = ref(database, `users/${uid}/financialValue`);
onValue(financialValueRef, snapshot => {
    const dates = [];
    const values = [];
    snapshot.forEach(childSnapshot => {
        const entry = childSnapshot.val();
        dates.push(entry.date);  
        values.push(parseFloat(entry.value));
    });
    if (!financialValueChart) {
        const ctx = document.getElementById('financialValueChart').getContext('2d');
        financialValueChart = createLineChart(ctx, dates, values, 'Financial Value');  
    } else {
        updateChartData(financialValueChart, dates, values);  
    }
    document.getElementById('financialValueAverage').textContent = calculateAverage(values);
});

    }
});
