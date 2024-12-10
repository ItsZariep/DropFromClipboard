// Programmmed by ItsZariep

let historySize;
let imgSize;

const DB_NAME = 'ImageStorageDB';
const DB_STORE_NAME = 'images';
let db;

function OpenDB()
{
	return new Promise((resolve, reject) =>
	{
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = function (event)
		{
			db = event.target.result;
			if (!db.objectStoreNames.contains(DB_STORE_NAME))
			{
				db.createObjectStore(DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
			}
		};

		request.onsuccess = function (event)
		{
			db = event.target.result;
			resolve(db);
		};

		request.onerror = function (event)
		{
			reject(event.target.error);
		};
	});
}

function SaveImageToDB(base64Data)
	{
	return new Promise((resolve, reject) =>
	{
		const transaction = db.transaction(DB_STORE_NAME, 'readwrite');
		const store = transaction.objectStore(DB_STORE_NAME);

		store.add({ data: base64Data });

		transaction.oncomplete = function ()
		{
			resolve();
		};

		transaction.onerror = function (event)
		{
			reject(event.target.error);
		};
	});
}

function GetImagesFromDB()
	{
	return new Promise((resolve, reject) =>
	{
		const transaction = db.transaction(DB_STORE_NAME, 'readonly');
		const store = transaction.objectStore(DB_STORE_NAME);

		const request = store.getAll();
		request.onsuccess = function (event)
		{
			resolve(event.target.result);
		};

		request.onerror = function (event)
		{
			reject(event.target.error);
		};
	});
}

function DeleteOldestImageFromDB()
{
	return new Promise((resolve, reject) =>
	{
		const transaction = db.transaction(DB_STORE_NAME, 'readwrite');
		const store = transaction.objectStore(DB_STORE_NAME);

		const request = store.openCursor();
		request.onsuccess = function (event)
		{
			const cursor = event.target.result;
			if (cursor)
			{
				cursor.delete();
				resolve();
			}
			else
			{
				resolve();
			}
		};

		request.onerror = function (event)
		{
			reject(event.target.error);
		};
	});
}

async function LoadStoredImages()
{
	const imgContainer = document.getElementById('image-container');
	const storedImages = await GetImagesFromDB();

	imgContainer.innerHTML = '';
	for (const image of storedImages)
	{
		const img = document.createElement('img');
		img.src = image.data;
		img.style.maxWidth = imgSize + '%';
		imgContainer.appendChild(img);
	}
}

async function ShowClipboardImage()
{
	try {
		const clipboardItems = await navigator.clipboard.read();
		const imgContainer = document.getElementById('image-container');

		for (const clipboardItem of clipboardItems)
		{
			for (const type of clipboardItem.types)
			{
				if (type === 'image/png')
				{
					const blob = await clipboardItem.getType(type);
					const reader = new FileReader();
					reader.onloadend = async function ()
					{
						const base64Data = reader.result;

						await SaveImageToDB(base64Data);

						const img = document.createElement('img');
						img.src = base64Data;
						img.style.maxWidth = imgSize + '%';
						imgContainer.insertBefore(img, imgContainer.firstChild);

						const images = imgContainer.getElementsByTagName('img');
						while (images.length > historySize) {
							imgContainer.removeChild(images[images.length - 1]);
							await DeleteOldestImageFromDB();
						}
					};
					reader.readAsDataURL(blob);
				}
			}
		}
	}
	catch (err)
	{
		console.error(err);
	}
}

function init()
{
	const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
	const body = document.body;

	darkModeCheckbox.addEventListener('change', function ()
	{
		body.classList.toggle('dark-mode', this.checked);
	});

	const button = document.getElementById('show-image');
	button.addEventListener('click', ShowClipboardImage);

	const storedHistorySize = localStorage.getItem('historySize');
	if (storedHistorySize)
	{
		document.getElementById('history-size').value = storedHistorySize;
		historySize = parseInt(storedHistorySize);
	}

	const storedImgSize = localStorage.getItem('imgSize');
	if (storedImgSize)
	{
		document.getElementById('img-size').value = storedImgSize;
		imgSize = parseInt(storedImgSize);
	}

	const storedDarkModeEnabled = localStorage.getItem('darkModeEnabled');
	if (storedDarkModeEnabled)
	{
		darkModeCheckbox.checked = storedDarkModeEnabled === 'true';
		body.classList.toggle('dark-mode', darkModeCheckbox.checked);
	}

	OpenDB().then(() => LoadStoredImages());

	setInterval(() =>
	{
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
	}, 1000);
}

document.addEventListener('DOMContentLoaded', init);
