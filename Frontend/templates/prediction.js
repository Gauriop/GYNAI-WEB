// BMI Calculation
function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100;
    if (weight && height) {
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmi').value = bmi;
    }
}

// Waist-Hip Ratio Calculation
function calculateWaistHipRatio() {
    const waist = parseFloat(document.getElementById('waist').value);
    const hip = parseFloat(document.getElementById('hip').value);
    if (waist && hip) {
        const ratio = (waist / hip).toFixed(2);
        document.getElementById('waistHipRatio').value = ratio;
    }
}

// Auto-calculate BMI when weight/height changes
document.getElementById('weight').addEventListener('input', calculateBMI);
document.getElementById('height').addEventListener('input', calculateBMI);

// Auto-calculate Waist-Hip ratio
document.getElementById('waist').addEventListener('input', calculateWaistHipRatio);
document.getElementById('hip').addEventListener('input', calculateWaistHipRatio);

// Function to generate diet recommendations
function generateDietRecommendations(formData, prediction) {
    const dietContainer = document.getElementById('dietRecommendations');
    const bmi = parseFloat(formData.bmi);
    const hasHighRisk = prediction === 1;
    
    let recommendations = [];

    if (hasHighRisk) {
        recommendations = [
            {
                title: "Low Glycemic Index Foods",
                desc: "Focus on whole grains like quinoa, brown rice, and oats. These help manage insulin levels and reduce PCOS symptoms."
            },
            {
                title: "Anti-Inflammatory Foods",
                desc: "Include fatty fish (salmon, mackerel), leafy greens, berries, and turmeric. These reduce inflammation associated with PCOS."
            },
            {
                title: "Lean Proteins",
                desc: "Consume chicken breast, fish, eggs, legumes, and Greek yogurt to maintain stable blood sugar levels."
            },
            {
                title: "Healthy Fats",
                desc: "Add avocados, nuts, seeds, and olive oil to your diet. These support hormone balance."
            },
            {
                title: "Avoid Processed Foods",
                desc: "Limit refined carbs, sugary drinks, fried foods, and excessive caffeine which can worsen PCOS symptoms."
            },
            {
                title: "Fiber-Rich Foods",
                desc: "Eat plenty of vegetables, fruits, and legumes to improve digestion and regulate blood sugar."
            }
        ];
    } else {
        recommendations = [
            {
                title: "Balanced Nutrition",
                desc: "Maintain a balanced diet with whole grains, lean proteins, healthy fats, and plenty of fruits and vegetables."
            },
            {
                title: "Regular Meal Timing",
                desc: "Eat at consistent times throughout the day to maintain stable energy and hormone levels."
            },
            {
                title: "Hydration",
                desc: "Drink 8-10 glasses of water daily. Stay hydrated for optimal hormonal health."
            },
            {
                title: "Antioxidant-Rich Foods",
                desc: "Include berries, dark leafy greens, and colorful vegetables to support overall health."
            },
            {
                title: "Limit Processed Foods",
                desc: "Reduce intake of processed snacks, sugary drinks, and excessive salt for better health maintenance."
            }
        ];
    }

    if (bmi > 25) {
        recommendations.push({
            title: "Weight Management",
            desc: "Focus on portion control and calorie-dense nutrient-rich foods. Consider consulting a nutritionist for a personalized plan."
        });
    }

    const html = '<ul class="recommendation-list">' + 
        recommendations.map(rec => `
            <li class="recommendation-item">
                <strong>${rec.title}</strong>
                <p>${rec.desc}</p>
            </li>
        `).join('') + 
        '</ul>';

    dietContainer.innerHTML = html;
}

