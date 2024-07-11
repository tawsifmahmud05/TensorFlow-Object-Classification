const img = document.getElementById("img");
const fileInput = document.getElementById("file-input");
const resultsDiv = document.getElementById("results");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");

const imageButton = document.getElementById("image-button");
const videoButton = document.getElementById("video-button");

const imageSection = document.getElementById("image-section");
const videoSection = document.getElementById("video-section");

const startVideoButton = document.getElementById("start-video");
const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
const stopVideoButton = document.getElementById("stop-video");

let videoStream;

imageButton.addEventListener("click", () => {
  imageSection.style.display = "block";
  videoSection.style.display = "none";
  imageButton.style.display = "none";
  videoButton.style.display = "block";
  resultsDiv.innerHTML = ""; // Clear previous results
  errorDiv.innerHTML = ""; // Clear previous errors
  stopVideoClassification();
  stopVideoStream();
});
videoButton.addEventListener("click", () => {
  videoSection.style.display = "block";
  imageSection.style.display = "none";
  videoButton.style.display = "none";
  imageButton.style.display = "block";
  resultsDiv.innerHTML = ""; // Clear previous results
  errorDiv.innerHTML = ""; // Clear previous errors
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    img.src = e.target.result;
    img.style.display = "block";
    classifyImage();
  };
  reader.readAsDataURL(file);
});

async function classifyImage() {
  resultsDiv.innerHTML = ""; // Clear previous results
  errorDiv.innerHTML = ""; // Clear previous errors
  loadingDiv.style.display = "block";

  try {
    const model = await mobilenet.load();
    const predictions = await model.classify(img);
    displayResults(predictions);
  } catch (error) {
    errorDiv.innerText =
      "Error loading or classifying image. Please try again.";
  } finally {
    loadingDiv.style.display = "none";
  }
}

function displayResults(predictions) {
  predictions.forEach((prediction) => {
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("result");

    const className = document.createElement("div");
    className.classList.add("class-name");
    className.innerText = `Class Name: ${prediction.className}`;

    const probability = document.createElement("div");
    probability.innerText = `Probability: ${(
      prediction.probability * 100
    ).toFixed(2)}%`;

    resultDiv.appendChild(className);
    resultDiv.appendChild(probability);
    resultsDiv.appendChild(resultDiv);
  });
}
startVideoButton.addEventListener("click", () => {
  startVideoStream();
});
stopVideoButton.addEventListener("click", stopVideoClassification);

async function startVideoStream() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = videoStream;
    startVideoClassification();
  } catch (error) {
    errorDiv.innerText = "Error accessing video stream. Please try again.";
  }
}

function startVideoClassification() {
  classifyInterval = setInterval(async () => {
    resultsDiv.innerHTML = ""; // Clear previous results
    errorDiv.innerHTML = ""; // Clear previous errors
    loadingDiv.style.display = "block";
    // canvas.style.display = "none";

    try {
      // const context = canvas.getContext("2d");
      // context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const model = await mobilenet.load();
      const predictions = await model.classify(video);
      console.log(predictions);
      displayResults(predictions);
    } catch (error) {
      errorDiv.innerText = "Error classifying video. Please try again.";
    } finally {
      loadingDiv.style.display = "none";
      // canvas.style.display = "block";
    }
  }, 5000);
}

function stopVideoClassification() {
  stopVideoStream();
  clearInterval(classifyInterval);
  // canvas.style.display = "none";
  resultsDiv.innerHTML = ""; // Clear previous results
  errorDiv.innerHTML = ""; // Clear previous errors
}

function stopVideoStream() {
  if (videoStream) {
    const tracks = videoStream.getTracks();
    tracks.forEach((track) => track.stop());
  }
  const video = document.getElementById("video");
  video.srcObject = null;
}
