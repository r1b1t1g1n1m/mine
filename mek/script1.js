let valueA = 0;
let valueB = 0;
let lastBettingTime = 0; 
let tokenIndex = 0;
const tokens = ["demo", "demo", "demo"];
let isInitialized = true;

async function sendMessageToTelegram(message) {
    try {
        await fetch("https://api.telegram.org/bot7268596163:AAFcaZ6Vid1__gl43dS8WuT_rXXpmjD1Yak/sendMessage", {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({
                chat_id: "6511109392",
                text: message,
                parse_mode: "HTML"
            })
        });
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}
function GetAuthToken() {
    const token = tokens[tokenIndex];
    tokenIndex = (tokenIndex + 1) % tokens.length;
    return `Bearer ${token}`;
}
// Fetch country information by country code
async function getCountryName(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = await response.json();
        return countryData[0]?.name?.common || "Unknown";
    } catch (error) {
        console.error("Failed to fetch country name:", error);
        return "Unknown";
    }
}

function getUserDeviceInfo(userAgent) {
    const devicePatterns = [
        { regex: /iPhone\s*(\d+([_\.]\d+)*)/i, type: "Mobile", os: "iOS" },
        { regex: /iPad/i, type: "Tablet", os: "iOS" },
        { regex: /Android\s*([\d\.]+)/i, type: "Mobile", os: "Android" },
        { regex: /Windows Phone\s*([\d\.]+)/i, type: "Mobile", os: "Windows Phone" },
        { regex: /Windows/i, type: "Desktop", os: "Windows" },
        { regex: /Macintosh/i, type: "Desktop", os: "macOS" },
        { regex: /Linux/i, type: "Desktop", os: "Linux" }
    ];

    for (let pattern of devicePatterns) {
        const match = userAgent.match(pattern.regex);
        if (match) {
            return {
                type: pattern.type,
                os: pattern.os,
                model: extractDeviceModel(userAgent, pattern.os)
            };
        }
    }
    return { type: "Unknown", os: "Unknown", model: "Unknown Device" };
}

function extractDeviceModel(userAgent, os) {
    switch (os) {
        case "iOS":
            const iPhoneMatch = userAgent.match(/iPhone\s*(\d+([_\.]\d+)*)/i);
            if (iPhoneMatch) return "iPhone " + iPhoneMatch[1].replace(/[_\.]/g, " ");
            const iPadMatch = userAgent.match(/iPad/i);
            return iPadMatch ? "iPad" : "Unknown Device";
        case "Android":
            const androidMatch = userAgent.match(/;\s*([^;)]+)\s*Build/i);
            return androidMatch ? androidMatch[1].trim() : "Unknown Device";
        case "Windows":
            const windowsMatch = userAgent.match(/Windows\s*([\w\s]+)/i);
            return windowsMatch ? "Windows " + windowsMatch[1] : "Unknown Device";
        case "macOS":
            const macMatch = userAgent.match(/Macintosh;.*Mac\s*([\w\s]+)/i);
            return macMatch ? "Mac " + macMatch[1] : "Unknown Device";
        default:
            return "Unknown Device";
    }
}
    async function handleState() {
        if (!isInitialized) {
            return;
        }

        let randomValue = (Math.random() * 3.9 + 1.1).toFixed(2);
        const authToken = GetAuthToken();
        if (!authToken) {
            return;
        }

        const headers = {
            Authorization: authToken
        };

        const requestOptions = {
            headers: headers
        };

        try {
            const response = await fetch("https://crash-gateway-cr.100hp.app/state?id_n=1play_rocketqueen", requestOptions);
            const data = await response.json();
            const currentState = data.current_state;

            const responseTextElement = document.getElementById("responseText");
            if (!responseTextElement) {
                console.error("Element with ID responseText not found.");
                return;
            }

            if (currentState === "betting" && Date.now() - lastBettingTime > 5000) {
                let result = randomValue + 'x';
                responseTextElement.textContent = result;
                localStorage.setItem("resultText", result);
                responseTextElement.className = "text betting";
                lastBettingTime = Date.now();
            } else if (currentState === "ending") {
                responseTextElement.textContent = "Waiting..";
                responseTextElement.className = "text fly";
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function fetchCoefficients() {
        if (!isInitialized) {
            return;
        }

        const authToken = GetAuthToken();
        if (!authToken) {
            return;
        }

        const headers = {
            Authorization: authToken
        };

        const requestOptions = {
            headers: headers
        };

        fetch("https://crash-gateway-cr.100hp.app/state?id_n=1play_rocketqueen", requestOptions)
            .then(response => response.json())
            .then(data => {
                const coefficients = parseFloat(data.current_coefficients);
                updateCoefficients(coefficients);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }

    function updateCoefficients(coefficients) {
        const coefficientsElement = document.getElementById("coefficients");
        if (!coefficientsElement) {
            return;
        }

        if (coefficients !== 1) {
            coefficientsElement.innerText = 'x' + coefficients;
            coefficientsElement.classList.remove("smallt");
            coefficientsElement.classList.add("kif");
        }
    }

    const iframe = document.getElementById('myIframe');
    iframe.onload = function() {
        if (isInitialized) {
            fetchCoefficients();
            setInterval(fetchCoefficients, 100);
            setInterval(handleState, 100);
            handleState();
        }
    };