// Function to generate exercise recommendations
function generateExerciseRecommendations(formData, prediction) {
    const exerciseContainer = document.getElementById('exerciseRecommendations');
    const hasRegularExercise = formData.regExercise === 1;
    const hasHighRisk = prediction === 1;
    const bmi = parseFloat(formData.bmi);
    
    let recommendations = [];

    if (hasHighRisk) {
        recommendations = [
            {
                title: "Cardio Exercises (5 days/week)",
                desc: "30-45 minutes of brisk walking, jogging, cycling, or swimming. This helps with insulin sensitivity and weight management."
            },
            {
                title: "Strength Training (3 days/week)",
                desc: "Focus on bodyweight exercises, resistance bands, or light weights. Build muscle to improve metabolism and hormone balance."
            },
            {
                title: "Yoga & Stretching (Daily)",
                desc: "Practice yoga poses like Butterfly, Cobra, and Child's pose. These reduce stress and improve hormonal balance."
            },
            {
                title: "High-Intensity Interval Training (2-3 days/week)",
                desc: "Short bursts of intense exercise followed by rest. Excellent for improving insulin resistance."
            },
            {
                title: "Stress-Relief Activities",
                desc: "Meditation, deep breathing exercises, or gentle walking. Stress management is crucial for PCOS management."
            },
            {
                title: "Consistency is Key",
                desc: "Start slowly and gradually increase intensity. Even 15 minutes daily is better than nothing."
            }
        ];
    } else {
        recommendations = [
            {
                title: "Regular Physical Activity",
                desc: "Aim for 150 minutes of moderate exercise per week. This includes walking, jogging, or any activity you enjoy."
            },
            {
                title: "Strength Training",
                desc: "Include 2-3 sessions per week to maintain muscle mass and bone health."
            },
            {
                title: "Flexibility Exercises",
                desc: "Practice yoga or stretching to improve flexibility and reduce stress."
            },
            {
                title: "Stay Active Throughout the Day",
                desc: "Take stairs, walk during breaks, and avoid prolonged sitting."
            },
            {
                title: "Fun Activities",
                desc: "Dance, swim, play sports, or any activity that keeps you moving and motivated."
            }
        ];
    }

    if (!hasRegularExercise) {
        recommendations.unshift({
            title: "Start Gradually",
            desc: "Begin with 10-15 minutes of light activity daily. Gradually increase duration and intensity over weeks."
        });
    }

    if (bmi > 30) {
        recommendations.push({
            title: "Low-Impact Exercises",
            desc: "Focus on swimming, cycling, or walking to protect joints while promoting weight loss. Consult a fitness professional."
        });
    }

    const html = '<ul class="recommendation-list">' + 
        recommendations.map(rec => `
            <li class="recommendation-item">
                <strong>${rec.title}</strong>
                <p>${rec.desc}</p>
            </li>
        `).join('') + 
        '</ul>';

    exerciseContainer.innerHTML = html;
}

// Function to generate lifestyle recommendations
function generateLifestyleRecommendations(formData, prediction) {
    const lifestyleContainer = document.getElementById('lifestyleRecommendations');
    const hasHighRisk = prediction === 1;
    const bmi = parseFloat(formData.bmi);
    
    let recommendations = [];

    if (hasHighRisk) {
        recommendations = [
            {
                title: "Sleep Quality (7-9 hours daily)",
                desc: "Maintain a consistent sleep schedule. Poor sleep can worsen insulin resistance and hormonal imbalances in PCOS."
            },
            {
                title: "Stress Management",
                desc: "Practice meditation, deep breathing, or mindfulness for 15-20 minutes daily. Chronic stress elevates cortisol, worsening PCOS symptoms."
            },
            {
                title: "Avoid Smoking & Alcohol",
                desc: "Both smoking and excessive alcohol can increase insulin resistance and inflammation, making PCOS symptoms worse."
            },
            {
                title: "Regular Health Check-ups",
                desc: "Monitor blood sugar, cholesterol, and hormone levels every 3-6 months. Early detection prevents complications."
            },
            {
                title: "Maintain Healthy Weight",
                desc: "Even a 5-10% weight loss can significantly improve PCOS symptoms and restore regular periods."
            },
            {
                title: "Limit Screen Time Before Bed",
                desc: "Avoid screens 1-2 hours before sleep. Blue light disrupts melatonin production and sleep quality."
            },
            {
                title: "Stay Hydrated",
                desc: "Drink 8-10 glasses of water daily. Proper hydration supports metabolism and helps manage PCOS symptoms."
            },
            {
                title: "Build a Support System",
                desc: "Join PCOS support groups or connect with others. Emotional support is crucial for managing chronic conditions."
            }
        ];
    } else {
        recommendations = [
            {
                title: "Maintain Regular Sleep Schedule",
                desc: "Aim for 7-9 hours of quality sleep each night. Consistent sleep helps maintain hormonal balance."
            },
            {
                title: "Stress Management Practices",
                desc: "Incorporate relaxation techniques like yoga, meditation, or hobbies you enjoy to manage daily stress."
            },
            {
                title: "Limit Alcohol & Avoid Smoking",
                desc: "Keep alcohol consumption moderate and avoid smoking to maintain optimal health."
            },
            {
                title: "Regular Health Screenings",
                desc: "Get annual check-ups and preventive screenings to catch any issues early."
            },
            {
                title: "Maintain Active Lifestyle",
                desc: "Stay physically active throughout the day. Take breaks from sitting, walk regularly, and stay engaged."
            },
            {
                title: "Social Connections",
                desc: "Maintain strong social connections with family and friends. Good relationships support mental and physical health."
            },
            {
                title: "Work-Life Balance",
                desc: "Create boundaries between work and personal time. Overwork and burnout negatively impact health."
            },
            {
                title: "Stay Hydrated",
                desc: "Drink adequate water throughout the day for optimal body function and energy levels."
            }
        ];
    }

    // Add specific lifestyle recommendations based on symptoms
    if (formData.fastFood) {
        recommendations.push({
            title: "Reduce Fast Food Consumption",
            desc: "Gradually replace fast food with home-cooked meals. Plan and prep meals in advance to avoid unhealthy choices."
        });
    }

    if (formData.weightGain && bmi > 25) {
        recommendations.push({
            title: "Mindful Eating Practices",
            desc: "Eat slowly, avoid distractions during meals, and listen to hunger cues. This helps prevent overeating and supports weight management."
        });
    }

    const html = '<ul class="recommendation-list">' + 
        recommendations.map(rec => `
            <li class="recommendation-item">
                <strong>${rec.title}</strong>
                <p>${rec.desc}</p>
            </li>
        `).join('') + 
        '</ul>';

    lifestyleContainer.innerHTML = html;
}

