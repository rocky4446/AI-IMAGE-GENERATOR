



const themeToggle = document.querySelector(".theme-toggle");
const icon = document.querySelector(".theme-toggle i");

// Load theme and icon from localStorage
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "dark-theme";
    document.body.classList.toggle("dark-theme", savedTheme === "dark-theme");
    
    const savedIcon = localStorage.getItem("icon") || "fa-moon";
    icon.classList.remove("fa-moon", "fa-sun");
    icon.classList.add(savedIcon);
});

const toggleTheme = () => {
    document.body.classList.toggle("dark-theme");
    
    if (icon.classList.contains("fa-moon")) {
        icon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("icon", "fa-sun");
        localStorage.setItem("theme", "light-theme");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("icon", "fa-moon");
        localStorage.setItem("theme", "dark-theme");
    }
};

themeToggle.addEventListener("click", toggleTheme);


const promptBtn  = document.querySelector('.prompt-btn');
const promptForm = document.querySelector('.prompt-form');
const promptInput = document.querySelector('.prompt-input');
const modelSelect = document.getElementById('model-select');
const countSelect = document.getElementById('count-select');
const ratioSelect = document.getElementById('ratio-select');
const gridGallery = document.querySelector('.gallery-grid');
const API_KEY = "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";



const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
  ];

  promptBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * examplePrompts.length);
    promptInput.value = examplePrompts[randomIndex];
    promptInput.focus();
  });


  const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    // Ensure dimensions are multiples of 16
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return { width: calculatedWidth, height: calculatedHeight };
};


const updateImageCard = (imgIndex, imgUrl) => {
 const imgCard = document.getElementById(`img-card-${imgIndex}`);
 if (imgCard) {
     imgCard.classList.remove("loading");
     imgCard.innerHTML = `<img src="${imgUrl}" alt="" class="result-img">
                        <div class="img-overlay">
                            <a class="img-download-btn" href="${imgUrl}" download="image-${imgIndex + 1}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`
 }
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    const { width, height } = getImageDimensions(aspectRatio);  // Fixed this line

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,  // Fixed template literal
                    "Content-Type": "application/json",
                    "x-use-cache": "false"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width, height },
                }),
            });

            if (!response.ok) throw new Error((await response.json())?.error);
            
            const result = await response.blob();
            const imgUrl = URL.createObjectURL(result);
            updateImageCard(i, imgUrl);
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.allSettled(imagePromises);
};


const createImageCards = async (selectedModel, imageCount, aspectRatio, promptText) => {
    let imgCardsHTML = "";
    for (let i = 0; i < imageCount; i++) {
        imgCardsHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <p class="status-text">Generating...</p>
                </div>
                <img src="test.png" alt="" class="result-img">
            </div>`;
    }
    gridGallery.innerHTML += imgCardsHTML;
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
}

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const selectedModel = modelSelect.value;
        const imageCount = countSelect.value || 1;
        const aspectRatio = ratioSelect.value || '1/1';
        const promptText = promptInput.value.trim();
        createImageCards(selectedModel, imageCount, aspectRatio, promptText);
    };

    promptForm.addEventListener('submit', handleFormSubmit);