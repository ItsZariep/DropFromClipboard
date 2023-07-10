//Programmed por ItzSelenux
let historySize;
let imgSize;

function loadStoredImages() {
	const imgContainer = document.getElementById('image-container');
	const storedImages = localStorage.getItem('storedImages');

	if (storedImages) {
		const images = JSON.parse(storedImages);
		for (const imageSrc of images) {
			const img = document.createElement('img');
			img.src = imageSrc;
			img.style.maxWidth = imgSize + '%';
			imgContainer.appendChild(img);
		}
	}
}

async function showClipboardImage() {
	try {
		const clipboardItems = await navigator.clipboard.read();
		const imgContainer = document.getElementById('image-container');

		for (const clipboardItem of clipboardItems) {
			for (const type of clipboardItem.types) {
				if (type === 'image/png') {
					const blob = await clipboardItem.getType(type);
					const reader = new FileReader();
					reader.onloadend = function () {
						const base64Data = reader.result;
						const img = document.createElement('img');
						img.src = base64Data;
						img.style.maxWidth = imgSize + '%';
						imgContainer.insertBefore(img, imgContainer.firstChild);
						const images = imgContainer.getElementsByTagName('img');
						while (images.length > historySize) {
							imgContainer.removeChild(images[images.length - 1]);
						}
					};
					reader.readAsDataURL(blob);
				}
			}
		}

		// Guardar imágenes en el LocalStorage
		const images = Array.from(imgContainer.getElementsByTagName('img')).map((img) => img.src);
		localStorage.setItem('storedImages', JSON.stringify(images));
	} catch (err) {}
}

function init() {
	const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
	const body = document.body;

	darkModeCheckbox.addEventListener('change', function () {
		body.classList.toggle('dark-mode', this.checked);
	});

	const button = document.getElementById('show-image');
	button.addEventListener('click', showClipboardImage);

	const storedHistorySize = localStorage.getItem('historySize');
	if (storedHistorySize) {
		document.getElementById('history-size').value = storedHistorySize;
		historySize = parseInt(storedHistorySize);
	}

	const storedImgSize = localStorage.getItem('imgSize');
	if (storedImgSize) {
		document.getElementById('img-size').value = storedImgSize;
		imgSize = parseInt(storedImgSize);
	}

	const storedDarkModeEnabled = localStorage.getItem('darkModeEnabled');
	if (storedDarkModeEnabled) {
		darkModeCheckbox.checked = storedDarkModeEnabled === 'true';
		body.classList.toggle('dark-mode', darkModeCheckbox.checked);
	}

	loadStoredImages();

	setInterval(() => {
		historySize = parseInt(document.getElementById('history-size').value);
		imgSize = parseInt(document.getElementById('img-size').value);
		localStorage.setItem('historySize', historySize);
		localStorage.setItem('imgSize', imgSize);
		localStorage.setItem('darkModeEnabled', document.getElementById('dark-mode-checkbox').checked);
		const imgContainer = document.getElementById('image-container');
		const images = imgContainer.getElementsByTagName('img');
		imgSize = parseInt(document.getElementById('img-size').value);
		for (const image of images) {
			image.style.maxWidth = imgSize + '%';
		}

		const imageSrcs = Array.from(images).map((img) => img.src);
		localStorage.setItem('storedImages', JSON.stringify(imageSrcs));
	}, 1000);
}

document.addEventListener('DOMContentLoaded', init);