// Form submit
document.getElementById("predictionForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Show loading state
    const btn = document.getElementById("predictBtn");
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.loading').style.display = 'flex';
    
    document.getElementById("resultsSection").style.display = "block";
    document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth' });
    document.getElementById("riskLevel").textContent = "Analyzing...";

    // Hide recommendations and button until prediction is complete
    document.getElementById("recommendationsSection").style.display = "none";
    document.getElementById("recommendationButtonContainer").style.display = "none";

    // Collect form data - matching Flask backend expectations
    const formData = {
        age: parseInt(document.getElementById("age").value),
        weight: parseFloat(document.getElementById("weight").value),
        height: parseInt(document.getElementById("height").value),
        bmi: parseFloat(document.getElementById("bmi").value),
        bloodGroup: document.getElementById("bloodGroup").value,
        marriageStatus: parseInt(document.getElementById("marriageStatus").value) || 0,
        
        pulseRate: parseInt(document.getElementById("pulseRate").value) || null,
        respiratoryRate: parseInt(document.getElementById("respiratoryRate").value) || null,
        hb: parseFloat(document.getElementById("hb").value) || null,
        bpSystolic: parseInt(document.getElementById("bpSystolic").value) || null,
        bpDiastolic: parseInt(document.getElementById("bpDiastolic").value) || null,
        
        cycle: document.getElementById("cycle").value,
        cycleLength: parseInt(document.getElementById("cycleLength").value) || null,
        pregnant: document.getElementById("pregnant").value,
        abortions: parseInt(document.getElementById("abortions").value) || 0,
        
        betaHCG1: parseFloat(document.getElementById("betaHCG1").value) || null,
        betaHCG2: parseFloat(document.getElementById("betaHCG2").value) || null,
        fsh: parseFloat(document.getElementById("fsh").value) || null,
        lh: parseFloat(document.getElementById("lh").value) || null,
        tsh: parseFloat(document.getElementById("tsh").value) || null,
        amh: parseFloat(document.getElementById("amh").value) || null,
        prl: parseFloat(document.getElementById("prl").value) || null,
        vitD3: parseFloat(document.getElementById("vitD3").value) || null,
        prg: parseFloat(document.getElementById("prg").value) || null,
        rbs: parseInt(document.getElementById("rbs").value) || null,
        
        hip: parseFloat(document.getElementById("hip").value) || null,
        waist: parseFloat(document.getElementById("waist").value) || null,
        
        follicleNoL: parseInt(document.getElementById("follicleNoL").value) || null,
        follicleNoR: parseInt(document.getElementById("follicleNoR").value) || null,
        avgFSizeL: parseFloat(document.getElementById("avgFSizeL").value) || null,
        avgFSizeR: parseFloat(document.getElementById("avgFSizeR").value) || null,
        endometrium: parseFloat(document.getElementById("endometrium").value) || null,
        
        weightGain: document.getElementById("weightGain").checked ? 1 : 0,
        hairGrowth: document.getElementById("hairGrowth").checked ? 1 : 0,
        skinDarkening: document.getElementById("skinDarkening").checked ? 1 : 0,
        hairLoss: document.getElementById("hairLoss").checked ? 1 : 0,
        pimples: document.getElementById("pimples").checked ? 1 : 0,
        fastFood: document.getElementById("fastFood").checked ? 1 : 0,
        regExercise: document.getElementById("regExercise").checked ? 1 : 0
    };

    console.log("Sending data to Flask:", formData);

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Received result:", result);

        // Update UI with results
        const riskLevel = result.prediction === 1 ? "High Risk for PCOS" : "Low Risk for PCOS";
        const riskColor = result.prediction === 1 ? "#FF6B9D" : "#28a745";
        
        document.getElementById("riskLevel").textContent = riskLevel;
        document.getElementById("riskLevel").style.color = riskColor;
        
        document.getElementById("riskDescription").textContent = 
            result.prediction === 1 ? 
            "Based on the analysis, there are indicators suggesting PCOS risk. Please consult a healthcare provider." :
            "Based on the analysis, the risk indicators for PCOS appear low.";

        const confidence = Math.round(result.confidence * 100);
        document.getElementById("confidencePercentage").textContent = confidence + "%";
        document.getElementById("confidenceFill").style.width = confidence + "%";
        document.getElementById("confidenceDescription").textContent = 
            `Model confidence: ${confidence}%`;

        // Risk factors based on form input
        const riskFactorsList = document.getElementById("riskFactorsList");
        riskFactorsList.innerHTML = "";
        
        const riskIndicators = [];
        if (formData.weightGain) riskIndicators.push({factor: "Weight Gain", impact: "high"});
        if (formData.hairGrowth) riskIndicators.push({factor: "Excessive Hair Growth", impact: "high"});
        if (formData.skinDarkening) riskIndicators.push({factor: "Skin Darkening", impact: "medium"});
        if (formData.hairLoss) riskIndicators.push({factor: "Hair Loss", impact: "medium"});
        if (formData.pimples) riskIndicators.push({factor: "Acne/Pimples", impact: "medium"});
        if (formData.cycle === "I") riskIndicators.push({factor: "Irregular Menstrual Cycle", impact: "high"});
        if (formData.fastFood) riskIndicators.push({factor: "Regular Fast Food Consumption", impact: "low"});
        
        if (formData.bmi > 25) {
            riskIndicators.push({
                factor: `High BMI (${formData.bmi})`, 
                impact: formData.bmi > 30 ? "high" : "medium"
            });
        }

        if (riskIndicators.length === 0) {
            riskFactorsList.innerHTML = '<div class="risk-factor-item"><span>No major risk factors identified</span><span class="factor-impact low-impact">Low</span></div>';
        } else {
            riskIndicators.forEach(({factor, impact}) => {
                riskFactorsList.innerHTML += `
                    <div class="risk-factor-item">
                        <span>${factor}</span>
                        <span class="factor-impact ${impact}-impact">
                            ${impact.charAt(0).toUpperCase() + impact.slice(1)}
                        </span>
                    </div>`;
            });
        }

        // Show the "Get Recommendations" button after prediction
        document.getElementById("recommendationButtonContainer").style.display = "block";

        // Store formData and prediction for later use
        window.savedFormData = formData;
        window.savedPrediction = result.prediction;

    } catch (err) {
        console.error("Error:", err);
        document.getElementById("riskLevel").textContent = "Connection Error";
        document.getElementById("riskDescription").textContent = 
            "Failed to connect to the prediction service. Please ensure the Flask server is running on port 5000.";
        alert(`Error: ${err.message}\n\nMake sure Flask server is running at http://127.0.0.1:5000`);
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').style.display = 'inline';
        btn.querySelector('.loading').style.display = 'none';
    }
});

// Handle "Get Recommendations" button click
document.getElementById("getRecommendationsBtn").addEventListener("click", function() {
    // Generate recommendations using saved data
    generateDietRecommendations(window.savedFormData, window.savedPrediction);
    generateExerciseRecommendations(window.savedFormData, window.savedPrediction);
    generateLifestyleRecommendations(window.savedFormData, window.savedPrediction);
    
    // Show recommendations section with animation
    document.getElementById("recommendationsSection").style.display = "block";
    
    // Smooth scroll to recommendations
    setTimeout(() => {
        document.getElementById("recommendationsSection").scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
});